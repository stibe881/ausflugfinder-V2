import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "185.178.193.60",
  user: "ausflugfinder",
  password: "!LeliBist.1561!",
  database: "ausflugfinder_v2",
});

async function makeAdmin() {
  const connection = await pool.getConnection();

  try {
    // Check if role column exists, if not add it
    try {
      await connection.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'");
      console.log("✓ Added role column to users table");
    } catch (e) {
      // Column might already exist
    }

    // Update Stibe to admin
    const [result] = await connection.query("UPDATE users SET role = 'admin' WHERE id = 1");
    
    if (result.affectedRows > 0) {
      console.log("✓ User Stibe (ID 1) is now an admin!");
      
      // Display user info
      const [users] = await connection.query("SELECT id, username, email, role FROM users WHERE id = 1");
      if (users.length > 0) {
        console.log("\nUser Info:");
        console.log(`  ID: ${users[0].id}`);
        console.log(`  Username: ${users[0].username}`);
        console.log(`  Email: ${users[0].email}`);
        console.log(`  Role: ${users[0].role}`);
      }
    } else {
      console.log("⚠️ User with ID 1 not found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await connection.release();
    await pool.end();
  }
}

makeAdmin();
