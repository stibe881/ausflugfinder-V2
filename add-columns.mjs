import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "185.178.193.60",
  user: "ausflugfinder",
  password: "!LeliBist.1561!",
  database: "ausflugfinder_v2",
});

async function addColumns() {
  const connection = await pool.getConnection();

  try {
    console.log("Adding missing columns to trips table...\n");

    const columns = [
      "ALTER TABLE trips ADD COLUMN IF NOT EXISTS durationMin DECIMAL(5,2) DEFAULT NULL",
      "ALTER TABLE trips ADD COLUMN IF NOT EXISTS durationMax DECIMAL(5,2) DEFAULT NULL",
      "ALTER TABLE trips ADD COLUMN IF NOT EXISTS distanceMin DECIMAL(6,2) DEFAULT NULL",
      "ALTER TABLE trips ADD COLUMN IF NOT EXISTS distanceMax DECIMAL(6,2) DEFAULT NULL",
      "ALTER TABLE trips ADD COLUMN IF NOT EXISTS ageRecommendation VARCHAR(255) DEFAULT NULL",
      "ALTER TABLE trips ADD COLUMN IF NOT EXISTS niceToKnow VARCHAR(500) DEFAULT NULL",
    ];

    for (const sql of columns) {
      try {
        await connection.query(sql);
        const colName = sql.split("ADD COLUMN IF NOT EXISTS ")[1].split(" ")[0];
        console.log(`✓ Added column: ${colName}`);
      } catch (error) {
        console.error(`✗ Error: ${error.message}`);
      }
    }

    console.log("\n✅ Database schema updated!");
  } finally {
    await connection.release();
    await pool.end();
  }
}

addColumns();
