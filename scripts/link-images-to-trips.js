import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/mysql2";
import { trips, tripPhotos } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

// Load environment variables
config();

// Convert image path to URL
function imagePathToUrl(imagePath) {
  if (!imagePath) return "";
  // Convert Windows path to URL format
  const fileName = imagePath.split("\\").pop() || imagePath;
  return `/uploads/${fileName}`;
}

async function linkImagesToTrips() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable not set");
    return;
  }

  let db;
  try {
    db = drizzle(process.env.DATABASE_URL);
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    return;
  }

  try {
    // Read the JSON file
    const filePath = resolve("ausfluge_export_2025-11-10_08-12-34.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    console.log(`\n📦 Linking images to ${data.excursions.length} excursions...`);

    let linkedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const exc of data.excursions) {
      try {
        // Find trip by name
        const tripByName = await db.select()
          .from(trips)
          .where(eq(trips.title, exc.name));

        if (tripByName.length === 0) {
          console.log(`⏭️  Skipped: "${exc.name}" (not found in database)`);
          skippedCount++;
          continue;
        }

        const tripId = tripByName[0].id;

        // Delete existing photos for this trip
        await db.delete(tripPhotos).where(eq(tripPhotos.tripId, tripId));

        // Add title image if exists
        if (exc.title_image) {
          const imageUrl = imagePathToUrl(exc.title_image);
          try {
            await db.insert(tripPhotos).values({
              tripId,
              photoUrl: imageUrl,
              caption: `${exc.name} - Cover Image`,
              isPrimary: 1,
            });
            console.log(`✅ Linked: "${exc.name}" with cover image`);
          } catch (imgError) {
            console.warn(`   ⚠️  Failed to link title image for ${exc.name}`);
          }
        } else {
          console.log(`✅ Processed: "${exc.name}" (no image)`);
        }

        linkedCount++;
      } catch (error) {
        skippedCount++;
        const errorMsg = `Failed to link images for "${exc.name}": ${error instanceof Error ? error.message : String(error)}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Link Summary:`);
    console.log(`✅ Successfully linked: ${linkedCount}/${data.excursions.length}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    }

    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("Fatal error during linking:", error);
    process.exit(1);
  }
}

// Run the script
linkImagesToTrips().then(() => {
  console.log("✨ Image linking complete!");
  process.exit(0);
}).catch((error) => {
  console.error("Image linking failed:", error);
  process.exit(1);
});
