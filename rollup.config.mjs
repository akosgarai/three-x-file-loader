import { babel } from '@rollup/plugin-babel';

export default [
	{
		input: './src/XFileLoader.js',
		output: {
			file: './XFileLoader.js',
			format: 'umd',
			name: 'THREE.XFileLoader'
		},
		plugins: [
			babel({ babelHelpers: 'bundled' }),
		],
	}
];
