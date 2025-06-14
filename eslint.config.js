import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: true,
        document: true,
        console: true,
        module: true,
        require: true,
        process: true,
        setTimeout: true,
        clearTimeout: true,
        IntersectionObserver: true,
        URL: true,
        URLSearchParams: true,
        Event: true,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'error',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'es5',
          printWidth: 100,
          semi: true,
          bracketSpacing: true,
        },
      ],
    },
  },
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        beforeEach: true,
        afterEach: true,
        test: true,
        expect: true,
        it: true,
      },
    },
  },
];
