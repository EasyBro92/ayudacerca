import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['src/database.types.ts', 'coverage/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.test.ts'],
    rules: {
      // El núcleo es TypeScript puro: se usa en web, servidor y app móvil
      'no-restricted-imports': ['error', { patterns: ['node:*', 'react', 'react-native', 'next', 'next/*', '@supabase/*'] }],
    },
  },
);
