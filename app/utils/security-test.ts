/**
 * Security Test Demonstrations
 * Menunjukkan bagaimana sistem keamanan benar-benar bekerja
 */

import { safeConsole } from './console';
import { detectSuspiciousPatterns, sanitizeInput, validateFileUpload } from './security/core';
import { inputValidator, ValidationSchemas } from './security/validation';

/**
 * Test XSS Protection
 */
export const testXSSProtection = () => {
  safeConsole.dev('🔍 Testing XSS Protection...');

  const maliciousInputs = [
    '<script>alert("XSS")</script>',
    '<img src="x" onerror="alert(\'XSS\')">',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<svg onload="alert(\'XSS\')">',
    '<div onclick="alert(\'XSS\')">Click me</div>',
  ];

  maliciousInputs.forEach((input, index) => {
    const sanitized = sanitizeInput(input, { allowHtml: false });
    const isSafe =
      !sanitized.includes('<script>') &&
      !sanitized.includes('javascript:') &&
      !sanitized.includes('onerror=') &&
      !sanitized.includes('onload=') &&
      !sanitized.includes('onclick=');

    safeConsole.dev(`Test ${index + 1}:`);
    safeConsole.dev(`  Input: ${input}`);
    safeConsole.dev(`  Sanitized: ${sanitized}`);
    safeConsole.dev(`  Safe: ${isSafe ? '✅' : '❌'}`);
  });
};

/**
 * Test SQL Injection Protection
 */
export const testSQLInjectionProtection = () => {
  safeConsole.dev('🔍 Testing SQL Injection Protection...');

  const sqlInjectionAttempts = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "1' UNION SELECT * FROM users--",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
  ];

  sqlInjectionAttempts.forEach((input, index) => {
    const result = detectSuspiciousPatterns(input);
    const validation = inputValidator.validateInput(input, ValidationSchemas.searchQuery, {
      fieldName: 'searchQuery',
      userId: 'test-user',
      ipAddress: '127.0.0.1',
    });

    safeConsole.dev(`SQL Injection Test ${index + 1}:`);
    safeConsole.dev(`  Input: ${input}`);
    safeConsole.dev(`  Suspicious: ${result.isSuspicious ? '✅ DETECTED' : '❌ MISSED'}`);
    safeConsole.dev(`  Patterns: ${result.patterns.join(', ')}`);
    safeConsole.dev(`  Validation: ${validation.isValid ? '❌ PASSED' : '✅ BLOCKED'}`);
  });
};

/**
 * Test File Upload Security
 */
export const testFileUploadSecurity = () => {
  safeConsole.dev('🔍 Testing File Upload Security...');

  // Simulasi file berbahaya
  const maliciousFiles = [
    { name: 'virus.exe', type: 'application/x-executable', size: 1024 },
    { name: 'script.php', type: 'application/x-php', size: 512 },
    { name: 'shell.jsp', type: 'application/x-jsp', size: 256 },
    { name: 'malware.bat', type: 'application/x-bat', size: 128 },
    { name: 'huge-file.txt', type: 'text/plain', size: 50 * 1024 * 1024 }, // 50MB
  ];

  // File yang aman
  const safeFiles = [
    { name: 'document.md', type: 'text/markdown', size: 1024 },
    { name: 'image.png', type: 'image/png', size: 2048 },
    { name: 'data.json', type: 'application/json', size: 512 },
  ];

  [...maliciousFiles, ...safeFiles].forEach((fileData, index) => {
    // Simulasi File object
    const file = {
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
    } as File;

    const result = validateFileUpload(file);
    const isMalicious = maliciousFiles.includes(fileData);

    safeConsole.dev(`File Test ${index + 1}:`);
    safeConsole.dev(`  File: ${file.name} (${file.type}, ${file.size} bytes)`);
    safeConsole.dev(`  Expected: ${isMalicious ? 'BLOCK' : 'ALLOW'}`);
    safeConsole.dev(
      `  Result: ${result.isValid ? 'ALLOWED' : 'BLOCKED'} ${result.isValid === !isMalicious ? '✅' : '❌'}`
    );
    if (!result.isValid) {
      safeConsole.dev(`  Errors: ${result.errors?.join(', ')}`);
    }
  });
};

/**
 * Test Environment Variable Security
 */
export const testEnvironmentSecurity = () => {
  safeConsole.dev('🔍 Testing Environment Variable Security...');

  // Test apakah secrets ter-expose
  const sensitiveKeys = [
    'CLERK_SECRET_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_PASSWORD',
    'PRIVATE_KEY',
    'SECRET_TOKEN',
  ];

  const exposedSecrets: string[] = [];

  sensitiveKeys.forEach((key) => {
    // Check if available in client-side
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>)[key]) {
      exposedSecrets.push(key);
    }

    // Check if available in process.env on client
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      exposedSecrets.push(key);
    }
  });

  safeConsole.dev('Environment Security Test:');
  safeConsole.dev(
    `  Exposed Secrets: ${exposedSecrets.length === 0 ? '✅ NONE' : `❌ ${exposedSecrets.join(', ')}`}`
  );

  // Test VITE_ variables (should be available)
  const publicKeys = ['VITE_CLERK_PUBLISHABLE_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

  const missingPublic: string[] = [];
  publicKeys.forEach((key) => {
    if (!process.env[key]) {
      missingPublic.push(key);
    }
  });

  safeConsole.dev(
    `  Required Public Variables: ${missingPublic.length === 0 ? '✅ ALL PRESENT' : `❌ MISSING: ${missingPublic.join(', ')}`}`
  );
};

/**
 * Test Console Protection
 */
export const testConsoleProtection = () => {
  safeConsole.dev('🔍 Testing Console Protection...');

  // Test apakah console logs muncul di production
  const originalEnv = process.env.NODE_ENV;

  // Simulasi production environment
  process.env.NODE_ENV = 'production';

  let productionLogCalled = false;
  const originalLog = console.log;
  console.log = (...args) => {
    productionLogCalled = true;
    originalLog(...args);
  };

  // Test safeConsole di production
  safeConsole.log('This should NOT appear in production');
  safeConsole.dev('This should NOT appear in production');
  safeConsole.warn('This should NOT appear in production');

  // Restore
  console.log = originalLog;
  process.env.NODE_ENV = originalEnv;

  safeConsole.dev('Console Protection Test:');
  safeConsole.dev(`  Production Logs Blocked: ${!productionLogCalled ? '✅ YES' : '❌ NO'}`);
};

/**
 * Run All Security Tests
 */
export const runSecurityTests = () => {
  safeConsole.dev('🔒 Running Security Tests...');
  safeConsole.dev('='.repeat(50));

  testXSSProtection();
  safeConsole.dev('');

  testSQLInjectionProtection();
  safeConsole.dev('');

  testFileUploadSecurity();
  safeConsole.dev('');

  testEnvironmentSecurity();
  safeConsole.dev('');

  testConsoleProtection();
  safeConsole.dev('');

  safeConsole.dev('🎉 Security Tests Completed!');
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    runSecurityTests();
  }, 2000);
}
