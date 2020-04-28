/* eslint-disable import/prefer-default-export */
import { checkNpmVersions } from 'meteor/tmeasday:check-npm-versions';

checkNpmVersions({
  '@opentelemetry/api': '^0.7.0',
  '@opentelemetry/core': '^0.7.0',
  '@opentelemetry/tracing': '^0.7.0',
}, 'opentelemetry-plugin');

export { default as MeteorTraceProvider } from './tracer.js';
