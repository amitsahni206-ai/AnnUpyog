const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  donorName: String,
  donorPhone: String,   // New Field
  foodItem: String,
  foodCategory: String, // New Field (Veg/Non-Veg/etc)
  quantity: String,
  expiryTime: String,
  address: String,
  status: { type: String, default: 'pending' },
  image: String
});

module.exports = mongoose.model('Food', FoodSchema,'foods');  