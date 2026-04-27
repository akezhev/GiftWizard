const axios = require('axios');
const config = require('../config/validateEnv');
const { logger } = require('../monitoring/logger');
const { addToQueue } = require('./queueService');
const { cacheGet, cacheSet } = require('../config/redis');

class AIService {
  constructor() {
    this.hfToken = config.get('ai.hfToken');
    this.model = config.get('ai.model');
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.model}`;
  }
  
  async generateGiftRecommendations(answers) {
    const cacheKey = `ai:recommendations:${this.getCacheKey(answers)}`;
    
    // Check cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.info('AI recommendations served from cache');
      return cached;
    }
    
    // If not in cache, add to queue for processing
    const job = await addToQueue('ai-recommendations', answers);
    
    // Wait for job to complete (with timeout)
    const result = await this.waitForJob(job);
    
    // Cache the result
    await cacheSet(cacheKey, result, 3600); // Cache for 1 hour
    
    return result;
  }
  
  async processRecommendations(answers) {
    const prompt = this.buildPrompt(answers);
    
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      const recommendations = this.parseResponse(response.data);
      return recommendations;
    } catch (error) {
      logger.error('AI API error:', error);
      // Fallback recommendations
      return this.getFallbackRecommendations(answers);
    }
  }
  
  buildPrompt(answers) {
    const {
      age, gender, hobby, zodiac, occasion, budget, interests, relationship, personality,
    } = answers;
    
    const genderText = gender === 'male' ? 'мужчины' : 'женщины';
    const relationshipText = this.getRelationshipText(relationship);
    
    return `<s>[INST] Ты эксперт по выбору подарков. 
    
Пользователь ищет подарок для ${relationshipText} (возраст: ${age} лет, пол: ${genderText}).
Интересы и хобби: ${hobby}. Дополнительные интересы: ${interests?.join(', ') || 'не указаны'}.
Знак зодиака: ${zodiac}. Повод: ${occasion}. Бюджет: ${budget}. Тип личности: ${personality}.

Пожалуйста, предложи 5 идей подарков. Для каждого подарка укажи:
- Название
- Краткое описание (почему подойдет)
- Примерную цену
- Категорию
- Теги (2-3 ключевых слова)

Ответь строго в формате JSON:
{
  "gifts": [
    {
      "name": "Название подарка",
      "description": "Описание и обоснование",
      "price": "ценовой диапазон или конкретная цена",
      "category": "категория",
      "tags": ["тег1", "тег2"]
    }
  ]
}

Учти бюджет ${budget} и возраст ${age} лет. Дай практичные, актуальные в 2026 году идеи. [/INST]</s>`;
  }
  
  parseResponse(response) {
    try {
      // Extract JSON from response
      let text = '';
      if (Array.isArray(response) && response[0]?.generated_text) {
        text = response[0].generated_text;
      } else if (typeof response === 'string') {
        text = response;
      } else {
        text = JSON.stringify(response);
      }
      
      // Find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.gifts && Array.isArray(parsed.gifts)) {
          return parsed.gifts.map((gift, index) => ({
            id: `ai_${Date.now()}_${index}`,
            ...gift,
            isAIGenerated: true,
          }));
        }
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      return this.getFallbackRecommendations();
    }
  }
  
  getFallbackRecommendations(answers = {}) {
    const fallbacks = [
      {
        name: 'Подарочная карта Ozon',
        description: 'Универсальный подарок, который позволит получателю выбрать то, что ему действительно нужно',
        price: answers.budget || '1000-5000 ₽',
        category: 'gift_cards',
        tags: ['универсальный', 'практичный'],
        isAIGenerated: false,
      },
      {
        name: 'Умная колонка с Алисой',
        description: 'Отличный подарок для любителей технологий и музыки',
        price: '3000-8000 ₽',
        category: 'electronics',
        tags: ['технологии', 'музыка', 'умный дом'],
        isAIGenerated: false,
      },
      {
        name: 'Набор для творчества',
        description: 'Вдохновляющий подарок для творческих людей',
        price: '1000-3000 ₽',
        category: 'hobbies',
        tags: ['творчество', 'хобби', 'рукоделие'],
        isAIGenerated: false,
      },
      {
        name: 'Сертификат на СПА-процедуры',
        description: 'Подарок для релаксации и заботы о себе',
        price: '3000-10000 ₽',
        category: 'wellness',
        tags: ['спа', 'релакс', 'здоровье'],
        isAIGenerated: false,
      },
      {
        name: 'Книга бестселлер',
        description: 'Подарок для любителей чтения',
        price: '500-1500 ₽',
        category: 'books',
        tags: ['книги', 'познавательно', 'интересно'],
        isAIGenerated: false,
      },
    ];
    
    return fallbacks;
  }
  
  getRelationshipText(relationship) {
    const map = {
      partner: 'партнера/партнерши',
      parent: 'родителя',
      child: 'ребенка',
      friend: 'друга/подруги',
      colleague: 'коллеги',
    };
    return map[relationship] || 'близкого человека';
  }
  
  getCacheKey(answers) {
    const { age, gender, hobby, zodiac, occasion, budget } = answers;
    return `${age}:${gender}:${hobby}:${zodiac}:${occasion}:${budget}`;
  }
  
  async waitForJob(job, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Job timeout'));
      }, timeout);
      
      job.finished()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
}

module.exports = new AIService();