const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();
const seedUsers = [
{
name: 'John Retailer',
email: 'retailer@test.com',
password: 'password123',
phone: '9876543210',
role: 'retailer',
isVerified: true,
location: {
address: '123 Market Street',
city: 'Mumbai',
state: 'Maharashtra',
pincode: '400001',
coordinates: [72.8777, 19.0760]
},
businessDetails: {
businessName: 'John\'s Grocery Store',
gstin: 'GST123456',
businessType: 'Retail Shop'
}
},
{
name: 'Sarah Wholesaler',
email: 'wholesaler@test.com',
password: 'password123',
phone: '9876543211',
role: 'wholesaler',
isVerified: true,
location: {
address: '456 Warehouse Road',
city: 'Mumbai',
state: 'Maharashtra',
pincode: '400002',
coordinates: [72.8800, 19.0800]
},
businessDetails: {
businessName: 'Sarah\'s Wholesale Hub',
gstin: 'GST789012',
businessType: 'Wholesale'
}
},
{
name: 'Mike Customer',
email: 'customer@test.com',
password: 'password123',
phone: '9876543212',
role: 'customer',
isVerified: true,
location: {
address: '789 Residential Area',
city: 'Mumbai',
state: 'Maharashtra',
pincode: '400003',
coordinates: [72.8850, 19.0850]
}
}
];
const seedProducts = [
{ name: 'Rice - Basmati', category: 'Groceries', price: 120, stock: 500, unit: 'kg', isLocal: true },
{ name: 'Wheat Flour', category: 'Groceries', price: 40, stock: 1000, unit: 'kg' },
{ name: 'Tomatoes', category: 'Vegetables', price: 30, stock: 200, unit: 'kg', isLocal: true },
{ name: 'Onions', category: 'Vegetables', price: 25, stock: 300, unit: 'kg' },
{ name: 'Apples', category: 'Fruits', price: 150, stock: 100, unit: 'kg' },
{ name: 'Bananas', category: 'Fruits', price: 40, stock: 150, unit: 'dozen', isLocal: true },
{ name: 'Milk - Full Cream', category: 'Dairy', price: 55, stock: 200, unit: 'l' },
{ name: 'Bread - Whole Wheat', category: 'Bakery', price: 35, stock: 100, unit: 'piece' },
{ name: 'Tea - Premium', category: 'Beverages', price: 250, stock: 80, unit: 'pack' },
{ name: 'Biscuits Assorted', category: 'Snacks', price: 50, stock: 150, unit: 'pack' },
{ name: 'Potatoes', category: 'Vegetables', price: 20, stock: 400, unit: 'kg' },
{ name: 'Oranges', category: 'Fruits', price: 80, stock: 120, unit: 'kg' },
{ name: 'Yogurt', category: 'Dairy', price: 45, stock: 80, unit: 'pack' },
{ name: 'Coffee Powder', category: 'Beverages', price: 350, stock: 50, unit: 'pack' },
{ name: 'Cooking Oil', category: 'Groceries', price: 180, stock: 200, unit: 'l' }
];
async function seedDatabase() {
try {
await mongoose.connect(process.env.MONGO_URI);
console.log(' MongoDB connected');
// Clear existing data
await User.deleteMany({});
await Product.deleteMany({});
console.log(' Cleared existing data');
// Create users
const users = await User.create(seedUsers);
console.log(` Created ${users.length} users`);
const retailer = users.find(u => u.role === 'retailer');
const wholesaler = users.find(u => u.role === 'wholesaler');
// Create products
const productsWithSellers = seedProducts.map((p, idx) => ({
...p,
description: `High quality ${p.name} available now. Fresh and affordable.`
,
seller: idx % 2 === 0 ? retailer._id : wholesaler._id,
sellerRole: idx % 2 === 0 ? 'retailer' : 'wholesaler',
images: [`https://via.placeholder.com/300?text=${p.name.replace(/\s/g, '+')}`],
localRegion: p.isLocal ? 'Mumbai' : undefined,
tags: p.name.toLowerCase().split(' ')
}));
const products = await Product.create(productsWithSellers);
console.log(` Created ${products.length} products`);
console.log('\n Database seeded successfully!');
console.log('\n Test Credentials:');
console.log('Customer: customer@test.com / password123');
console.log('Retailer: retailer@test.com / password123');
console.log('Wholesaler: wholesaler@test.com / password123');
process.exit(0);
} catch (error) {
console.error(' Error seeding database:', error);
process.exit(1);
}
}
seedDatabase();