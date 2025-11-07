#!/usr/bin/env node
/**
 * Migration script to update image column to support larger Base64 strings
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  let connection;
  try {
    const dbUrl = process.env.DATABASE_URL || 'mysql://ausflugfinder:!LeliBist.1561!@185.178.193.60:3306/ausflugfinder_v2';

    // Parse the DATABASE_URL format
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!urlMatch) {
      console.error('Invalid DATABASE_URL format');
      process.exit(1);
    }

    const [, user, password, host, port, database] = urlMatch;

    connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
    });

    console.log(`Connected to ${database}@${host}`);

    // Check current column type
    const [columns] = await connection.execute(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'trips' AND COLUMN_NAME = 'image' AND TABLE_SCHEMA = ?`,
      [database]
    );

    if (columns.length === 0) {
      console.error('Image column does not exist. Run migrate-add-trip-image.mjs first.');
      await connection.end();
      process.exit(1);
    }

    const currentType = columns[0].COLUMN_TYPE;
    console.log(`Current image column type: ${currentType}`);

    if (currentType === 'longtext') {
      console.log('✓ Image column is already LONGTEXT');
      await connection.end();
      return;
    }

    // Update the column to LONGTEXT
    console.log('Updating image column to LONGTEXT...');
    await connection.execute(
      'ALTER TABLE trips MODIFY COLUMN image LONGTEXT'
    );

    console.log('✓ Successfully updated image column to LONGTEXT');

    // Verify the update
    const [updatedColumns] = await connection.execute(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'trips' AND COLUMN_NAME = 'image'`
    );

    console.log(`New image column type: ${updatedColumns[0].COLUMN_TYPE}`);

    await connection.end();
    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

migrate();
