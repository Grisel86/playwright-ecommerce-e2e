/**
 * Centralized test user data.
 *
 * Two senior-level points here:
 *
 * 1. We load credentials from environment variables with fallbacks to the
 *    public demo credentials. In a real project you would NEVER hardcode
 *    production credentials — they'd come from a secrets manager (AWS Secrets
 *    Manager, HashiCorp Vault, GitHub Actions secrets, etc.) and be injected
 *    as env vars. The fallback exists only because SauceDemo publishes its
 *    demo credentials openly.
 *
 * 2. We export a typed object, not loose strings. This means tests call
 *    `users.standard.username` instead of a magic string, and TypeScript
 *    catches typos at compile time.
 */
export interface TestUser {
  username: string;
  password: string;
  description: string;
}

export const users = {
  standard: {
    username: process.env.STANDARD_USER ?? 'standard_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
    description: 'A regular user with normal checkout behavior',
  } satisfies TestUser,

  lockedOut: {
    username: process.env.LOCKED_USER ?? 'locked_out_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
    description: 'A user whose account has been locked and cannot sign in',
  } satisfies TestUser,

  problem: {
    username: process.env.PROBLEM_USER ?? 'problem_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
    description: 'A user that triggers known UI bugs — useful for regression tests',
  } satisfies TestUser,

  performanceGlitch: {
    username: process.env.PERF_USER ?? 'performance_glitch_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
    description: 'A user that experiences artificial delays — useful for timeout handling',
  } satisfies TestUser,

  visualUser: {
    username: process.env.VISUAL_USER ?? 'visual_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
    description: 'A user whose account shows visual differences — useful for visual regression',
  } satisfies TestUser,
} as const;
