-- Delete all trips (cascades to photos)
DELETE FROM trips;

-- Reset auto_increment
ALTER TABLE trips AUTO_INCREMENT = 1;
ALTER TABLE trip_photos AUTO_INCREMENT = 1;
