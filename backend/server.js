import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from your local .env file
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Supabase PostgreSQL Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Connect to MongoDB Atlas NoSQL Cluster
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Cloud connected successfully.'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ==========================================
// 1. SQL Endpoint: Fetch Data from Supabase
// ==========================================
app.get('/api/departments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'SQL Database Error: ' + error.message });
  }
});

// ==========================================
// 2. NoSQL Endpoint: Post Forms to MongoDB
// ==========================================
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const ContactMessage = mongoose.model('ContactMessage', contactSchema);

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();
    
    res.status(201).json({ success: true, message: 'Message securely logged into Cloud NoSQL.' });
  } catch (error) {
    res.status(500).json({ error: 'NoSQL Database Error: ' + error.message });
  }
});

// Start Server Engine
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Unified API Engine driving server on port ${PORT}`));
