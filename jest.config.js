module.exports = {
  collectCoverageFrom: [
    '**/*.{ts,js,jsx}'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tools/',
    '/test-report/',
    '/coverage/',
    '/dist/',
    '.config.+(ts|js)',
    'environment.ts',
    'environment.*.ts',
    'polyfills.ts'
  ],
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  resolver: '@nrwl/jest/plugins/resolver',
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Report',
      outputPath: `test-reports/html/result-${Date.now()}.html`
    }],
    ['jest-stare', {
      resultDir: 'test-reports/jest-stare',
      resultHtml: `result-${Date.now()}.html`,
      resultJson: `result-${Date.now()}.json`
    }],
    ['jest-junit', {
      outputDirectory: `test-reports/junit`,
      outputName: `junit-${Date.now()}.xml`
    }]
  ],
  coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
  passWithNoTests: true
};
