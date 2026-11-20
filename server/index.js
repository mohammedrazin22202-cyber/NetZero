import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, AppStateModel } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Get persisted state from MongoDB Atlas
app.get('/api/state', async (req, res) => {
  try {
    const record = await AppStateModel.findOne({ userId: 'default_user' });
    if (!record) {
      return res.status(200).json({ state: null, message: 'No stored state yet' });
    }
    res.json({ state: record.data, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('Error fetching state from MongoDB:', err);
    res.status(500).json({ error: 'Failed to retrieve state', details: err.message });
  }
});

// Save or sync state to MongoDB Atlas
app.post('/api/state', async (req, res) => {
  try {
    const incomingData = req.body;
    if (!incomingData) {
      return res.status(400).json({ error: 'No data provided' });
    }

    const record = await AppStateModel.findOneAndUpdate(
      { userId: 'default_user' },
      {
        data: incomingData,
        updatedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.json({ success: true, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('Error saving state to MongoDB:', err);
    res.status(500).json({ error: 'Failed to save state', details: err.message });
  }
});

// Start server and connect to MongoDB
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 NetZero Express Backend running on http://localhost:${PORT}`);
  });
}

startServer();
