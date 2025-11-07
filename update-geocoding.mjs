import { drizzle } from "drizzle-orm/mysql2";
import { trips } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const geocodingData = [
  { title: "Rheinfall Schaffhausen", latitude: "47.6770", longitude: "8.6151" },
  { title: "Aquaparc Le Bouveret", latitude: "46.3833", longitude: "6.8667" },
  { title: "Pilatus Seilbahn", latitude: "46.9789", longitude: "8.2525" },
  { title: "Zoo Zürich", latitude: "47.3850", longitude: "8.5746" },
  { title: "Ballenberg Freilichtmuseum", latitude: "46.7581", longitude: "8.0431" },
  { title: "Pumptrack Bern", latitude: "46.9480", longitude: "7.4474" },
  { title: "Restaurant Chäserrugg", latitude: "47.1947", longitude: "9.3417" },
  { title: "Foxtrail Basel", latitude: "47.5596", longitude: "7.5886" },
  { title: "Spielplatz Rieterpark", latitude: "47.3569", longitude: "8.5278" },
  { title: "Tierpark Goldau", latitude: "47.0472", longitude: "8.5506" },
  { title: "Wanderung Oeschinensee", latitude: "46.4992", longitude: "7.7278" },
  { title: "Conny-Land Freizeitpark", latitude: "47.6333", longitude: "9.0667" }
];

async function updateGeocoding() {
  console.log("Updating geocoding data...");
  
  for (const data of geocodingData) {
    const result = await db.select().from(trips).where(eq(trips.title, data.title)).limit(1);
    
    if (result.length > 0) {
      await db.update(trips)
        .set({ latitude: data.latitude, longitude: data.longitude })
        .where(eq(trips.id, result[0].id));
      console.log(`✓ Updated: ${data.title}`);
    }
  }
  
  console.log("Geocoding update complete!");
  process.exit(0);
}

updateGeocoding().catch(console.error);
