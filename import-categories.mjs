import fs from 'fs';
import { readFile } from 'fs/promises';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const sqlFilePath = 'C:\\Users\\stefa\\Downloads\\ausfluege.sql';

// Parse SQL dump to extract data
async function parseSqlDump(filePath) {
  const content = await readFile(filePath, 'utf8');

  // Find the INSERT statement
  const insertMatch = content.match(/INSERT INTO `ausfluege` \([^)]+\) VALUES\s*([\s\S]+?)(?:;|\n--)/);
  if (!insertMatch) {
    console.log('No INSERT statement found');
    return [];
  }

  const insertValues = insertMatch[1];
  // Split by ), ( to get individual row values
  const rows = insertValues.split(/\),\s*\(/);

  const data = [];
  for (const row of rows) {
    // Clean up the row
    let cleanRow = row.replace(/^[\(\s]+|[\)\s]+$/g, '');

    // Extract values - this is tricky because some values have commas
    // We'll use a simple approach: split by comma and handle NULL and numbers
    const values = [];
    let current = '';
    let inString = false;
    let quote = null;

    for (let i = 0; i < cleanRow.length; i++) {
      const char = cleanRow[i];
      const nextChar = cleanRow[i + 1];

      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        quote = char;
      } else if (char === quote && inString && cleanRow[i - 1] !== '\\') {
        inString = false;
        quote = null;
      } else if (char === ',' && !inString) {
        values.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }
    if (current.trim()) {
      values.push(current.trim());
    }

    if (values.length >= 24) {
      // Extract relevant fields: id, user_id, name, kategorie_alt
      // Based on the CREATE TABLE: id, user_id, name, beschreibung, adresse, land, region, kategorie_alt...
      const id = parseInt(values[0]);
      const userId = values[1].toUpperCase() === 'NULL' ? null : parseInt(values[1]);
      const name = values[2]?.replace(/^['"]|['"]$/g, '');
      const kategorie = values[7]?.replace(/^['"]|['"]$/g, '') || null;

      data.push({ id, userId: userId || 1, name, kategorie });
    }
  }

  return data;
}

async function importCategories() {
  try {
    const trips = await parseSqlDump(sqlFilePath);

    console.log('Parsed trips:', trips.slice(0, 5));

    // Get categories that are not NULL
    const categories = trips
      .filter(t => t.kategorie)
      .map(t => t.kategorie)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();

    console.log('Found categories:', categories);

    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'ausflugfinder',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ausflugfinder_v2',
    });

    console.log('Connected to database');

    // Update trips with categories from the import
    let updated = 0;
    for (const trip of trips) {
      if (trip.kategorie) {
        const [result] = await connection.execute(
          'UPDATE trips SET category = ? WHERE title = ? OR (id = ? AND userId = ?)',
          [trip.kategorie, trip.name, trip.id, trip.userId]
        );
        if (result.affectedRows > 0) {
          updated++;
          console.log(`Updated trip: ${trip.name} -> ${trip.kategorie}`);
        }
      }
    }

    console.log(`\nTotal trips updated: ${updated}`);

    await connection.end();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

importCategories();
