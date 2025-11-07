import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "185.178.193.60",
  user: "ausflugfinder",
  password: "!LeliBist.1561!",
  database: "ausflugfinder_v2",
});

async function checkSchema() {
  const connection = await pool.getConnection();

  try {
    const [columns] = await connection.query("DESCRIBE trips");
    console.log("Trips table columns:");
    columns.forEach((col, i) => {
      const nullable = col.Null === 'YES' ? 'nullable' : 'required';
      console.log(`  ${i+1}. ${col.Field}: ${col.Type} (${nullable})`);
    });

    console.log("\nTrip sample:");
    const [trips] = await connection.query("SELECT * FROM trips LIMIT 1");
    if (trips.length > 0) {
      const trip = trips[0];
      console.log(JSON.stringify(trip, null, 2));
    }
  } finally {
    await connection.release();
    await pool.end();
  }
}

checkSchema();
