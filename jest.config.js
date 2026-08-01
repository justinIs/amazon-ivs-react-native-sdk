module.exports = {
  preset: '@react-native/jest-preset',
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native)/)',
  ],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
};
