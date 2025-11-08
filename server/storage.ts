/**
 * Enhanced Storage Service with Local Filesystem Fallback
 * Improvement #8: Move images from Base64 to filesystem
 *
 * Provides methods to handle image uploads and retrieval
 * Currently uses local filesystem, easily extensible to S3
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ENV } from './_core/env';

// ====== ORIGINAL BIZ STORAGE (kept for backward compatibility) ======

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function buildAuthHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}` };
}

function buildFormData(buffer: Buffer, contentType: string) {
  const formData = new FormData();
  const blob = new Blob([buffer], { type: contentType });
  formData.append("file", blob);
  return formData;
}

// ====== ORIGINAL EXPORTS (backward compatibility) ======

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const { baseUrl, apiKey } = getStorageConfig();
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = buildFormData(buffer, contentType);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
    headers: buildAuthHeaders(apiKey),
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

export async function getDownloadUrl(key: string): Promise<string> {
  const { baseUrl, apiKey } = getStorageConfig();
  return buildDownloadUrl(baseUrl, key, apiKey);
}

export async function deleteFile(key: string): Promise<void> {
  const { baseUrl, apiKey } = getStorageConfig();
  const deleteUrl = new URL(
    "v1/storage/delete",
    ensureTrailingSlash(baseUrl)
  );
  deleteUrl.searchParams.set("path", normalizeKey(key));

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers: buildAuthHeaders(apiKey),
  });

  if (!response.ok) {
    throw new Error(`Delete failed with status ${response.status}`);
  }
}

// ====== NEW: LOCAL FILESYSTEM STORAGE (Improvement #8) ======

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads", "images");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Initialize upload directory
 */
export async function initializeLocalStorage(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`[Storage] Local upload directory ready: ${UPLOAD_DIR}`);
  } catch (error) {
    console.error(`[Storage] Failed to initialize upload directory:`, error);
    throw error;
  }
}

/**
 * Save Base64 image to local filesystem
 */
export async function saveBase64ImageLocal(
  base64: string,
  filename?: string
): Promise<{ path: string; filename: string }> {
  try {
    // Extract base64 data
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    const buffer = Buffer.from(base64Data, "base64");

    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Generate unique filename
    const safeFilename = filename || `image-${crypto.randomBytes(8).toString("hex")}.jpg`;
    const sanitizedFilename = safeFilename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();

    // Save file
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);
    await fs.writeFile(filePath, buffer);

    return {
      path: `/uploads/images/${sanitizedFilename}`,
      filename: sanitizedFilename,
    };
  } catch (error) {
    console.error("[Storage] Failed to save image:", error);
    throw error;
  }
}

/**
 * Delete local image file
 */
export async function deleteImageLocal(filename: string): Promise<void> {
  try {
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    // Prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    const normalizedUploadDir = path.normalize(UPLOAD_DIR);
    if (!normalizedPath.startsWith(normalizedUploadDir)) {
      throw new Error("Invalid file path");
    }

    await fs.unlink(filePath);
    console.log(`[Storage] Deleted local image: ${filename}`);
  } catch (error) {
    console.warn(`[Storage] Could not delete image ${filename}:`, error);
  }
}

/**
 * Validate image file before upload
 */
export function validateImageFile(
  buffer: Buffer,
  mimeType?: string
): { valid: boolean; error?: string } {
  // Check size
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check MIME type
  if (mimeType && !ALLOWED_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `File type must be one of: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  // Check magic bytes
  if (!checkImageSignature(buffer)) {
    return {
      valid: false,
      error: "File does not appear to be a valid image",
    };
  }

  return { valid: true };
}

/**
 * Check image file signature (magic bytes)
 */
function checkImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true;
  // WEBP
  if (buffer.length >= 12 && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
      buffer[3] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 &&
      buffer[10] === 0x42 && buffer[11] === 0x50) return true;

  return false;
}
