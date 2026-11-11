import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// 1. Initialize Supabase PostgreSQL Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 2. MongoDB NoSQL Connection Helper
const connectNoSQL = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGO_URI);
};

// MongoDB Schema for Contact Form Messages
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactSchema);

// =========================================================
// 🚀 Function: Fetch Relational Data from Supabase SQL
// =========================================================
export async function getDepartments() {
  try {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// =========================================================
// 🚀 Function: Securely log Contact Forms to MongoDB NoSQL
// =========================================================
export async function submitContact(formData) {
  try {
    await connectNoSQL();
    const newMessage = new ContactMessage(formData);
    await newMessage.save();
    return { success: true, message: 'Saved to Cloud NoSQL!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
