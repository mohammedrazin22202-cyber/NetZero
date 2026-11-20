import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/netzero';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');
  } catch (err) {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  }
}

const AppStateSchema = new mongoose.Schema(
  {
    userId: { type: String, default: 'default_user', unique: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false }
);

export const AppStateModel = mongoose.model('AppState', AppStateSchema);
