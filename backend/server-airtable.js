#!/usr/bin/env node

/**
 * La Cigale CRM Backend - Airtable Integration
 * Connects to real Airtable base for persistent data storage
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Airtable from 'airtable';

dotenv.config();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Réservations';

if (!API_KEY || !BASE_ID) {
  console.error('❌ Missing Airtable credentials in .env');
  process.exit(1);
}

const app = express();

// Configure Airtable
const airtable = new Airtable({ apiKey: API_KEY });
const base = airtable.base(BASE_ID);
const table = base(TABLE_NAME);

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'La Cigale CRM API',
    version: '0.1.0',
    status: 'running',
    database: 'Airtable',
    documentation: {
      health: 'GET /health',
      reservations: {
        list: 'GET /api/reservations',
        create: 'POST /api/reservations',
        update: 'PATCH /api/reservations/:id',
        delete: 'DELETE /api/reservations/:id',
      },
    },
    frontend: 'http://localhost:3000',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all reservations
app.get('/api/reservations', async (req, res) => {
  try {
    console.log('[GET] /api/reservations');

    // Use .all() to get all records at once
    const records = await table.select().all();
    
    const data = records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));

    res.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        cached: false,
        total: data.length,
        database: 'Airtable',
      },
    });
  } catch (error) {
    console.error('[GET /api/reservations] Error:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'AIRTABLE_ERROR',
        message: error.message || 'Failed to fetch reservations',
      },
    });
  }
});

// Create reservation
app.post('/api/reservations', async (req, res) => {
  try {
    console.log('[POST] /api/reservations', req.body);

    const newRecord = await table.create(
      {
        ...req.body,
      },
      { typecast: true }
    );

    res.status(201).json({
      success: true,
      data: {
        id: newRecord.id,
        ...newRecord.fields,
        _airtableId: newRecord.id,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[POST /api/reservations] Error:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'AIRTABLE_ERROR',
        message: error.message || 'Failed to create reservation',
      },
    });
  }
});

// Update reservation
app.patch('/api/reservations/:id', async (req, res) => {
  try {
    console.log('[PATCH] /api/reservations/:id', req.params.id, req.body);

    const updated = await table.update(req.params.id, req.body, {
      typecast: true,
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        ...updated.fields,
        _airtableId: updated.id,
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[PATCH] Error:', error.message);
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Reservation not found' },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'AIRTABLE_ERROR',
        message: error.message || 'Failed to update reservation',
      },
    });
  }
});

// Delete reservation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    console.log('[DELETE] /api/reservations/:id', req.params.id);

    await table.destroy(req.params.id);

    res.json({
      success: true,
      data: { id: req.params.id, deleted: true },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('[DELETE] Error:', error.message);
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Reservation not found' },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'AIRTABLE_ERROR',
        message: error.message || 'Failed to delete reservation',
      },
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ La Cigale CRM Backend running on http://localhost:${PORT}`);
  console.log(`✓ CORS origin: ${CORS_ORIGIN}`);
  console.log(`✓ Airtable Base: ${BASE_ID}`);
  console.log(`✓ Airtable Table: ${TABLE_NAME}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  /health`);
  console.log(`  GET  /api/reservations`);
  console.log(`  POST /api/reservations`);
  console.log(`  PATCH /api/reservations/:id`);
  console.log(`  DELETE /api/reservations/:id`);
  console.log('');
  console.log('Connecting to your Airtable base...');
});
