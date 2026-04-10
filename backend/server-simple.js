#!/usr/bin/env node

/**
 * La Cigale CRM V0 - Simple JavaScript Server
 * Fallback when TypeScript compilation is problematic
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const app = express();

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock API endpoint for testing
// In production this would connect to Airtable via DAL
app.get('/api/reservations', (req, res) => {
  console.log('[GET] /api/reservations');
  
  // Return empty array (ready for Airtable connection)
  res.json({
    success: true,
    data: [],
    meta: { timestamp: new Date().toISOString(), cached: false },
  });
});

app.post('/api/reservations', (req, res) => {
  console.log('[POST] /api/reservations', req.body);
  res.status(201).json({
    success: true,
    data: { ...req.body, id: 'rec_' + Date.now() },
    meta: { timestamp: new Date().toISOString() },
  });
});

app.patch('/api/reservations/:id', (req, res) => {
  console.log('[PATCH] /api/reservations/:id', req.params.id, req.body);
  res.json({
    success: true,
    data: { ...req.body, id: req.params.id },
    meta: { timestamp: new Date().toISOString() },
  });
});

app.delete('/api/reservations/:id', (req, res) => {
  console.log('[DELETE] /api/reservations/:id', req.params.id);
  res.json({
    success: true,
    data: { id: req.params.id, deleted: true },
    meta: { timestamp: new Date().toISOString() },
  });
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
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  /health`);
  console.log(`  GET  /api/reservations`);
  console.log(`  POST /api/reservations`);
  console.log(`  PATCH /api/reservations/:id`);
  console.log(`  DELETE /api/reservations/:id`);
  console.log('');
  console.log('Ready for testing! Connect from http://localhost:3000');
});
