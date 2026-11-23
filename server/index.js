import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB, AppStateModel } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure all API responses bypass any proxy or browser caching
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

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

// Update specific transaction approval status directly in MongoDB Atlas cluster
app.post('/api/transactions/:txId/approval', async (req, res) => {
  try {
    const { txId } = req.params;
    const { approvalStatus, lockedUntil, deniedAt, reviewVotes } = req.body;

    if (!txId || !approvalStatus) {
      return res.status(400).json({ error: 'Missing txId or approvalStatus' });
    }

    const record = await AppStateModel.findOne({ userId: 'default_user' });
    if (!record || !record.data) {
      return res.status(404).json({ error: 'No state found' });
    }

    const data = record.data;

    const updateTx = (tx) => {
      if (tx && tx.id === txId) {
        tx.approvalStatus = approvalStatus;
        if (lockedUntil !== undefined) tx.lockedUntil = lockedUntil;
        if (deniedAt !== undefined) tx.deniedAt = deniedAt;
        if (reviewVotes !== undefined) tx.reviewVotes = reviewVotes;
      }
      return tx;
    };

    if (Array.isArray(data.transactions)) {
      data.transactions = data.transactions.map(updateTx);
    }

    if (data.friendTransactions && typeof data.friendTransactions === 'object') {
      for (const friendId of Object.keys(data.friendTransactions)) {
        if (Array.isArray(data.friendTransactions[friendId])) {
          data.friendTransactions[friendId] = data.friendTransactions[friendId].map(updateTx);
        }
      }
    }

    record.markModified('data');
    record.updatedAt = new Date();
    await record.save();

    console.log(`✅ [MongoDB Atlas Cluster] Updated approvalStatus of ${txId} to '${approvalStatus}'`);
    res.json({ success: true, state: record.data, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('Error updating transaction approval in MongoDB:', err);
    res.status(500).json({ error: 'Failed to update transaction approval in cluster', details: err.message });
  }
});

// Request deletion approval for a transaction
app.post('/api/transactions/:txId/deletion-request', async (req, res) => {
  try {
    const { txId } = req.params;
    const { deletionRequestedBy, deletionRespondentId } = req.body;

    const record = await AppStateModel.findOne({ userId: 'default_user' });
    if (!record || !record.data) {
      return res.status(404).json({ error: 'No state found' });
    }

    const data = record.data;
    const updateTx = (tx) => {
      if (tx && tx.id === txId) {
        tx.deletionStatus = 'pending_deletion';
        tx.deletionRequestedBy = deletionRequestedBy;
        tx.deletionRespondentId = deletionRespondentId;
      }
      return tx;
    };

    if (Array.isArray(data.transactions)) {
      data.transactions = data.transactions.map(updateTx);
    }
    if (data.friendTransactions && typeof data.friendTransactions === 'object') {
      for (const friendId of Object.keys(data.friendTransactions)) {
        if (Array.isArray(data.friendTransactions[friendId])) {
          data.friendTransactions[friendId] = data.friendTransactions[friendId].map(updateTx);
        }
      }
    }

    record.markModified('data');
    record.updatedAt = new Date();
    await record.save();

    console.log(`✅ [MongoDB Atlas Cluster] Deletion requested for ${txId} by ${deletionRequestedBy}`);
    res.json({ success: true, state: record.data, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('Error requesting deletion in MongoDB:', err);
    res.status(500).json({ error: 'Failed to request deletion in cluster', details: err.message });
  }
});

// Approve deletion - permanently purge transaction from cluster
app.post('/api/transactions/:txId/deletion-approve', async (req, res) => {
  try {
    const { txId } = req.params;

    const record = await AppStateModel.findOne({ userId: 'default_user' });
    if (!record || !record.data) {
      return res.status(404).json({ error: 'No state found' });
    }

    const data = record.data;

    if (Array.isArray(data.transactions)) {
      data.transactions = data.transactions.filter((t) => t && t.id !== txId);
    }
    if (data.friendTransactions && typeof data.friendTransactions === 'object') {
      for (const friendId of Object.keys(data.friendTransactions)) {
        if (Array.isArray(data.friendTransactions[friendId])) {
          data.friendTransactions[friendId] = data.friendTransactions[friendId].filter((t) => t && t.id !== txId);
        }
      }
    }

    record.markModified('data');
    record.updatedAt = new Date();
    await record.save();

    console.log(`✅ [MongoDB Atlas Cluster] Deletion approved and purged: ${txId}`);
    res.json({ success: true, state: record.data, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('Error approving deletion in MongoDB:', err);
    res.status(500).json({ error: 'Failed to approve deletion in cluster', details: err.message });
  }
});

// Reject or cancel deletion request - keep transaction
app.post('/api/transactions/:txId/deletion-reject', async (req, res) => {
  try {
    const { txId } = req.params;

    const record = await AppStateModel.findOne({ userId: 'default_user' });
    if (!record || !record.data) {
      return res.status(404).json({ error: 'No state found' });
    }

    const data = record.data;
    const updateTx = (tx) => {
      if (tx && tx.id === txId) {
        delete tx.deletionStatus;
        delete tx.deletionRequestedBy;
        delete tx.deletionRespondentId;
      }
      return tx;
    };

    if (Array.isArray(data.transactions)) {
      data.transactions = data.transactions.map(updateTx);
    }
    if (data.friendTransactions && typeof data.friendTransactions === 'object') {
      for (const friendId of Object.keys(data.friendTransactions)) {
        if (Array.isArray(data.friendTransactions[friendId])) {
          data.friendTransactions[friendId] = data.friendTransactions[friendId].map(updateTx);
        }
      }
    }

    record.markModified('data');
    record.updatedAt = new Date();
    await record.save();

    console.log(`✅ [MongoDB Atlas Cluster] Deletion rejected/cancelled for ${txId}`);
    res.json({ success: true, state: record.data, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('Error rejecting deletion in MongoDB:', err);
    res.status(500).json({ error: 'Failed to reject deletion in cluster', details: err.message });
  }
});

// Serve frontend static build assets
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Catch-all handler for SPA routing
  app.use((req, res) => {
    res.set('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server and connect to MongoDB
async function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 NetZero Express Backend running on http://localhost:${PORT}`);
  });
  connectDB();
}

startServer();
