import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.docker' });

async function createTripCategoriesTable() {
  const connection = await mysql.createConnection({
    host: '185.178.193.60',
    user: 'ausflugfinder',
    password: '!LeliBist.1561!',
    database: 'ausflugfinder_v2',
  });

  try {
    // Create tripCategories table
    console.log('Checking if tripCategories table exists...');
    let [tables] = await connection.execute(
      "SHOW TABLES LIKE 'tripCategories'"
    );

    if (tables.length === 0) {
      console.log('Creating tripCategories table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS tripCategories (
          id INT AUTO_INCREMENT NOT NULL,
          tripId INT NOT NULL,
          category VARCHAR(100) NOT NULL,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX trip_categories_trip_id_idx (tripId),
          INDEX trip_categories_category_idx (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ tripCategories table created successfully');
    } else {
      console.log('✓ tripCategories table already exists');
    }

    // Create tripJournal table
    console.log('Checking if tripJournal table exists...');
    [tables] = await connection.execute(
      "SHOW TABLES LIKE 'tripJournal'"
    );

    if (tables.length === 0) {
      console.log('Creating tripJournal table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS tripJournal (
          id INT AUTO_INCREMENT NOT NULL,
          tripId INT NOT NULL,
          userId INT NOT NULL,
          content TEXT NOT NULL,
          entryDate TIMESTAMP NOT NULL,
          mood VARCHAR(50),
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX trip_journal_trip_id_idx (tripId),
          INDEX trip_journal_user_id_idx (userId),
          INDEX trip_journal_entry_date_idx (entryDate),
          INDEX trip_journal_created_at_idx (createdAt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ tripJournal table created successfully');
    } else {
      console.log('✓ tripJournal table already exists');
    }

    // Create tripVideos table
    console.log('Checking if tripVideos table exists...');
    [tables] = await connection.execute(
      "SHOW TABLES LIKE 'tripVideos'"
    );

    if (tables.length === 0) {
      console.log('Creating tripVideos table...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS tripVideos (
          id INT AUTO_INCREMENT NOT NULL,
          tripId INT NOT NULL,
          videoId VARCHAR(255) NOT NULL,
          platform ENUM('youtube','tiktok') NOT NULL,
          title VARCHAR(255),
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          INDEX trip_videos_trip_id_idx (tripId),
          INDEX trip_videos_created_at_idx (createdAt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✓ tripVideos table created successfully');
    } else {
      console.log('✓ tripVideos table already exists');
    }

    console.log('\n✓ All missing tables have been created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createTripCategoriesTable();
