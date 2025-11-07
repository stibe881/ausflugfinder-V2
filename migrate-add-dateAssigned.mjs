#!/usr/bin/env node
/**
 * Migration script to add dateAssigned column to dayPlanItems table
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

    // Check if column already exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'dayPlanItems' AND COLUMN_NAME = 'dateAssigned' AND TABLE_SCHEMA = ?`,
      [database]
    );

    if (columns.length > 0) {
      console.log('✓ Column "dateAssigned" already exists in dayPlanItems table');
      await connection.end();
      return;
    }

    // Add the column
    console.log('Adding "dateAssigned" column to dayPlanItems table...');
    await connection.execute(
      'ALTER TABLE dayPlanItems ADD COLUMN dateAssigned TIMESTAMP NULL AFTER notes'
    );

    console.log('✓ Successfully added "dateAssigned" column');

    // Verify the column was added
    const [newColumns] = await connection.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'dayPlanItems' ORDER BY ORDINAL_POSITION`
    );

    console.log('\nCurrent dayPlanItems columns:');
    newColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`);
    });

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
