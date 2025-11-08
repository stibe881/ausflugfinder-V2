/**
 * Standardized Error Handling
 * Improvement #11: Standardize error handling across all endpoints
 */

import { TRPCError } from "@trpc/server";

/**
 * Application Error Class
 * All errors thrown should be instances of AppError or subclasses
 */
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error - for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super("VALIDATION_ERROR", 400, message, details);
    this.name = "ValidationError";
  }
}

/**
 * Not Found Error - for missing resources
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super("NOT_FOUND", 404, message);
    this.name = "NotFoundError";
  }
}

/**
 * Unauthorized Error - for authentication failures
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super("UNAUTHORIZED", 401, message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Forbidden Error - for insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super("FORBIDDEN", 403, message);
    this.name = "ForbiddenError";
  }
}

/**
 * Conflict Error - for business logic violations
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", 409, message);
    this.name = "ConflictError";
  }
}

/**
 * Internal Server Error
 */
export class InternalError extends AppError {
  constructor(message: string = "Internal server error", details?: Record<string, any>) {
    super("INTERNAL_ERROR", 500, message, details);
    this.name = "InternalError";
  }
}

/**
 * Convert AppError to tRPC error format
 */
export function toTRPCError(error: AppError): TRPCError {
  const code = mapStatusCodeToTRPCCode(error.statusCode);
  return new TRPCError({
    code,
    message: error.message,
    cause: error.details ? { details: error.details } : undefined,
  });
}

/**
 * Map HTTP status codes to tRPC error codes
 */
function mapStatusCodeToTRPCCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 429:
      return "TOO_MANY_REQUESTS";
    case 500:
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

/**
 * Safe error handler for procedures
 * Converts unknown errors to AppError for consistent handling
 */
export function handleError(error: unknown, context?: string): AppError {
  console.error(`[Error Handler]${context ? ` ${context}` : ""}:`, error);

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes("not found")) {
      return new NotFoundError("Resource");
    }
    if (error.message.includes("unauthorized")) {
      return new UnauthorizedError();
    }
    if (error.message.includes("forbidden")) {
      return new ForbiddenError();
    }

    // Generic error
    return new InternalError(error.message, { original: error.stack });
  }

  // Unknown error type
  return new InternalError("An unknown error occurred", { error });
}

/**
 * Async error wrapper for procedure handlers
 * Usage: .query(async (opts) => trpcHandler(opts, async () => { ... }))
 */
export async function trpcHandler<T>(
  handler: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    const appError = handleError(error, context);
    throw toTRPCError(appError);
  }
}

/**
 * Async error wrapper for express handlers
 * Usage: app.get("/path", asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: any, res: any, next: any) => Promise<void> | void
) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error response formatter
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unknown error occurred",
    statusCode: 500,
  };
}
