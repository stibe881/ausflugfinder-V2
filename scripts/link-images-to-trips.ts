import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import mysql from "mysql2/promise";

// Load environment variables
config();

interface ExcursionFromJSON {
  id: number;
  name: string;
  title_image?: string;
  additional_images?: string;
}

interface ImportData {
  excursions: ExcursionFromJSON[];
}

// Convert image path to URL
function imagePathToUrl(imagePath: string): string {
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

  // Parse MySQL connection string
  const url = new URL(process.env.DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port ? parseInt(url.port) : 3306,
  });

  try {
    // Read the JSON file
    const filePath = resolve("ausfluge_export_2025-11-10_08-12-34.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const data: ImportData = JSON.parse(fileContent);

    console.log(`\n📦 Linking images to ${data.excursions.length} excursions...`);

    let linkedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const exc of data.excursions) {
      try {
        // Find trip by name
        const [trips] = await connection.execute(
          "SELECT id FROM trips WHERE title = ?",
          [exc.name]
        );

        const tripRows = trips as any[];
        if (tripRows.length === 0) {
          console.log(`⏭️  Skipped: "${exc.name}" (not found in database)`);
          skippedCount++;
          continue;
        }

        const tripId = tripRows[0].id;

        // Delete existing photos for this trip
        await connection.execute("DELETE FROM tripPhotos WHERE tripId = ?", [
          tripId,
        ]);

        // Add title image if exists
        if (exc.title_image) {
          const imageUrl = imagePathToUrl(exc.title_image);
          try {
            await connection.execute(
              "INSERT INTO tripPhotos (tripId, photoUrl, caption, isPrimary) VALUES (?, ?, ?, ?)",
              [tripId, imageUrl, `${exc.name} - Cover Image`, 1]
            );
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
        const errorMsg = `Failed to link images for "${exc.name}": ${
          error instanceof Error ? error.message : String(error)
        }`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Link Summary:`);
    console.log(
      `✅ Successfully linked: ${linkedCount}/${data.excursions.length}`
    );
    console.log(`⏭️  Skipped: ${skippedCount}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    }

    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("Fatal error during linking:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the script
linkImagesToTrips()
  .then(() => {
    console.log("✨ Image linking complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Image linking failed:", error);
    process.exit(1);
  });
