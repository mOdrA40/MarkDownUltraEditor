#!/usr/bin/env node

/**
 * Netlify Deployment Script for MarkDownUltraRemix
 * Handles React Router v7 specific deployment requirements
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PROJECT_ROOT = process.cwd();
const BUILD_DIR = join(PROJECT_ROOT, 'build');
const CLIENT_DIR = join(BUILD_DIR, 'client');

console.log('🚀 Starting Netlify deployment for MarkDownUltraRemix...');

// 1. Validate environment variables
console.log('📋 Validating environment variables...');
const requiredEnvVars = [
  'VITE_CLERK_PUBLISHABLE_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach((varName) => console.error(`   - ${varName}`));
  console.error('\n💡 Set these in Netlify dashboard: Site settings > Environment variables');
  process.exit(1);
}

console.log('✅ All required environment variables are present');

// 2. Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  execSync('bun run clean', { stdio: 'inherit' });
  console.log('✅ Clean completed');
} catch {
  console.warn('⚠️  Clean failed, continuing...');
}

// 3. Run type checking
console.log('🔍 Running type checking...');
try {
  execSync('bun run typecheck', { stdio: 'inherit' });
  console.log('✅ Type checking passed');
} catch {
  console.error('❌ Type checking failed');
  process.exit(1);
}

// 4. Run linting
console.log('🔧 Running linting...');
try {
  execSync('bun run lint:check', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch {
  console.error('❌ Linting failed');
  process.exit(1);
}

// 5. Build the application
console.log('🏗️  Building application...');
try {
  execSync('bun run build', { stdio: 'inherit' });
  console.log('✅ Build completed');
} catch {
  console.error('❌ Build failed');
  process.exit(1);
}

// 6. Verify build output
console.log('🔍 Verifying build output...');
if (!existsSync(CLIENT_DIR)) {
  console.error('❌ Build output directory not found:', CLIENT_DIR);
  process.exit(1);
}

const indexPath = join(CLIENT_DIR, 'index.html');
if (!existsSync(indexPath)) {
  console.error('❌ index.html not found in build output');
  process.exit(1);
}

console.log('✅ Build output verified');

// 7. Optimize for Netlify
console.log('⚡ Optimizing for Netlify...');

// Copy _redirects to build directory if not already there
const redirectsSource = join(PROJECT_ROOT, 'public', '_redirects');
const redirectsTarget = join(CLIENT_DIR, '_redirects');

if (existsSync(redirectsSource) && !existsSync(redirectsTarget)) {
  const redirectsContent = readFileSync(redirectsSource, 'utf8');
  writeFileSync(redirectsTarget, redirectsContent);
  console.log('✅ _redirects copied to build directory');
}

// Copy _headers to build directory if not already there
const headersSource = join(PROJECT_ROOT, 'public', '_headers');
const headersTarget = join(CLIENT_DIR, '_headers');

if (existsSync(headersSource) && !existsSync(headersTarget)) {
  const headersContent = readFileSync(headersSource, 'utf8');
  writeFileSync(headersTarget, headersContent);
  console.log('✅ _headers copied to build directory');
}

console.log('✅ Netlify optimization completed');

// 8. Final verification
console.log('🔍 Final verification...');
const buildSize = execSync(`du -sh ${CLIENT_DIR}`, { encoding: 'utf8' }).trim();
console.log(`📦 Build size: ${buildSize.split('\t')[0]}`);

console.log('\n🎉 Deployment preparation completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Ensure environment variables are set in Netlify dashboard');
console.log('2. Configure Clerk domain in Clerk dashboard');
console.log('3. Configure Supabase allowed origins');
console.log('4. Deploy to Netlify');

console.log('\n🔗 Useful links:');
console.log(
  '- Netlify Environment Variables: https://docs.netlify.com/environment-variables/overview/'
);
console.log('- Clerk Domain Configuration: https://clerk.com/docs/deployments/overview');
console.log('- Supabase Auth Configuration: https://supabase.com/docs/guides/auth/overview');
