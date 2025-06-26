/**
 * @fileoverview Main hooks exports - Centralized hook management
 * @author Senior Developer
 * @version 2.0.0
 */

// Core hooks
export * from './core';

// UI hooks
export * from './ui';

// Editor hooks
export * from './editor';

// Navigation hooks
export * from './navigation';

// Template hooks
export * from './templates';

// Legacy aliases untuk backward compatibility
export { useScrollSpy as useScrollSpyNew } from './navigation';
