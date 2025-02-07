module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	parserOptions: {
		project: './tsconfig.json',
	},
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain
				// any source code, like `@types/unist`
				project: './tsconfig.json',
			},
		},
	},
	plugins: [
		'@typescript-eslint',
		'import',
		'unused-imports',
		'simple-import-sort',
	],
	extends: [
		'eslint:recommended',
		'plugin:prettier/recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'import/prefer-default-export': 'off',
		'no-underscore-dangle': 'off',
		'class-methods-use-this': 'off',
		'no-await-in-loop': 'off',
		'no-constant-condition': 'off',
		'no-restricted-syntax': [
			'error',
			'ForInStatement',
			'LabeledStatement',
			'WithStatement',
		],
		'no-continue': 'off',
		'no-console': 'off',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'import/no-extraneous-dependencies': 'off',
		'@typescript-eslint/no-floating-promises': [
			'error',
			{ ignoreIIFE: true, ignoreVoid: true },
		],
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '_', varsIgnorePattern: '_' },
		],
	},
};