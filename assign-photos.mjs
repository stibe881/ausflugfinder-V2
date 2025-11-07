import mysql from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

const pool = mysql.createPool({
  host: "185.178.193.60",
  user: "ausflugfinder",
  password: "!LeliBist.1561!",
  database: "ausflugfinder_v2",
});

// Map ausflug IDs to their new trip IDs in our database
const ausflugMap = {
  1: 1,
  4: 2,
  5: 3,
  6: 4,
  8: 5,
  10: 6,
  11: 7,
  12: 8,
  13: 9,
  14: 10,
  15: 11,
  16: 12,
  17: 13,
  18: 14,
  19: 15,
  20: 16,
  36: 17,
  37: 18,
  38: 19,
  39: 20,
  40: 21,
  41: 22,
  42: 23,
  43: 24,
  44: 25,
  45: 26,
  46: 27,
  47: 28,
  48: 29,
  49: 30,
  50: 31,
  51: 32,
  52: 33,
  53: 34,
  54: 35,
  55: 36,
  56: 37,
  57: 38,
  58: 39,
  59: 40,
  60: 41,
  62: 42,
  66: 43,
  69: 44,
  78: 45,
};

// Folder configurations
const sourceFolder = "C:\\Users\\stefa\\OneDrive\\Desktop\\ausflug-manager\\assets\\Fotos_Ausfluege";
const publicFolder = "C:\\Users\\stefa\\OneDrive\\Desktop\\ausflug-manager\\public\\ausflug-images";

async function assignPhotos() {
  const connection = await pool.getConnection();

  try {
    // Create public folder if it doesn't exist
    try {
      await fs.mkdir(publicFolder, { recursive: true });
      console.log("✓ Created public folder");
    } catch (e) {
      console.log("✓ Public folder already exists");
    }

    console.log("\nAssigning photos to ausflüge...\n");

    let successful = 0;
    let failed = 0;

    // For each ausflug with photos
    for (const [ausflugId, tripId] of Object.entries(ausflugMap)) {
      try {
        // Get all photos for this ausflug
        const files = await fs.readdir(sourceFolder);
        const ausflugPhotos = files
          .filter((f) => f.startsWith(`ex_${ausflugId}_`))
          .sort();

        if (ausflugPhotos.length === 0) {
          console.log(`⚠️  ${ausflugId}: No photos found`);
          continue;
        }

        // Select best photo as cover (prefer specific formats)
        let coverPhoto = ausflugPhotos[0];

        // Prefer higher quality formats
        const jpgPhotos = ausflugPhotos.filter((f) => f.endsWith(".jpg"));
        const webpPhotos = ausflugPhotos.filter((f) => f.endsWith(".webp"));
        const pngPhotos = ausflugPhotos.filter((f) => f.endsWith(".png"));

        if (jpgPhotos.length > 0) {
          coverPhoto = jpgPhotos[0]; // First JPG
        } else if (webpPhotos.length > 0) {
          coverPhoto = webpPhotos[0]; // First WebP
        } else if (pngPhotos.length > 0) {
          coverPhoto = pngPhotos[0]; // First PNG
        }

        // Copy cover photo to public folder
        const coverFileName = `ausflug-${tripId}-cover.jpg`;
        const sourceFile = path.join(sourceFolder, coverPhoto);
        const destFile = path.join(publicFolder, coverFileName);

        // Copy file
        const fileData = await fs.readFile(sourceFile);
        await fs.writeFile(destFile, fileData);

        // Update trip with image URL
        const imageUrl = `/ausflug-images/${coverFileName}`;
        await connection.query(
          "UPDATE trips SET image = ? WHERE id = ?",
          [imageUrl, tripId]
        );

        console.log(
          `✓ ${ausflugId}: Assigned ${ausflugPhotos.length} photos (cover: ${coverPhoto})`
        );
        successful++;
      } catch (error) {
        failed++;
        console.error(
          `✗ ${ausflugId}: ${error.message}`
        );
      }
    }

    console.log(`\n✅ Assignment complete! Successful: ${successful}, Failed: ${failed}`);
  } finally {
    await connection.release();
    await pool.end();
  }
}

assignPhotos();
