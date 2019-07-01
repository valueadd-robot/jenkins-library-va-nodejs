module.exports = {
  name: 'va',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/va',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
