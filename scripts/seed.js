const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Load environment variables
dotenv.config();

const products = [
  {
    name: 'AeroSound Max Headphones',
    description: 'Experience premium sound quality with active noise-cancelling technology, 40-hour battery life, and ultra-comfortable memory foam earcups.',
    category: 'Electronics',
    price: 14999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Horizon Smartwatch Series 5',
    description: 'Stay connected and monitor your health with features including a blood oxygen sensor, real-time heart rate monitoring, sleep analysis, and built-in GPS.',
    category: 'Electronics',
    price: 19999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Nomad Canvas Backpack',
    description: 'Designed for commuters and explorers alike, this heavy-duty waterproof canvas backpack features dedicated laptop padding and multiple pockets.',
    category: 'Accessories',
    price: 4999,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'VaporFit Running Shoes',
    description: 'Engineered with lightweight, breathable mesh and reactive foam cushioning for explosive speed and smooth transitions on any running track.',
    category: 'Apparel',
    price: 7999,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Octane Mechanical Keyboard',
    description: 'A hot-swappable 75% mechanical gaming keyboard with responsive tactile switches, custom RGB illumination, and solid aluminum casing.',
    category: 'Electronics',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Lumina Ambient Desk Lamp',
    description: 'Enhance your workspaces with smart LED ambient lighting, integrated gesture controls, and a fast wireless smartphone charger integrated into the base.',
    category: 'Accessories',
    price: 3499,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Zenith Fleece Hoodie',
    description: 'Wrap yourself in premium comfort. Made from double-brushed organic cotton fleece with ribbed detailing and a modern relaxed fit.',
    category: 'Apparel',
    price: 2999,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Terra Hydro Water Flask',
    description: 'Eco-friendly double-walled stainless steel water bottle. Keeps beverages cold for 24 hours or hot for 12 hours. BPA-free leak-proof lid.',
    category: 'Fitness',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'PixelStream 4K Webcam',
    description: 'Ultra-HD webcam with autofocus, dual noise-reducing microphones, and custom mounting clip. Perfect for professional streaming, zoom meetings, and recording.',
    category: 'Electronics',
    price: 4500,
    image: '/images/webcam.png',
  },
  {
    name: 'ZenGrip Yoga Mat',
    description: 'Extra thick, eco-friendly TPE yoga mat with anti-slip texture and laser-engraved body alignment guides. Includes a carrying strap.',
    category: 'Fitness',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'VoltCharge 20K Power Bank',
    description: 'High-capacity 20000mAh portable charger with 22.5W super-fast power delivery, dual USB-C ports, and intelligent LED display.',
    category: 'Electronics',
    price: 2200,
    image: '/images/powerbank.png',
  },
  {
    name: 'AeroBreath Air Purifier',
    description: 'High efficiency air filtration system featuring a medical-grade H13 True HEPA filter, ultra-quiet night mode, and PM2.5 real-time air quality indicator.',
    category: 'Accessories',
    price: 12500,
    image: '/images/airpurifier.png',
  },
  {
    name: 'VaporTrail Windbreaker',
    description: 'Ultra-lightweight, packable running jacket with water-resistant shell, high-vis reflective strips, and zippered secure pockets.',
    category: 'Apparel',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
  },
];

const seedDatabase = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codealpha_ecommerce');
    console.log('Database connected successfully.');

    // Clear existing products and orders
    console.log('Clearing old products and orders...');
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('Old products and orders cleared.');

    // Insert new products
    console.log('Inserting seed products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${createdProducts.length} products!`);

    mongoose.connection.close();
    console.log('Database connection closed. Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
