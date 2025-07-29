#!/usr/bin/env node

/**
 * Production Safety Check Script
 * Memastikan aplikasi siap untuk production deployment
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI Colors untuk output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

let hasErrors = false;
let hasWarnings = false;

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  hasErrors = true;
  log(`❌ ERROR: ${message}`, colors.red);
}

function warn(message) {
  hasWarnings = true;
  log(`⚠️  WARNING: ${message}`, colors.yellow);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

/**
 * Check for unsafe console logs in production
 */
function checkConsoleLogs() {
  info('Checking for unsafe console logs...');

  const patterns = [
    /console\.(log|debug|info|trace|table|group|groupEnd|time|timeEnd)\s*\(/g,
    /console\.(warn|error)\s*\(/g,
  ];

  const excludePatterns = [
    /safeConsole\./,
    /originalConsole\./,
    /import.*console.*then/,
    /\/\*.*console.*\*\//,
    /\/\/.*console/,
    /console.*template/i,
    /console.*example/i,
  ];

  const excludeFiles = [
    'app\\utils\\console.ts', // Console protection utility itself
    'app/utils/console.ts', // Console protection utility itself (unix path)
    'app\\utils\\documentTemplates.ts', // Template content
    'app/utils/documentTemplates.ts', // Template content (unix path)
    'app\\components\\editor\\Toolbar\\', // Template code
    'app/components/editor/Toolbar/', // Template code (unix path)
  ];

  const files = glob.sync('app/**/*.{ts,tsx,js,jsx}', { cwd: rootDir });
  const unsafeConsoles = [];

  files.forEach((file) => {
    // Skip excluded files
    if (excludeFiles.some((excludeFile) => file.includes(excludeFile))) {
      return;
    }

    const filePath = join(rootDir, file);
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();

      // Skip comments and template strings
      if (
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('*') ||
        trimmedLine.startsWith('/*')
      ) {
        return;
      }

      // Check for console usage
      patterns.forEach((pattern) => {
        const matches = line.match(pattern);
        if (matches) {
          // Check if it's excluded (safe usage)
          const isExcluded = excludePatterns.some((excludePattern) => excludePattern.test(line));

          if (!isExcluded) {
            unsafeConsoles.push({
              file: file,
              line: lineNum,
              content: trimmedLine,
              type: matches[1],
            });
          }
        }
      });
    });
  });

  if (unsafeConsoles.length > 0) {
    error(`Found ${unsafeConsoles.length} unsafe console statements:`);
    unsafeConsoles.forEach((item) => {
      log(`  📁 ${item.file}:${item.line}`, colors.cyan);
      log(`     ${item.content}`, colors.white);
    });
    log('\n💡 Recommendation: Replace with safeConsole or remove for production', colors.yellow);
  } else {
    success('No unsafe console logs found');
  }
}

/**
 * Check environment variables
 */
function checkEnvironmentVariables() {
  info('Checking environment variables...');

  const requiredVars = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const optionalVars = ['VITE_SENTRY_DSN'];

  const missingRequired = requiredVars.filter((varName) => !process.env[varName]);
  const missingOptional = optionalVars.filter((varName) => !process.env[varName]);

  if (missingRequired.length > 0) {
    error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  } else {
    success('All required environment variables are set');
  }

  if (missingOptional.length > 0) {
    warn(`Missing optional environment variables: ${missingOptional.join(', ')}`);
    log('  These are recommended for production monitoring', colors.yellow);
  }
}

/**
 * Check for debug code
 */
function checkDebugCode() {
  info('Checking for debug code...');

  const debugPatterns = [
    /debugger\s*;/g,
    /console\.trace\(/g,
    /\.debug\s*=\s*true/g,
    /DEBUG\s*=\s*true/g,
    /VITE_DEBUG\s*=\s*true/g,
  ];

  const files = glob.sync('app/**/*.{ts,tsx,js,jsx}', { cwd: rootDir });
  const debugCode = [];

  files.forEach((file) => {
    const filePath = join(rootDir, file);
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      debugPatterns.forEach((pattern) => {
        if (pattern.test(line) && !line.trim().startsWith('//')) {
          debugCode.push({
            file: file,
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    });
  });

  if (debugCode.length > 0) {
    warn(`Found ${debugCode.length} debug code statements:`);
    debugCode.forEach((item) => {
      log(`  📁 ${item.file}:${item.line}`, colors.cyan);
      log(`     ${item.content}`, colors.white);
    });
  } else {
    success('No debug code found');
  }
}

/**
 * Check build configuration
 */
function checkBuildConfig() {
  info('Checking build configuration...');

  // Check if vite.config.ts exists
  if (!existsSync(join(rootDir, 'vite.config.ts'))) {
    error('vite.config.ts not found');
    return;
  }

  // Check package.json scripts
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const scripts = packageJson.scripts || {};

  const requiredScripts = ['build', 'dev', 'typecheck'];
  const missingScripts = requiredScripts.filter((script) => !scripts[script]);

  if (missingScripts.length > 0) {
    warn(`Missing recommended scripts: ${missingScripts.join(', ')}`);
  } else {
    success('Build configuration looks good');
  }
}

/**
 * Check security configuration
 */
function checkSecurityConfig() {
  info('Checking security configuration...');

  // Check if security utilities exist
  const securityFiles = [
    'app/utils/console.ts',
    'app/utils/sentry.ts',
    'app/utils/errorHandling.ts',
  ];

  const missingSecurityFiles = securityFiles.filter((file) => !existsSync(join(rootDir, file)));

  if (missingSecurityFiles.length > 0) {
    warn(`Missing security files: ${missingSecurityFiles.join(', ')}`);
  } else {
    success('Security configuration files present');
  }
}

/**
 * Main execution
 */
function main() {
  log(`${colors.bold}${colors.magenta}🔍 Production Safety Check${colors.reset}\n`);

  checkConsoleLogs();
  console.log();

  checkEnvironmentVariables();
  console.log();

  checkDebugCode();
  console.log();

  checkBuildConfig();
  console.log();

  checkSecurityConfig();
  console.log();

  // Summary
  log(`${colors.bold}📊 Summary:${colors.reset}`);
  if (hasErrors) {
    error('Production check FAILED - Critical issues found');
    process.exit(1);
  } else if (hasWarnings) {
    warn('Production check PASSED with warnings');
    log('💡 Consider addressing warnings before deployment', colors.yellow);
    process.exit(0);
  } else {
    success('Production check PASSED - Ready for deployment! 🚀');
    process.exit(0);
  }
}

main();
