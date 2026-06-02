const nodemailer = require('nodemailer');
const { createQueue } = require('../src/services/queueService');
const config = require('../src/config/validateEnv');
const { logger } = require('../src/monitoring/logger');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: config.get('email.smtpHost'),
  port: config.get('email.smtpPort'),
  secure: false,
  auth: {
    user: config.get('email.smtpUser'),
    pass: config.get('email.smtpPass'),
  },
});

const processor = async (job) => {
  const { to, subject, template, data } = job.data;
  
  logger.info(`Processing email job ${job.id}`, { to, subject });
  
  try {
    // Generate email HTML from template
    const html = generateEmailTemplate(template, data);
    
    await transporter.sendMail({
      from: `"GiftWizard" <${config.get('email.smtpUser')}>`,
      to,
      subject,
      html,
    });
    
    logger.info(`Email job ${job.id} completed`);
    
    return { success: true, messageId: job.id };
  } catch (error) {
    logger.error(`Email job ${job.id} failed:`, error);
    throw error;
  }
};

const generateEmailTemplate = (template, data) => {
  const templates = {
    welcome: `
      <h1>Добро пожаловать в GiftWizard!</h1>
      <p>Здравствуйте, ${data.name}!</p>
      <p>Спасибо за регистрацию. Теперь вы можете:</p>
      <ul>
        <li>Сохранять любимые подарки</li>
        <li>Получать персональные рекомендации</li>
        <li>Просматривать историю поиска</li>
      </ul>
      <a href="https://giftwizard.com/quiz">Начать подбор подарка →</a>
    `,
    recommendations: `
      <h1>Ваши персональные рекомендации</h1>
      <p>Здравствуйте, ${data.name}!</p>
      <p>Мы подобрали для вас ${data.count} интересных подарков:</p>
      <div>
        ${data.gifts.map(gift => `
          <div style="margin-bottom: 20px;">
            <h3>${gift.name}</h3>
            <p>${gift.description}</p>
            <a href="https://giftwizard.com/gifts/${gift.id}">Подробнее →</a>
          </div>
        `).join('')}
      </div>
    `,
  };
  
  return templates[template] || templates.welcome;
};

// Create email queue
const emailQueue = createQueue('emails', processor, {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
  },
});

logger.info('Email worker started');