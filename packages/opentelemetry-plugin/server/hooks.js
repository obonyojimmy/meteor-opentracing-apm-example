import { CanonicalCode, Context, defaultGetter, TraceFlags } from '@opentelemetry/api';
// import { HttpTraceContext, setExtractedSpanContext, getExtractedSpanContext } from '@opentelemetry/core';
import register from './provider';

const Provider = {};

// Initialize Provider on server startUp
Meteor.startup(() => {
  const { TRACE_SERVICE_NAME } = process.env;
  const provider = register(TRACE_SERVICE_NAME);
  Provider.tracer = provider.getTracer(TRACE_SERVICE_NAME);
  // console.log(provider.extract);
});

// Hook to Server COnnection
Meteor.onConnection(function (connection) {
  const { id, onClose, clientAddress, httpHeaders } = connection;
  console.log(httpHeaders['x-real-ip']);

  /* const extractCarrier = {
    traceparent: httpHeaders['x-real-ip'],
  };
  const propagator = new HttpTraceContext();
  const context = propagator.extract(Context.ROOT_CONTEXT, extractCarrier, defaultGetter);
  */
  /* const extractedSpanContext = {
    traceId: 'b8d520a61ee69ea2',
    spanId: 'cec4eb61f1ae33a9',
    traceFlags: '1',
  }; */

  const carrier = httpHeaders['x-real-ip'].split(':');
  /* const extractedSpanContext = {
    traceId: carrier[2],
    spanId: carrier[1],
    traceFlags: carrier[3],
  }; */
  const context = {
    traceId: carrier[2],
    spanId: carrier[1],
    // traceFlags: TraceFlags.SAMPLED,
    isRemote: true,
  };
  // const linkContext = { traceId: carrier[2], spanId: carrier[1]};
  console.log(context);
  const spanOptions = {
    kind: 1,
    parent: context,
    // links: [{ context: linkContext }],
  };
  // start trace-spans
  const mainSpan = Provider.tracer.startSpan('connected', spanOptions);
  mainSpan.setAttribute('clientAddress', clientAddress);
  mainSpan.setAttribute('connectionId', id);

  onClose(function () {
    // TODO: Use Metrics Api to Measure how long the user is connected
    mainSpan.end();
  });

  // mainSpan.end();
});

// Mutate Methods to include Trace Spans automatically
const originalMethods = Meteor.server.method_handlers;
Meteor.server.method_handlers = Object.entries(originalMethods)
  .reduce(function (prev, [name, handler]) {
    return {
      ...prev,
      [name]: function () {
        const { connection: { id } } = this;
        // const parentSpan = connectedSpans.find(s => s.id === id);
        // const parentSpan = Provider.tracer.getCurrentSpan();
       //  console.log(parentSpan);
        const span = Provider.tracer.startSpan(`Method::${name}`, {
          kind: 1,
          // parent: parentSpan.span,
        });

        span.setAttribute('connectionId', id);

        try {
          const res = handler.apply(this, arguments);

          const userId = Meteor.userId();
          if (userId) {
            span.setAttribute('userId', userId);
            const { profile, emails } = Meteor.user();
            if (profile) {
              span.setAttribute('userProfile', JSON.stringify(profile));
            }
            if (emails) {
              span.setAttribute('userEmails', JSON.stringify(emails));
            }
          }

          span.end();
          return res;
        } catch (error) {
          const userId = Meteor.userId();
          const { message } = error;

          span.setAttribute('errorMsg', message);
          span.addEvent('error', { userId, name, message });

          switch (name) {
            case 'login':
              span.setStatus(CanonicalCode.UNAUTHENTICATED);
              break;
            default:
              break;
          }
          span.end();
          throw error;
        }
      },
    };
  }, {});
