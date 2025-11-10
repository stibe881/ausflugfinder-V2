"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/link-images-to-trips.ts
var import_dotenv = require("dotenv");
var import_fs = require("fs");
var import_path = require("path");
var import_promise = __toESM(require("mysql2/promise"), 1);
(0, import_dotenv.config)();
function imagePathToUrl(imagePath) {
  if (!imagePath) return "";
  const fileName = imagePath.split("\\").pop() || imagePath;
  return `/uploads/images/${fileName}`;
}
async function linkImagesToTrips() {
  if (!process.env.DATABASE_URL) {
    console.error("\u274C DATABASE_URL environment variable not set");
    return;
  }
  const url = new URL(process.env.DATABASE_URL);
  const connection = await import_promise.default.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port ? parseInt(url.port) : 3306
  });
  try {
    const filePath = (0, import_path.resolve)("ausfluge_export_2025-11-10_08-12-34.json");
    const fileContent = (0, import_fs.readFileSync)(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    console.log(`
\u{1F4E6} Linking images to ${data.excursions.length} excursions...`);
    let linkedCount = 0;
    let skippedCount = 0;
    const errors = [];
    for (const exc of data.excursions) {
      try {
        const [trips] = await connection.execute(
          "SELECT id FROM trips WHERE title = ?",
          [exc.name]
        );
        const tripRows = trips;
        if (tripRows.length === 0) {
          console.log(`\u23ED\uFE0F  Skipped: "${exc.name}" (not found in database)`);
          skippedCount++;
          continue;
        }
        const tripId = tripRows[0].id;
        await connection.execute("DELETE FROM tripPhotos WHERE tripId = ?", [
          tripId
        ]);
        if (exc.title_image) {
          const imageUrl = imagePathToUrl(exc.title_image);
          try {
            await connection.execute(
              "INSERT INTO tripPhotos (tripId, photoUrl, caption, isPrimary) VALUES (?, ?, ?, ?)",
              [tripId, imageUrl, `${exc.name} - Cover Image`, 1]
            );
            console.log(`\u2705 Linked: "${exc.name}" with cover image`);
          } catch (imgError) {
            console.warn(`   \u26A0\uFE0F  Failed to link title image for ${exc.name}`);
          }
        } else {
          console.log(`\u2705 Processed: "${exc.name}" (no image)`);
        }
        linkedCount++;
      } catch (error) {
        skippedCount++;
        const errorMsg = `Failed to link images for "${exc.name}": ${error instanceof Error ? error.message : String(error)}`;
        console.error(`\u274C ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    console.log("\n" + "=".repeat(50));
    console.log(`\u{1F4CA} Link Summary:`);
    console.log(
      `\u2705 Successfully linked: ${linkedCount}/${data.excursions.length}`
    );
    console.log(`\u23ED\uFE0F  Skipped: ${skippedCount}`);
    if (errors.length > 0) {
      console.log(`
\u26A0\uFE0F  Errors encountered:`);
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
linkImagesToTrips().then(() => {
  console.log("\u2728 Image linking complete!");
  process.exit(0);
}).catch((error) => {
  console.error("Image linking failed:", error);
  process.exit(1);
});
