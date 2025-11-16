export default {
	testEnvironment: 'node',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	transform: {
		'^.+\\.(t|j)sx?$': [
			'@swc/jest',
			{
				jsc: {
					parser: { syntax: 'typescript', tsx: true },
					transform: { react: { runtime: 'automatic' } },
					target: 'es2021'
				},
				module: { type: 'es6' }
			}
		]
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	extensionsToTreatAsEsm: ['.ts', '.tsx'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)']
}
