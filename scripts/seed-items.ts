/**
 * Seed script for Supabase database
 * 
 * This script seeds sample items into the Supabase database.
 * 
 * Usage:
 *   - Navigate to http://localhost:3000/api/seed
 *   - Send a POST request to seed the database
 * 
 * Or use curl:
 *   curl -X POST http://localhost:3000/api/seed
 */

console.log(`
╔════════════════════════════════════════════════════════════╗
║                    Supabase Seed Script                    ║
╚════════════════════════════════════════════════════════════╝

This project now uses Supabase instead of SQLite.

To seed the database, please use one of these methods:

1. API Route (Recommended):
   - Start your dev server: npm run dev
   - Visit: http://localhost:3000/api/seed
   - Or use: curl -X POST http://localhost:3000/api/seed

2. Supabase Dashboard:
   - Visit your Supabase project dashboard
   - Go to SQL Editor
   - Run the seed SQL queries directly

The seed data includes 5 sample items and all categories.

✓ All seed logic is in: src/app/api/seed/route.ts
`);

export {};

