import shimmer from 'shimmer';
import { Meteor } from 'meteor/meteor';
import register from './tracer';

TraceProvider = {};

TraceProvider.tracer = register('meteor-client').getTracer('meteor-client');

shimmer.wrap(Meteor.connection, 'apply', function (original) {
  return function (...params) {
    const args = Array.from(params);
    const span = TraceProvider.tracer.startSpan(`MethodInvoker::${args[0]}`, {
      kind: 2,
    });
    const returned = original.apply(this, args);
    span.end();
    return returned;
  };
});
