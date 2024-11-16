// jest.config.mjs
export default {
  // Use the Node test environment
  testEnvironment: 'node',

  // Disable transforming modules (optional, depends on your setup)
  transform: {},

  // Specify file extensions for tests
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],

  // Default timeout for all tests (in milliseconds)
  testTimeout: 15000,

  // If you have setup files, include them here
  // setupFiles: ['./jest.setup.mjs'],

  // Add any other necessary Jest configurations here
};
