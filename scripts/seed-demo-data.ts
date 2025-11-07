import { getDb } from "../server/db";
import { trips, destinations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function seedDemoData() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    // Get the first user (for demo)
    const users = await db.query.users.findMany({ limit: 1 });
    if (users.length === 0) {
      console.error("No users found. Please create a user first.");
      return;
    }

    const userId = users[0].id;

    // Clear existing demo data
    await db.delete(trips).where(eq(trips.createdBy, userId));
    await db.delete(destinations);

    // Create 5 demo destinations
    const demoDestinations = [
      {
        name: "Interlaken",
        description: "Ein wunderschöner Ort in der Schweiz mit spektakulären Bergblicken",
        location: "Bern, Schweiz",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
      },
      {
        name: "Schwarzwald",
        description: "Der größte zusammenhängende Waldkomplex Deutschlands",
        location: "Baden-Württemberg, Deutschland",
        imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400"
      },
      {
        name: "Gardasee",
        description: "Italiens größter See mit malerischen Dörfern und Wassersportmöglichkeiten",
        location: "Venetien, Italien",
        imageUrl: "https://images.unsplash.com/photo-1517422775202-51218a4a9be9?w=400"
      },
      {
        name: "Dolomiten",
        description: "UNESCO-Welterbe mit atemberaubenden Felsenformationen",
        location: "Trentino-Alto Adige, Italien",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
      },
      {
        name: "Luzern",
        description: "Charmante Altstadt mit der berühmten Kapellbrücke",
        location: "Luzern, Schweiz",
        imageUrl: "https://images.unsplash.com/photo-1488622270294-83732081d3d7?w=400"
      }
    ];

    const createdDestinations = await db.insert(destinations).values(demoDestinations as any);
    console.log("✅ 5 Destinationen erstellt");

    // Create 2 demo trips
    const today = new Date();
    const demoTrips = [
      {
        title: "Alpenüberquerung 2024",
        description: "Eine epische 5-Tage-Wanderung über die Alpen mit atemberaubenden Ausblicken",
        destination: "Interlaken, Schweiz",
        startDate: new Date(today.getFullYear(), today.getMonth() + 2, 15),
        endDate: new Date(today.getFullYear(), today.getMonth() + 2, 20),
        participants: 4,
        status: "planned" as const,
        createdBy: userId,
        isFavorite: true,
        isPublic: false,
        draft: false
      },
      {
        title: "Schwarzwaldwanderung Sommer",
        description: "Entspannter Wanderurlaub mit Familie durch die schönsten Waldwege Deutschlands",
        destination: "Schwarzwald, Deutschland",
        startDate: new Date(today.getFullYear(), today.getMonth() + 3, 1),
        endDate: new Date(today.getFullYear(), today.getMonth() + 3, 7),
        participants: 5,
        status: "planned" as const,
        createdBy: userId,
        isFavorite: false,
        isPublic: true,
        draft: false
      }
    ];

    const createdTrips = await db.insert(trips).values(demoTrips as any);
    console.log("✅ 2 Ausflüge erstellt");

    console.log("🎉 Demo-Daten erfolgreich gesät!");
  } catch (error) {
    console.error("❌ Fehler beim Seeding:", error);
  }
}

seedDemoData();
