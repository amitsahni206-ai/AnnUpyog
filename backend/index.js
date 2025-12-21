const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // Moved up
require('dotenv').config();

const app = express(); // Defined App first

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Make the "uploads" folder public so the frontend can see images
// This MUST come after app is defined
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// --- DATABASE CONNECTION ---
mongoose.connect("mongodb+srv://amitkhpd_db_user:kh2pd_AnnUpyog@annupyog-cluster.qd1nqb0.mongodb.net/?appName=AnnUpyog-Cluster")
  .then(() => console.log("✅ AnnUpyog is now connected to MongoDB!"))
  .catch((err) => console.log("❌ Connection Error: ", err));

const Food = require('./models/Food'); 

// --- ROUTES ---

// A simple route for the root "/" so you know it's working
app.get('/', (req, res) => {
  res.send('✅ AnnUpyog Backend is Running Successfully!');
});

// 1. Post Donation with Image
app.post('/api/donate', upload.single('image'), async (req, res) => {
  try {
 const newFood = new Food({
  donorName: req.body.donorName,
  donorPhone: req.body.donorPhone,     // Map the phone
  foodItem: req.body.foodItem,
  foodCategory: req.body.foodCategory, // Map the category
  quantity: req.body.quantity,
  expiryTime: req.body.expiryTime,
  address: req.body.address,
  image: req.file ? `/uploads/${req.file.filename}` : ''
});
    
    await newFood.save();
    // Use status(201) to explicitly tell the frontend "I created this"
    return res.status(201).json({ message: "Donation Posted Successfully!" });
  } catch (err) {
    console.error("Save Error:", err);
    return res.status(500).json({ error: "Database save failed" });
  }
});

// 2. Get Food List
app.get('/api/food-list', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// 3. Approve Food
app.put('/api/approve/:id', async (req, res) => {
  try {
    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id, 
      { status: 'approved' }, 
      { new: true }
    );
    res.json({ message: "Food Approved successfully!", updatedFood });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve food" });
  }
});

// 4. Delete Food
app.delete('/api/food/:id', async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Donation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// 5. Claim Food
app.put('/api/claim/:id', async (req, res) => {
  try {
    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id, 
      { status: 'claimed' }, 
      { new: true }
    );
    res.json({ message: "Food Claimed!", updatedFood });
  } catch (err) {
    res.status(500).json({ error: "Failed to claim" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));