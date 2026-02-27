// src/lib/errors/app-error.ts
import { ErrorCode } from '@/types/error';

export class AppError extends Error {
  code: ErrorCode;
  details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
