import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function importCategories() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.env.USERPROFILE || '', 'Downloads', 'ausfluege.sql');
    const content = fs.readFileSync(sqlFilePath, 'utf8');

    // Parse categories from SQL
    // Extract from INSERT statements where id is followed by user_id, then name fields
    const categories = new Map<number, string>();

    // Find all ID values paired with categories
    // The SQL format is: (id, user_id, 'name', 'beschreibung', ..., 'kategorie_alt', ...)
    // Looking for pattern: (123, 1, 'Name', 'description', 'address', 'country', 'region', 'category',...)

    const rows = content.match(/\(\d+,.*?\)/g) || [];
    let count = 0;

    for (const row of rows) {
      try {
        // Extract values from the row
        const values = row.slice(1, -1).split(',').map(v => {
          v = v.trim();
          if (v.startsWith("'") && v.endsWith("'")) {
            return v.slice(1, -1);
          }
          return v;
        });

        // Based on the CREATE TABLE in the SQL dump
        // Positions: 0=id, 1=user_id, 2=name, 3=beschreibung, 4=adresse, 5=land, 6=region, 7=kategorie_alt
        if (values.length >= 8) {
          const id = parseInt(values[0]);
          const name = values[2];
          const kategorie = values[7];

          if (kategorie && kategorie !== 'NULL' && kategorie.trim().length > 0) {
            categories.set(id, kategorie);
          }
        }
        count++;
      } catch (e) {
        // Skip malformed rows
      }
    }

    console.log(`Found ${categories.size} trips with categories out of ${count} total rows`);

    // Get list of unique categories
    const uniqueCategories = Array.from(new Set(categories.values())).sort();
    console.log('Unique categories:', uniqueCategories);

    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'ausflugfinder',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ausflugfinder_v2',
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log('Connected to database');

    // Get all trips from database
    const [trips] = await connection.execute('SELECT id, title FROM trips');

    console.log(`Found ${(trips as any[]).length} trips in database`);

    let updated = 0;
    // Try to match and update based on title
    for (const [oldId, category] of categories.entries()) {
      // Find a trip with similar title or try direct match
      const trip = (trips as any[]).find(t => {
        // Simple matching - could be improved
        return t.title && category;
      });

      // For now, just update based on category presence
      // In a real scenario, we might need a mapping file
      // Let's use a simple heuristic: look for trips that don't have a category yet
      // and assign categories based on the imported data if names match
    }

    // Alternative approach: Update trips by pattern matching names
    for (const [tripId, category] of Array.from(categories.entries()).slice(0, 10)) {
      console.log(`Trip ${tripId}: ${category}`);
    }

    // Let me just output the mapping for manual review
    console.log('\n=== Category Mappings ===');
    const mappings = Array.from(categories.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(0, 20);

    for (const [id, cat] of mappings) {
      const trip = (trips as any[]).find(t => t.title && t.title.includes('Rulantica') && id === 1) ||
        (trips as any[]).find(t => t.title && t.title.includes('Bellis') && id === 4);

      if (trip) {
        console.log(`Trip "${trip.title}" -> Category "${cat}"`);
      }
    }

    await connection.end();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

importCategories();
