module.exports = {
	extends: ["prettier"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2019,
		sourceType: "module",
		modules: true
	},
	plugins: ["@typescript-eslint"],
	settings: {
		"import/resolver": {
			typescript: {}
		}
	},
	rules: {
		"quotes": [2, "double", { allowTemplateLiterals: true }],
		"class-methods-use-this": 0,
		"consistent-return": 0,
		"func-names": 0,
		"global-require": 0,
		"guard-for-in": 0,
		"import/no-duplicates": 0,
		"import/no-dynamic-require": 0,
		"import/no-extraneous-dependencies": 0,
		"import/prefer-default-export": 0,
		"lines-between-class-members": 0,
		"no-await-in-loop": 0,
		"no-bitwise": 0,
		"no-console": 0,
		"no-continue": 0,
		"no-control-regex": 0,
		"no-empty": 0,
		"no-loop-func": 0,
		"no-nested-ternary": 0,
		"no-param-reassign": 0,
		"no-plusplus": 0,
		"no-restricted-globals": 0,
		"no-restricted-syntax": 0,
		"no-shadow": 0,
		"no-underscore-dangle": 0,
		"no-use-before-define": 0,
		"prefer-const": 0,
		"prefer-destructuring": 0,
		"camelcase": 0,
		"no-unused-vars": 0,
		"@typescript-eslint/no-unused-vars": "warn",
		"@typescript-eslint/no-array-constructor": "error",
		"@typescript-eslint/adjacent-overload-signatures": "error",
		"@typescript-eslint/no-empty-interface": "error",
		"@typescript-eslint/no-inferrable-types": "error",
		"@typescript-eslint/no-misused-new": "error",
		"@typescript-eslint/no-namespace": "error",
		"@typescript-eslint/no-non-null-assertion": "error",
		"@typescript-eslint/no-parameter-properties": "error",
		"@typescript-eslint/prefer-namespace-keyword": "error",
		"@typescript-eslint/type-annotation-spacing": "error"
	}
};
