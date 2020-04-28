Package.describe({
  name: 'opentelemetry-plugin',
  version: '0.0.1',
  summary: '',
  git: '',
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom('1.8');
  api.use(['ecmascript', 'tmeasday:check-npm-versions']);
  // api.use(['tmeasday:check-npm-versions'], 'client');

  // Main package entrypoint files
  api.mainModule('client/main.js', 'client');
  api.mainModule('server/main.js', 'server');
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('opentelemetry-plugin');
  api.mainModule('tests/opentelemetry-plugin-tests.js');
});
