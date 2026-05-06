const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return res.status(400).json({ error: 'Validation failed', errors });
    }
    
    next();
  };
};

// Validation schemas
const quizSchema = Joi.object({
  age: Joi.number().min(1).max(120).required(),
  gender: Joi.string().valid('male', 'female').required(),
  hobby: Joi.string().min(2).max(100).required(),
  zodiac: Joi.string().valid(
    'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
    'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
  ).required(),
  occasion: Joi.string().min(2).max(50).required(),
  budget: Joi.string().valid(
    'До 1000 ₽', '1000-3000 ₽', '3000-5000 ₽', 
    '5000-10000 ₽', '10000-20000 ₽', '20000+ ₽'
  ).required(),
  interests: Joi.array().items(Joi.string()).min(1).max(10),
  relationship: Joi.string().valid('partner', 'parent', 'child', 'friend', 'colleague', 'other'),
  personality: Joi.string().valid(
    'Экстраверт', 'Интроверт', 'Романтик', 'Прагматик', 'Креативный', 'Спокойный', 'Активный'
  ),
});

const searchSchema = Joi.object({
  q: Joi.string().min(1).max(200),
  category: Joi.string(),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  sortBy: Joi.string().valid('relevance', 'price_asc', 'price_desc', 'rating'),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0),
});

const geoSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  radius: Joi.number().min(0.5).max(50).default(5),
});

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  name: Joi.string().min(2).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  validate,
  quizSchema,
  searchSchema,
  geoSchema,
  userSchema,
  loginSchema,
};