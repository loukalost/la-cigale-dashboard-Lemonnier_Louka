#!/usr/bin/env node

/**
 * La Cigale CRM V0 - Simple JavaScript Server
 * Fallback when TypeScript compilation is problematic
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const app = express();

// In-memory storage for reservations (during development)
const reservations = new Map();

// Mock data for testing
const mockReservations = [
  {
    id: 'rec_001',
    prenom: 'Jean',
    nomComplet: 'Dupont',
    email: 'jean.dupont@example.com',
    telephone: '+33 6 12 34 56 78',
    dateReservation: '2026-04-15',
    heureArrivee: '19:00',
    nombrePersonnes: 4,
    typePlatForm: 'restaurant',
    statut: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec_002',
    prenom: 'Marie',
    nomComplet: 'Martin',
    email: 'marie.martin@example.com',
    telephone: '+33 6 23 45 67 89',
    dateReservation: '2026-04-16',
    heureArrivee: '20:00',
    nombrePersonnes: 2,
    typePlatForm: 'restaurant',
    statut: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec_003',
    prenom: 'Pierre',
    nomComplet: 'Bernard',
    email: 'pierre.bernard@example.com',
    telephone: '+33 6 34 56 78 90',
    dateReservation: '2026-04-17',
    heureArrivee: '18:30',
    nombrePersonnes: 6,
    typePlatForm: 'restaurant',
    statut: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initialize with mock data
mockReservations.forEach((r) => reservations.set(r.id, r));

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'La Cigale CRM API',
    version: '0.1.0',
    status: 'running',
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

// Mock API endpoint for testing
// In production this would connect to Airtable via DAL
app.get('/api/reservations', (req, res) => {
  console.log('[GET] /api/reservations');
  
  // Convert Map to array
  const data = Array.from(reservations.values());
  
  res.json({
    success: true,
    data,
    meta: { 
      timestamp: new Date().toISOString(), 
      cached: false,
      total: data.length,
    },
  });
});

app.post('/api/reservations', (req, res) => {
  console.log('[POST] /api/reservations', req.body);
  
  const id = 'rec_' + Date.now();
  const newReservation = {
    id,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  reservations.set(id, newReservation);
  
  res.status(201).json({
    success: true,
    data: newReservation,
    meta: { timestamp: new Date().toISOString() },
  });
});

app.patch('/api/reservations/:id', (req, res) => {
  console.log('[PATCH] /api/reservations/:id', req.params.id, req.body);
  
  const existing = reservations.get(req.params.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Reservation not found' },
    });
  }
  
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id, // Prevent ID override
    createdAt: existing.createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };
  
  reservations.set(req.params.id, updated);
  
  res.json({
    success: true,
    data: updated,
    meta: { timestamp: new Date().toISOString() },
  });
});

app.delete('/api/reservations/:id', (req, res) => {
  console.log('[DELETE] /api/reservations/:id', req.params.id);
  
  const existing = reservations.get(req.params.id);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Reservation not found' },
    });
  }
  
  reservations.delete(req.params.id);
  
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
