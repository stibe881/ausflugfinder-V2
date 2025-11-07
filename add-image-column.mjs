import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "185.178.193.60",
  user: "ausflugfinder",
  password: "!LeliBist.1561!",
  database: "ausflugfinder_v2",
});

async function addColumn() {
  const connection = await pool.getConnection();

  try {
    await connection.query("ALTER TABLE trips ADD COLUMN IF NOT EXISTS image VARCHAR(512) DEFAULT NULL");
    console.log("✓ Added image column to trips table");
  } finally {
    await connection.release();
    await pool.end();
  }
}

addColumn();
