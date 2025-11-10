/**
 * Import Parser for Excursions
 * Supports JSON and CSV formats
 */

export interface ImportExcursion {
  name: string;
  description?: string;
  destination?: string;
  address?: string;
  region?: string;
  category?: string;
  cost?: "free" | "low" | "medium" | "high" | "very_high";
  website_url?: string;
  latitude?: string;
  longitude?: string;
  // Legacy field mapping
  beschreibung?: string;
  adresse?: string;
  kosten_stufe?: number;
  website?: string;
  lat?: string;
  lng?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  excursions: ImportExcursion[];
}

/**
 * Parse JSON import data
 */
export function parseJSON(jsonString: string): ImportResult {
  const errors: string[] = [];
  const excursions: ImportExcursion[] = [];
  let success = 0;
  let failed = 0;

  try {
    const data = JSON.parse(jsonString);

    // Handle both direct array and object with excursions property
    const items = Array.isArray(data) ? data : data.excursions || [];

    if (!Array.isArray(items)) {
      throw new Error("Invalid JSON format: expected an array or object with 'excursions' property");
    }

    for (let i = 0; i < items.length; i++) {
      try {
        const item = items[i];
        const excursion: ImportExcursion = {
          name: item.name || item.title || `Excursion ${i + 1}`,
          description: item.description || item.beschreibung || "",
          destination: item.destination || item.adresse || "",
          address: item.address || item.adresse || "",
          region: item.region || "",
          category: item.category || item.categories || "",
          cost: normalizeCost(item.cost || item.kosten_stufe),
          website_url: item.website_url || item.website || "",
          latitude: item.latitude || item.lat || "",
          longitude: item.longitude || item.lng || "",
        };

        if (!excursion.name) {
          throw new Error("Missing required field: name");
        }

        excursions.push(excursion);
        success++;
      } catch (error) {
        failed++;
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } catch (error) {
    throw new Error(
      `JSON parse error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return { success, failed, errors, excursions };
}

/**
 * Parse CSV import data
 */
export function parseCSV(csvString: string): ImportResult {
  const errors: string[] = [];
  const excursions: ImportExcursion[] = [];
  let success = 0;
  let failed = 0;

  const lines = csvString.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV must contain header row and at least one data row");
  }

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().trim());

  // Find column indices
  const findIndex = (names: string[]) => headers.findIndex((h) => names.includes(h));

  const nameIdx = findIndex(["name", "title", "ausflug"]);
  const descIdx = findIndex(["description", "beschreibung", "desc"]);
  const destIdx = findIndex(["destination", "adresse", "address", "ort"]);
  const regionIdx = findIndex(["region", "area"]);
  const categoryIdx = findIndex(["category", "categories", "kategorie"]);
  const costIdx = findIndex(["cost", "kosten_stufe", "price"]);
  const websiteIdx = findIndex(["website", "website_url", "url"]);
  const latIdx = findIndex(["lat", "latitude"]);
  const lngIdx = findIndex(["lng", "longitude"]);

  if (nameIdx === -1) {
    throw new Error('CSV must contain a "name" or "title" column');
  }

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);

      if (values.length === 0 || values.every((v) => !v.trim())) {
        continue; // Skip empty rows
      }

      const excursion: ImportExcursion = {
        name: values[nameIdx]?.trim() || `Excursion ${i}`,
        description: descIdx !== -1 ? values[descIdx]?.trim() : "",
        destination: destIdx !== -1 ? values[destIdx]?.trim() : "",
        address: destIdx !== -1 ? values[destIdx]?.trim() : "",
        region: regionIdx !== -1 ? values[regionIdx]?.trim() : "",
        category: categoryIdx !== -1 ? values[categoryIdx]?.trim() : "",
        cost: costIdx !== -1 ? normalizeCost(values[costIdx]) : "free",
        website_url: websiteIdx !== -1 ? values[websiteIdx]?.trim() : "",
        latitude: latIdx !== -1 ? values[latIdx]?.trim() : "",
        longitude: lngIdx !== -1 ? values[lngIdx]?.trim() : "",
      };

      if (!excursion.name) {
        throw new Error("Missing required field: name");
      }

      excursions.push(excursion);
      success++;
    } catch (error) {
      failed++;
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { success, failed, errors, excursions };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Normalize cost values to standard enum
 */
function normalizeCost(
  cost: any
): "free" | "low" | "medium" | "high" | "very_high" | undefined {
  if (!cost) return undefined;

  const costStr = String(cost).toLowerCase().trim();

  // Handle numeric values (0-4)
  if (!isNaN(Number(costStr))) {
    const num = Number(costStr);
    const costMap: Record<number, "free" | "low" | "medium" | "high" | "very_high"> = {
      0: "free",
      1: "low",
      2: "medium",
      3: "high",
      4: "very_high",
    };
    return costMap[num];
  }

  // Handle string values
  if (costStr.includes("free") || costStr === "0") return "free";
  if (costStr.includes("low") || costStr === "low") return "low";
  if (costStr.includes("medium") || costStr === "medium") return "medium";
  if (costStr.includes("high") || costStr === "high") return "high";
  if (costStr.includes("very") || costStr === "very_high") return "very_high";

  return undefined;
}

/**
 * Detect file format based on file extension
 */
export function detectFormat(filename: string): "json" | "csv" | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "json") return "json";
  if (ext === "csv") return "csv";
  return null;
}

/**
 * Main import function that auto-detects format
 */
export function parseImportFile(content: string, filename: string): ImportResult {
  const format = detectFormat(filename);

  if (!format) {
    throw new Error("Unsupported file format. Please use JSON or CSV.");
  }

  try {
    return format === "json" ? parseJSON(content) : parseCSV(content);
  } catch (error) {
    throw new Error(
      `Failed to parse ${format.toUpperCase()}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
