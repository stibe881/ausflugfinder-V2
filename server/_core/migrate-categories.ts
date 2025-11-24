/**
 * Migration Script: Populate tripCategories from existing trips
 *
 * This script assigns categories to trips based on heuristics from trip data.
 * Run this once to bootstrap categories into the system.
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { trips, tripCategories } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Kultur & Museen': ['museum', 'kultur', 'kunsthaus', 'galerie', 'ausstellung', 'theater', 'oper'],
  'Sport & Aktion': ['sport', 'klettern', 'wandern', 'radfahren', 'ski', 'action', 'lasertag', 'bike', 'adventure'],
  'Familie & Kinder': ['kids', 'kinder', 'spielplatz', 'zoo', 'minigolf', 'trampolin', 'kindsvill'],
  'Natur & Landschaft': ['natur', 'berg', 'wald', 'see', 'wasser', 'fluss', 'park', 'wanderung', 'botanik'],
  'Essen & Trinken': ['restaurant', 'cafe', 'kaffee', 'chocolate', 'schokolade', 'bakery', 'brewery'],
  'Shopping & Märkte': ['shopping', 'markt', 'outlet', 'mall', 'geschäft'],
  'Abenteuer': ['abenteuer', 'expedition', 'rafting', 'canyoning', 'paragliding', 'bungee'],
};

function detectCategory(title: string, description: string, destination: string): string {
  const text = `${title} ${description} ${destination}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  // Default category
  return 'Ausflüge';
}

async function migrateCategories() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('[Migration] Starting category migration...');

  // Create connection pool
  const pool = await mysql.createPool({
    uri: databaseUrl,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });

  const db = drizzle(pool);

  try {
    // Get all trips
    const allTrips = await db.select().from(trips);
    console.log(`[Migration] Found ${allTrips.length} trips to process`);

    let created = 0;
    let skipped = 0;

    for (const trip of allTrips) {
      try {
        // Check if trip already has categories
        const existing = await db
          .select()
          .from(tripCategories)
          .where(eq(tripCategories.tripId, trip.id));

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        // Detect category based on trip data
        const category = detectCategory(
          trip.title,
          trip.description || '',
          trip.destination
        );

        // Insert category
        await db.insert(tripCategories).values({
          tripId: trip.id,
          category,
        });

        created++;

        if (created % 10 === 0) {
          console.log(`[Migration] Created ${created} categories...`);
        }
      } catch (error) {
        console.error(`[Migration] Error processing trip ${trip.id}:`, error);
      }
    }

    console.log(
      `[Migration] Completed! Created ${created} categories, skipped ${skipped} (already had categories)`
    );

    // Verify
    const categoryCount = await db
      .select()
      .from(tripCategories);
    console.log(
      `[Migration] Verification: ${categoryCount.length} total rows in tripCategories table`
    );

  } catch (error) {
    console.error('[Migration] Fatal error:', error);
    throw error;
  } finally {
    // Close connection pool
    await pool.end();
  }
}

// Run migration
migrateCategories()
  .then(() => {
    console.log('[Migration] Success! Categories have been populated.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration] Failed:', error);
    process.exit(1);
  });
