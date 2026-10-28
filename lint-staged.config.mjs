const quote = (files) => files.map((file) => JSON.stringify(file)).join(' ');

/**
 * Staged-file checks. Both commands need the right working directory:
 * - UI ESLint uses the flat config in apps/ui.
 * - Backend oxlint runs type-aware, which needs apps/backend/tsconfig.json.
 */
export default {
  'apps/ui/**/*.{ts,tsx}': (files) =>
    `eslint --fix --config apps/ui/eslint.config.js ${quote(files)}`,
  'apps/backend/**/*.ts': (files) => {
    const relative = files.map((file) => file.replace(/^apps\/backend\//, ''));
    return `cd apps/backend && npx oxlint --type-aware ${quote(relative)}`;
  },
};
