-- Modify pushSubscriptions table to accommodate longer Web Push API keys
-- Change auth and p256dh from varchar(255) to text to support base64-encoded keys
-- Also rename p256Dh to p256dh for consistency
ALTER TABLE `pushSubscriptions` MODIFY COLUMN `auth` longtext NOT NULL;
ALTER TABLE `pushSubscriptions` MODIFY COLUMN `p256Dh` longtext NOT NULL;
