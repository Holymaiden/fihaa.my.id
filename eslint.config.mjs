// Flat config port of the old .eslintrc.json.
import tsPlugin from '@typescript-eslint/eslint-plugin';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';

const prettierRule = [
  'error',
  {
    singleQuote: true,
    endOfLine: 'auto',
  },
];

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '**/*.mjs',
      '**/*.config.js',
      '.prettierrc.js',
    ],
  },
  ...nextCoreWebVitals,
  prettierRecommended,
  {
    plugins: { unicorn },
    rules: {
      'prettier/prettier': prettierRule,
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
            camelCase: true,
          },
        },
      ],
    },
  },
  ...tsPlugin.configs['flat/recommended-type-checked'].map((entry) => ({
    ...entry,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'prettier/prettier': prettierRule,
      'max-params': ['error', 3], // Limit the number of parameters in a function to use object instead
      'max-lines-per-function': ['error', 150],
      'react/destructuring-assignment': 'off', // Vscode doesn't support automatically destructuring, it's a pain to add a new variable
      'react/require-default-props': 'off', // Allow non-defined react props as undefined
      '@typescript-eslint/consistent-type-imports': 'error', // Ensure `import type` is used when it's necessary
      'import/prefer-default-export': 'off', // Named export is easier to refactor automatically
      'simple-import-sort/imports': 'error', // Import configuration for `eslint-plugin-simple-import-sort`
      'simple-import-sort/exports': 'error', // Export configuration for `eslint-plugin-simple-import-sort`
      '@typescript-eslint/no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default config;
