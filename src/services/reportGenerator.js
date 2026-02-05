/**
 * Elite Report Generator
 * 
 * This file now acts as a facade that imports from the modular report-generator skill.
 * The actual implementation has been refactored into:
 * - /skills/report-generator
 * 
 * This file maintains backward compatibility with existing API routes.
 */

// Re-export from skill for backward compatibility
export { generateReport, generateEliteReport } from '../skills/report-generator';
