/**
 * @fileoverview Enhanced file validation dengan security measures untuk production
 * @author MarkDownUltraRemix Security Team
 */

import { safeConsole } from './console';
import { rateLimiters } from './rateLimiter';

/**
 * Enhanced file size limits untuk free tier optimization
 */
export const SECURE_FILE_LIMITS = {
  // Turunkan dari 10MB ke 2MB untuk free tier
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  MAX_IMAGE_SIZE: 1 * 1024 * 1024, // 1MB untuk images
  MAX_FILES_PER_USER: 50, // Turunkan dari 100 ke 50
  MAX_TOTAL_SIZE: 25 * 1024 * 1024, // 25MB total storage

  // Rate limiting untuk upload
  MAX_UPLOADS_PER_MINUTE: 10,
  MAX_UPLOADS_PER_HOUR: 50,
} as const;

/**
 * Allowed MIME types dengan strict validation
 */
export const ALLOWED_MIME_TYPES = {
  MARKDOWN: [
    'text/markdown',
    'text/x-markdown',
    'text/plain', // untuk .md files yang detected sebagai text/plain
  ],
  TEXT: ['text/plain'],
  JSON: ['application/json', 'text/json'],
} as const;

/**
 * Allowed file extensions
 */
export const ALLOWED_EXTENSIONS = [
  '.md',
  '.markdown',
  '.mdown',
  '.mkd',
  '.txt',
  '.json', // untuk export/import settings
] as const;

/**
 * Dangerous file extensions yang harus diblokir
 */
export const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.scr',
  '.vbs',
  '.js',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.jar',
  '.war',
  '.ear',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.ps1',
  '.psm1',
  '.psd1',
  '.ps1xml',
  '.psc1',
  '.psc2',
  '.msi',
  '.msp',
  '.mst',
  '.com',
  '.pif',
  '.application',
  '.gadget',
  '.msc',
  '.msp',
  '.cpl',
  '.scf',
  '.lnk',
  '.inf',
  '.reg',
  '.dll',
  '.sys',
  '.drv',
  '.ocx',
  '.ax',
  '.ade',
  '.adp',
  '.bas',
  '.chm',
  '.crt',
  '.hlp',
  '.hta',
  '.ins',
  '.isp',
  '.its',
  '.jse',
  '.ksh',
  '.mad',
  '.maf',
  '.mag',
  '.mam',
  '.maq',
  '.mar',
  '.mas',
  '.mat',
  '.mau',
  '.mav',
  '.maw',
  '.mcf',
  '.mda',
  '.mdb',
  '.mde',
  '.mdt',
  '.mdw',
  '.mdz',
  '.ops',
  '.pcd',
  '.prf',
  '.prg',
  '.pst',
  '.scr',
  '.sct',
  '.shb',
  '.shs',
  '.url',
  '.vb',
  '.vbe',
  '.vbp',
  '.vbr',
  '.vbs',
  '.vbw',
  '.ws',
  '.wsc',
  '.wsf',
  '.wsh',
] as const;

/**
 * Suspicious file patterns
 */
export const SUSPICIOUS_PATTERNS = [
  /\.\w+\.exe$/i, // Double extension
  /\s+\.exe$/i, // Space before extension
  /[<>:"/\\|?*]/g, // Invalid filename characters
  /\.\./g, // Path traversal
  /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
] as const;

/**
 * File validation result interface
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  sanitizedName?: string;
  metadata?: {
    originalSize: number;
    mimeType: string;
    extension: string;
    isCompressed: boolean;
  };
}

/**
 * Enhanced file validation dengan comprehensive security checks
 */
export const validateFileSecure = async (
  file: File,
  userIdentifier?: string
): Promise<FileValidationResult> => {
  const warnings: string[] = [];

  try {
    // 1. Rate limiting check
    if (!rateLimiters.fileOperations.isAllowed('file_upload', userIdentifier)) {
      return {
        isValid: false,
        error: 'Upload rate limit exceeded. Please wait before uploading more files.',
      };
    }

    // 2. Basic file object validation
    if (!file || !(file instanceof File)) {
      return {
        isValid: false,
        error: 'Invalid file object provided.',
      };
    }

    // 3. File size validation
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty.',
      };
    }

    if (file.size > SECURE_FILE_LIMITS.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${formatFileSize(SECURE_FILE_LIMITS.MAX_FILE_SIZE)}. Current size: ${formatFileSize(file.size)}`,
      };
    }

    // 4. Filename validation
    const originalName = file.name;
    const sanitizedName = sanitizeFileName(originalName);

    if (!sanitizedName) {
      return {
        isValid: false,
        error: 'Invalid filename provided.',
      };
    }

    if (originalName !== sanitizedName) {
      warnings.push(`Filename was sanitized from "${originalName}" to "${sanitizedName}"`);
    }

    // 5. Extension validation
    const extension = getFileExtension(sanitizedName);
    if (!extension) {
      return {
        isValid: false,
        error: 'File must have a valid extension.',
      };
    }

    // 6. Check dangerous extensions
    if (DANGEROUS_EXTENSIONS.includes(extension as (typeof DANGEROUS_EXTENSIONS)[number])) {
      return {
        isValid: false,
        error: `File type "${extension}" is not allowed for security reasons.`,
      };
    }

    // 7. Check allowed extensions
    if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
      return {
        isValid: false,
        error: `File type "${extension}" is not supported. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }

    // 8. MIME type validation
    const mimeValidation = validateMimeType(file.type, extension);
    if (!mimeValidation.isValid) {
      return {
        isValid: false,
        error: mimeValidation.error,
      };
    }

    // 9. Suspicious pattern detection
    const suspiciousCheck = checkSuspiciousPatterns(sanitizedName);
    if (!suspiciousCheck.isValid) {
      return {
        isValid: false,
        error: suspiciousCheck.error,
      };
    }

    // 10. Content validation (basic)
    const contentValidation = await validateFileContent(file);
    if (!contentValidation.isValid) {
      return {
        isValid: false,
        error: contentValidation.error,
      };
    }

    // Success
    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      sanitizedName,
      metadata: {
        originalSize: file.size,
        mimeType: file.type,
        extension,
        isCompressed: file.size < 1024, // Assume small files might be compressed
      },
    };
  } catch (error) {
    safeConsole.error('File validation error:', error);
    return {
      isValid: false,
      error: 'File validation failed due to an internal error.',
    };
  }
};

/**
 * Sanitize filename untuk keamanan
 */
export const sanitizeFileName = (filename: string): string => {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // Remove dangerous characters dan normalize
  let sanitized = filename
    .trim()
    .replace(/[<>:"/\\|?*]/g, '') // Remove dangerous chars
    .split('')
    .filter((char) => char.charCodeAt(0) > 31)
    .join('') // Remove control characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .substring(0, 100); // Limit length

  // Check for Windows reserved names
  const nameWithoutExt = sanitized.replace(/\.[^.]*$/, '');
  const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  if (reservedNames.test(nameWithoutExt)) {
    sanitized = `file_${sanitized}`;
  }

  // Ensure it has valid characters
  if (!/^[a-zA-Z0-9._-]+$/.test(sanitized)) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  // Ensure it's not empty
  if (!sanitized || sanitized === '.') {
    sanitized = `file_${Date.now()}.txt`;
  }

  return sanitized;
};

/**
 * Get file extension dengan validation
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
};

/**
 * Validate MIME type consistency dengan extension
 */
export const validateMimeType = (
  mimeType: string,
  _extension: string
): { isValid: boolean; error?: string } => {
  // Allow empty MIME type (browser might not detect it)
  if (!mimeType) {
    return { isValid: true };
  }

  const allAllowedMimes: string[] = [
    ...ALLOWED_MIME_TYPES.MARKDOWN,
    ...ALLOWED_MIME_TYPES.TEXT,
    ...ALLOWED_MIME_TYPES.JSON,
  ];

  // Check if MIME type is in allowed list
  if (!allAllowedMimes.includes(mimeType)) {
    return {
      isValid: false,
      error: `MIME type "${mimeType}" is not allowed. File may be corrupted or have incorrect type.`,
    };
  }

  return { isValid: true };
};

/**
 * Check for suspicious filename patterns
 */
export const checkSuspiciousPatterns = (filename: string): { isValid: boolean; error?: string } => {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(filename)) {
      return {
        isValid: false,
        error: 'Filename contains suspicious patterns and cannot be uploaded.',
      };
    }
  }

  return { isValid: true };
};

/**
 * Basic content validation
 */
export const validateFileContent = async (
  file: File
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Read first 1KB untuk basic validation
    const slice = file.slice(0, 1024);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Check for binary content (basic heuristic)
    let nullBytes = 0;
    let controlChars = 0;

    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        nullBytes++;
      } else if (bytes[i] < 32 && bytes[i] !== 9 && bytes[i] !== 10 && bytes[i] !== 13) {
        controlChars++;
      }
    }

    // If more than 1% null bytes or control chars, likely binary
    const suspiciousRatio = (nullBytes + controlChars) / bytes.length;
    if (suspiciousRatio > 0.01) {
      return {
        isValid: false,
        error: 'File appears to contain binary data and cannot be processed as text.',
      };
    }

    return { isValid: true };
  } catch (error) {
    safeConsole.error('Content validation error:', error);
    return {
      isValid: false,
      error: 'Unable to validate file content.',
    };
  }
};

/**
 * Format file size untuk display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * Check total storage usage untuk user
 */
export const checkStorageQuota = (
  currentFiles: Array<{ size: number }>,
  newFileSize: number
): {
  isValid: boolean;
  error?: string;
  usage?: { current: number; max: number; percentage: number };
} => {
  const currentUsage = currentFiles.reduce((total, file) => total + file.size, 0);
  const newTotalUsage = currentUsage + newFileSize;

  const usage = {
    current: newTotalUsage,
    max: SECURE_FILE_LIMITS.MAX_TOTAL_SIZE,
    percentage: (newTotalUsage / SECURE_FILE_LIMITS.MAX_TOTAL_SIZE) * 100,
  };

  if (currentFiles.length >= SECURE_FILE_LIMITS.MAX_FILES_PER_USER) {
    return {
      isValid: false,
      error: `Maximum number of files (${SECURE_FILE_LIMITS.MAX_FILES_PER_USER}) reached.`,
      usage,
    };
  }

  if (newTotalUsage > SECURE_FILE_LIMITS.MAX_TOTAL_SIZE) {
    return {
      isValid: false,
      error: `Total storage quota (${formatFileSize(SECURE_FILE_LIMITS.MAX_TOTAL_SIZE)}) would be exceeded.`,
      usage,
    };
  }

  return { isValid: true, usage };
};
