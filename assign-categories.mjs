#!/usr/bin/env node
/**
 * Script to assign categories from ausfluege.sql to trips in the database
 * Matches trips by title and assigns the corresponding category
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function assignCategories() {
  let connection;
  try {
    // Read and parse the SQL dump
    const sqlFile = path.join(process.env.USERPROFILE || '/', 'Downloads', 'ausfluege.sql');

    if (!fs.existsSync(sqlFile)) {
      console.error(`SQL file not found at ${sqlFile}`);
      process.exit(1);
    }

    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Parse INSERT statement to extract trip data with categories
    // Expected format: (id, user_id, 'name', 'description', 'address', 'country', 'region', 'kategorie_alt', ...)
    const tripData = [];

    // Find all INSERT statement values
    const valueMatches = sqlContent.matchAll(/\((\d+),\s*(\d+|\s*NULL),\s*'([^']*)'/g);

    let rowNum = 0;
    // More reliable parsing: extract full rows
    const rows = sqlContent.match(/\(\d+,[\s\S]+?\),/g) || [];
    console.log(`Found ${rows.length} potential rows`);

    for (const row of rows.slice(0, 20)) {
      rowNum++;
      // Extract quoted strings
      const matches = row.matchAll(/'([^']*)'/g);
      const values = Array.from(matches).map(m => m[1]);

      if (values.length >= 6) {
        // Position: 0=name, 1=description, 2=address, 3=country, 4=region, 5=kategorie
        const name = values[0];
        const region = values[4];
        const category = values[5];

        if (name && category) {
          tripData.push({ name, region, category });
        }
      }
    }

    console.log(`Parsed ${tripData.length} trips with categories`);
    if (tripData.length > 0) {
      console.log('\nSample data:');
      tripData.slice(0, 3).forEach(t => {
        console.log(`  "${t.name}" (${t.region}) -> ${t.category}`);
      });
    }

    // Connect to database
    const dbUrl = process.env.DATABASE_URL || 'mysql://ausflugfinder:!LeliBist.1561!@185.178.193.60:3306/ausflugfinder_v2';

    // Parse the DATABASE_URL format
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
      console.error('Invalid DATABASE_URL format');
      process.exit(1);
    }

    const [, user, password, host, port, database] = urlMatch;

    connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    });

    console.log(`\nConnected to database: ${database}`);

    // Get all trips
    const [trips] = await connection.execute('SELECT id, title, category FROM trips ORDER BY title');
    console.log(`Found ${(trips as any[]).length} trips in database`);

    // Assign categories by matching title
    let assigned = 0;
    let skipped = 0;

    for (const trip of trips as any[]) {
      if (trip.category) {
        skipped++;
        continue; // Already has a category
      }

      // Find matching trip in import data
      const match = tripData.find(t =>
        trip.title.toLowerCase().includes(t.name.toLowerCase()) ||
        t.name.toLowerCase().includes(trip.title.toLowerCase())
      );

      if (match) {
        await connection.execute(
          'UPDATE trips SET category = ? WHERE id = ?',
          [match.category, trip.id]
        );
        console.log(`✓ Updated "${trip.title}" -> ${match.category}`);
        assigned++;
      }
    }

    console.log(`\n=== Results ===`);
    console.log(`Categories assigned: ${assigned}`);
    console.log(`Already had category: ${skipped}`);
    console.log(`Unmatched trips: ${(trips as any[]).length - assigned - skipped}`);

    // Show categories assigned
    const [result] = await connection.execute('SELECT DISTINCT category FROM trips WHERE category IS NOT NULL ORDER BY category');
    console.log(`\nTotal unique categories in database: ${(result as any[]).length}`);
    if ((result as any[]).length > 0) {
      console.log('Categories:');
      (result as any[]).forEach(row => {
        console.log(`  - ${row.category}`);
      });
    }

    await connection.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', (error as Error).message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

assignCategories();
