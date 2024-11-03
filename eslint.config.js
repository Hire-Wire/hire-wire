/* eslint-disable import/no-extraneous-dependencies */
// eslint.config.js

import globals from 'globals';
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';

export default [

  // Set the language options, including Node.js globals
  {
    languageOptions: {
      ecmaVersion: 'latest', // Use the latest ECMAScript version
      sourceType: 'module', // Use ES modules
      globals: {
        ...globals.node, // Include Node.js globals
      },
    },
    // Include plugins as objects
    plugins: {
      import: importPlugin,
    },
    // Include recommended configurations from plugins
    rules: {
      // Spread the recommended rules from the plugins
      ...js.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,

      // Define your custom rules (similar to Airbnb style guide)
      // Possible Errors
      'no-await-in-loop': 'error',
      'no-console': 'warn',
      'no-extra-parens': ['error', 'functions'],
      'no-prototype-builtins': 'error',
      'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      'require-atomic-updates': 'error',

      // Best Practices
      'array-callback-return': ['error', { allowImplicit: true }],
      'block-scoped-var': 'error',
      'class-methods-use-this': 'error',
      'consistent-return': 'error',
      curly: ['error', 'all'],
      'default-case': 'error',
      'default-param-last': 'error',
      'dot-location': ['error', 'property'],
      'dot-notation': ['error', { allowKeywords: true }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'grouped-accessor-pairs': 'error',
      'no-alert': 'warn',
      'no-caller': 'error',
      'no-case-declarations': 'error',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      'no-empty-pattern': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-floating-decimal': 'error',
      'no-implicit-coercion': ['error', { allow: ['!!'] }],
      'no-implied-eval': 'error',
      'no-invalid-this': 'error',
      'no-iterator': 'error',
      'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-multi-spaces': ['error', { ignoreEOLComments: false }],
      'no-multi-str': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-proto': 'error',
      'no-redeclare': ['error', { builtinGlobals: false }],
      'no-return-assign': ['error', 'always'],
      'no-return-await': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': ['error', { allowShortCircuit: false, allowTernary: false }],
      'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: true }],
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-void': 'error',
      'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
      'require-await': 'error',
      'wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],
      yoda: ['error', 'never'],

      // Strict Mode
      strict: ['error', 'never'],

      // Variables
      'no-delete-var': 'error',
      'no-shadow': ['error', { builtinGlobals: false, hoist: 'functions', allow: [] }],
      'no-shadow-restricted-names': 'error',
      'no-undef-init': 'error',
      'no-undefined': 'off',
      // 'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],

      // Stylistic Issues
      'array-bracket-newline': ['error', 'consistent'],
      'array-bracket-spacing': ['error', 'never'],
      'array-element-newline': ['error', 'consistent'],
      'block-spacing': ['error', 'always'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],
      'comma-dangle': ['error', {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      }],
      'comma-spacing': ['error', { before: false, after: true }],
      'comma-style': ['error', 'last'],
      'computed-property-spacing': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'func-call-spacing': ['error', 'never'],
      'function-paren-newline': ['error', 'consistent'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'keyword-spacing': ['error', { before: true, after: true }],
      'linebreak-style': ['error', 'unix'],
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: false }],
      'max-len': ['error', { code: 100, tabWidth: 2, ignoreComments: false, ignoreUrls: true }],
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],
      'new-parens': 'error',
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],
      'no-array-constructor': 'error',
      'no-bitwise': 'error',
      'no-continue': 'error',
      'no-lonely-if': 'error',
      'no-mixed-operators': ['error', {
        groups: [
          ['%', '**'],
          ['%', '+'],
          ['%', '-'],
          ['%', '*'],
          ['%', '/'],
          ['/', '*'],
          ['&', '|', '<<', '>>', '>>>'],
          ['==', '!=', '===', '!=='],
          ['&&', '||'],
          ['in', 'instanceof'],
        ],
        allowSamePrecedence: false,
      }],
      'no-multi-assign': ['error'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'no-nested-ternary': 'error',
      'no-new-object': 'error',
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'no-trailing-spaces': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'object-curly-newline': ['error', { consistent: true, multiline: true }],
      'object-curly-spacing': ['error', 'always'],
      'one-var': ['error', 'never'],
      'operator-linebreak': ['error', 'before', { overrides: { '=': 'none' } }],
      'padded-blocks': ['error', 'never'],
      'prefer-object-spread': 'error',
      'quote-props': ['error', 'as-needed', { keywords: false, unnecessary: true, numbers: false }],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      semi: ['error', 'always'],
      'semi-spacing': ['error', { before: false, after: true }],
      'semi-style': ['error', 'last'],
      'space-before-blocks': ['error', 'always'],
      'space-before-function-paren': ['error', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      }],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'spaced-comment': ['error', 'always', {
        line: {
          markers: ['*package', '!', '/', ',', '='],
        },
        block: {
          balanced: true,
          markers: ['*package', '!', ',', ':', '::', 'flow-include'],
          exceptions: ['*'],
        },
      }],

      // ECMAScript 6
      'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
      'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
      'arrow-spacing': ['error', { before: true, after: true }],
      'generator-star-spacing': ['error', { before: false, after: true }],
      'no-confusing-arrow': ['error', { allowParens: true }],
      'no-duplicate-imports': ['error', { includeExports: true }],
      'no-useless-computed-key': ['error', { enforceForClassMembers: true }],
      'no-useless-constructor': 'error',
      'no-useless-rename': ['error', {
        ignoreDestructuring: false,
        ignoreImport: false,
        ignoreExport: false,
      }],
      'no-var': 'error',
      'object-shorthand': ['error', 'always', {
        ignoreConstructors: false,
        avoidQuotes: true,
      }],
      'prefer-arrow-callback': ['error', {
        allowNamedFunctions: false,
        allowUnboundThis: true,
      }],
      'prefer-const': ['error', {
        destructuring: 'all',
        ignoreReadBeforeAssign: true,
      }],
      'prefer-destructuring': ['error', {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: true,
          object: false,
        },
      }, {
        enforceForRenamedProperties: false,
      }],
      'prefer-numeric-literals': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'error',
      'rest-spread-spacing': ['error', 'never'],
      'symbol-description': 'error',
      'template-curly-spacing': ['error', 'never'],
      'yield-star-spacing': ['error', { before: false, after: true }],

      // Import plugin rules (use the plugin's rule namespace)
      'import/extensions': ['error', 'ignorePackages', {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
      }],
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: [
          'test/**', // tape, common npm pattern
          'tests/**', // also common npm pattern
          'spec/**', // mocha, rspec-like pattern
          '**/__tests__/**', // jest pattern
          '**/__mocks__/**', // jest pattern
          'test.{js,jsx}', // repos with a single test file
          'test-*.{js,jsx}', // repos with multiple top-level test files
          '**/*.{test,spec}.{js,jsx}', // tests where the extension denotes that it is a test
          '**/jest.config.js', // jest config
          '**/jest.setup.js', // jest setup
          '**/vue.config.js', // vue-cli config
          '**/webpack.config.js', // webpack config
          '**/webpack.config.*.js', // webpack config
          '**/rollup.config.js', // rollup config
          '**/rollup.config.*.js', // rollup config
          '**/gulpfile.js', // gulp config
          '**/gulpfile.*.js', // gulp config
          '**/Gruntfile{,.js}', // grunt config
          '**/protractor.conf.js', // protractor config
          '**/protractor.conf.*.js', // protractor config
        ],
        optionalDependencies: false,
      }],
      'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true }],
      'import/order': ['error', {
        groups: [['builtin', 'external', 'internal']],
        'newlines-between': 'never',
      }],
    },
  },
];
