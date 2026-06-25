const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const config = require('../src/config/validateEnv');
const { logger } = require('../src/monitoring/logger');

const pool = new Pool({
  connectionString: config.get('database.url'),
});

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database seeding...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Seed gifts
    const gifts = [
      {
        name: 'Умная колонка Яндекс Станция Миди',
        description: 'Голосовой помощник Алиса, качественный звук, управление умным домом',
        category: 'electronics',
        price: 7990,
        oldPrice: 9990,
        image: 'https://images.unsplash.com/photo-1543512214-318c7553f230',
        rating: 4.8,
        tags: ['технологии', 'музыка', 'умный дом'],
        isPopular: true,
        discount: 20,
      },
      {
        name: 'Подарочная карта Ozon',
        description: 'Универсальный подарок на любую сумму. Получатель сам выберет то, что хочет',
        category: 'gift_cards',
        price: 3000,
        rating: 4.9,
        tags: ['универсальный', 'практичный'],
        isPopular: true,
      },
      {
        name: 'Набор для вязания премиум',
        description: 'Все необходимое для начинающих и профессионалов: пряжа, спицы, схемы, аксессуары',
        category: 'hobbies',
        price: 3500,
        oldPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2',
        rating: 4.7,
        tags: ['творчество', 'рукоделие', 'подарок'],
        discount: 30,
      },
      {
        name: 'Сертификат на СПА-процедуры',
        description: 'Расслабляющие процедуры в лучшем СПА-центре города',
        category: 'wellness',
        price: 5000,
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
        rating: 4.8,
        tags: ['релакс', 'здоровье', 'забота'],
        isPopular: true,
      },
      {
        name: 'Наушники Sony WH-1000XM5',
        description: 'Лучшие беспроводные наушники с шумоподавлением',
        category: 'electronics',
        price: 29990,
        oldPrice: 34990,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb',
        rating: 4.9,
        tags: ['аудио', 'технологии', 'подарок'],
        isPopular: true,
        discount: 14,
      },
      {
        name: 'Книга "Искусство подарка"',
        description: 'Вдохновляющая книга о том, как выбирать идеальные подарки',
        category: 'books',
        price: 890,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
        rating: 4.6,
        tags: ['книги', 'познавательно', 'вдохновение'],
      },
      {
        name: 'Настольная игра "Манчкин"',
        description: 'Веселая карточная игра для большой компании',
        category: 'toys',
        price: 1990,
        image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffb09',
        rating: 4.8,
        tags: ['игры', 'развлечения', 'компания'],
        isPopular: true,
      },
      {
        name: 'Парфюм Tom Ford',
        description: 'Роскошный аромат для особенных случаев',
        category: 'beauty',
        price: 15990,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601',
        rating: 4.7,
        tags: ['парфюм', 'люкс', 'подарок'],
      },
    ];
    
    for (const gift of gifts) {
      await client.query(
        `INSERT INTO gifts (name, description, category, price, old_price, image, rating, tags, is_popular, discount, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          gift.name,
          gift.description,
          gift.category,
          gift.price,
          gift.oldPrice || null,
          gift.image || null,
          gift.rating,
          gift.tags,
          gift.isPopular || false,
          gift.discount || 0,
        ]
      );
    }
    
    logger.info(`Seeded ${gifts.length} gifts`);
    
    // Seed marketplaces
    const marketplaces = [
      {
        name: 'М.Видео',
        address: 'ул. Тверская, 15, Москва',
        lat: 55.757,
        lng: 37.609,
        phone: '+7 (495) 123-45-67',
        website: 'https://mvideo.ru',
        hours: {
          'Пн-Пт': '10:00-21:00',
          'Сб-Вс': '10:00-20:00',
        },
        products: ['electronics', 'gadgets', 'appliances'],
      },
      {
        name: 'Ozon Fresh',
        address: 'Ленинградский пр-т, 80, Москва',
        lat: 55.796,
        lng: 37.573,
        phone: '+7 (495) 234-56-78',
        website: 'https://ozon.ru',
        hours: {
          'Пн-Вс': '09:00-22:00',
        },
        products: ['books', 'toys', 'gifts'],
      },
      {
        name: 'Подорожник',
        address: 'ул. Арбат, 20, Москва',
        lat: 55.751,
        lng: 37.590,
        phone: '+7 (495) 345-67-89',
        website: 'https://podorozhnik.ru',
        hours: {
          'Пн-Вс': '11:00-20:00',
        },
        products: ['souvenirs', 'cards', 'gifts'],
      },
      {
        name: 'DNS Shop',
        address: 'Кутузовский пр-т, 32, Москва',
        lat: 55.740,
        lng: 37.540,
        phone: '+7 (495) 456-78-90',
        website: 'https://dns-shop.ru',
        hours: {
          'Пн-Вс': '10:00-21:00',
        },
        products: ['electronics', 'computers', 'gadgets'],
      },
    ];
    
    for (const store of marketplaces) {
      await client.query(
        `INSERT INTO marketplaces (name, address, location, phone, website, hours, products)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          store.name,
          store.address,
          store.lng,
          store.lat,
          store.phone,
          store.website,
          JSON.stringify(store.hours),
          store.products,
        ]
      );
    }
    
    logger.info(`Seeded ${marketplaces.length} marketplaces`);
    
    // Seed admin user (password: Admin123!)
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      ['admin@giftwizard.com', hashedPassword, 'Administrator', 'admin']
    );
    
    logger.info('Seeded admin user');
    
    // Commit transaction
    await client.query('COMMIT');
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run seeding if executed directly
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;