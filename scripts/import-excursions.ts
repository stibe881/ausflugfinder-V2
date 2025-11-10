import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/mysql2";
import { trips, tripPhotos, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Load environment variables
config();

interface ImportedExcursion {
  id: number;
  user_id: number;
  name: string;
  beschreibung: string;
  adresse: string;
  land: string;
  region: string;
  parkplatz: string;
  parkplatz_kostenlos: number;
  kosten_stufe: number;
  jahreszeiten: string;
  website_url: string;
  lat: string;
  lng: string;
  nice_to_know: string | null;
  dauer_min: number | null;
  dauer_max: number | null;
  distanz_min: number | null;
  distanz_max: number | null;
  dauer_stunden: number | null;
  distanz_km: number | null;
  is_rundtour: number;
  is_von_a_nach_b: number;
  altersempfehlung: string | null;
  created_at: string;
  author_username: string | null;
  title_image: string;
  additional_images: string;
  categories: string;
}

interface ImportData {
  export_date: string;
  total_count: number;
  excursions: ImportedExcursion[];
}

// Map cost levels from old system (0-4) to new system
function mapCostLevel(kosten_stufe: number): "free" | "low" | "medium" | "high" | "very_high" {
  const costMap = {
    0: "free",
    1: "low",
    2: "medium",
    3: "high",
    4: "very_high"
  };
  return costMap[kosten_stufe as keyof typeof costMap] || "free";
}

// Determine route type
function determineRouteType(is_rundtour: number, is_von_a_nach_b: number): "round_trip" | "one_way" | "location" {
  if (is_rundtour === 1) return "round_trip";
  if (is_von_a_nach_b === 1) return "one_way";
  return "location";
}

// Convert image path to URL - assumes images are served from /uploads/images
function imagePathToUrl(imagePath: string): string {
  if (!imagePath) return "";
  // Convert Windows path to URL format
  const fileName = imagePath.split("\\").pop() || imagePath;
  return `/uploads/images/${fileName}`;
}

// Read image file and convert to base64
function readImageAsBase64(imagePath: string): string | null {
  try {
    const fullPath = resolve("uploads", imagePath.split("/").pop() || "");
    const buffer = readFileSync(fullPath);
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.warn(`Failed to read image: ${imagePath}`, error);
    return null;
  }
}

async function importExcursions() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable not set");
    return;
  }

  let db: ReturnType<typeof drizzle>;
  try {
    db = drizzle(process.env.DATABASE_URL);
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    return;
  }

  try {
    // Clean up old trips and photos
    console.log("🧹 Cleaning up old data...");
    await db.delete(tripPhotos);
    await db.delete(trips);
    console.log("✅ Old data cleared\n");

    // Read the JSON file
    const filePath = resolve("ausfluge_export_2025-11-10_08-12-34.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const data: ImportData = JSON.parse(fileContent);

    console.log(`\n📦 Starting import of ${data.total_count} excursions...`);
    console.log(`Export date: ${data.export_date}\n`);

    // Get the first user (assuming user with ID 1 exists)
    const foundUsers = await db.select().from(users).limit(1);
    if (foundUsers.length === 0) {
      console.error("❌ No users found. Please create a user first.");
      return;
    }

    const userId = foundUsers[0].id;
    console.log(`Using User ID: ${userId}\n`);

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const exc of data.excursions) {
      try {
        // Prepare trip data
        const tripData = {
          userId,
          title: exc.name,
          description: exc.beschreibung || "",
          destination: exc.adresse || "",
          startDate: new Date(exc.created_at),
          endDate: new Date(exc.created_at),
          participants: 1,
          status: "planned" as const,
          cost: mapCostLevel(exc.kosten_stufe),
          ageRecommendation: exc.altersempfehlung || undefined,
          routeType: determineRouteType(exc.is_rundtour, exc.is_von_a_nach_b),
          category: exc.categories || "",
          region: exc.region || "",
          address: exc.adresse || "",
          websiteUrl: exc.website_url || "",
          latitude: exc.lat || "",
          longitude: exc.lng || "",
          image: null as any,
          isFavorite: 0,
          isDone: 0,
          isPublic: 0,
        };

        // Insert trip
        const result = await db.insert(trips).values(tripData);
        const tripId = result[0].insertId as number;

        console.log(`✅ Imported: "${exc.name}" (ID: ${tripId})`);

        // Import title image
        if (exc.title_image) {
          const imageUrl = imagePathToUrl(exc.title_image);
          try {
            await db.insert(tripPhotos).values({
              tripId,
              photoUrl: imageUrl,
              caption: `${exc.name} - Cover Image`,
              isPrimary: 1,
            });
            console.log(`   📷 Title image added`);
          } catch (imgError) {
            console.warn(`   ⚠️  Failed to add title image: ${exc.title_image}`);
          }
        }

        // Import additional images
        if (exc.additional_images) {
          const additionalImages = exc.additional_images.split("|").filter(Boolean);
          for (const imgPath of additionalImages) {
            try {
              const imageUrl = imagePathToUrl(imgPath);
              await db.insert(tripPhotos).values({
                tripId,
                photoUrl: imageUrl,
                caption: `${exc.name} - Additional Image`,
                isPrimary: 0,
              });
            } catch (imgError) {
              console.warn(`   ⚠️  Failed to add additional image: ${imgPath}`);
            }
          }
          console.log(`   📷 ${additionalImages.length} additional images added`);
        }

        importedCount++;
      } catch (error) {
        skippedCount++;
        const errorMsg = `Failed to import "${exc.name}": ${error instanceof Error ? error.message : String(error)}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Import Summary:`);
    console.log(`✅ Successfully imported: ${importedCount}/${data.total_count}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
    }

    console.log("=".repeat(50) + "\n");
  } catch (error) {
    console.error("Fatal error during import:", error);
    process.exit(1);
  }
}

// Run the import
importExcursions().then(() => {
  console.log("✨ Import complete!");
  process.exit(0);
}).catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
