import { Meteor } from 'meteor/meteor';
import { CanonicalCode } from '@opentelemetry/api';
import { tracer, exporter } from './tracing';

let connectedSpans = [];

Meteor.onConnection(function (connection) {
  const { id, onClose, clientAddress, httpHeaders } = connection;
  console.log(httpHeaders);

  // start trace-spans
  const mainSpan = tracer.startSpan('connected');
  connectedSpans.push({ id, span: mainSpan });

  mainSpan.setAttribute('clientAddress', clientAddress);
  mainSpan.setAttribute('connectionId', id);

  onClose(function () {
    mainSpan.end();
    connectedSpans = connectedSpans.filter(s => s.id !== id);
    // exporter.shutdown();
  });
});

const originalMethods = Meteor.server.method_handlers;

Meteor.server.method_handlers = Object.entries(originalMethods)
  .reduce(function (prev, [name, handler]) {
    return {
      ...prev,
      [name]: function () {
        const { connection: { id } } = this;

        const parentSpan = connectedSpans.find(s => s.id === id);
        const span = tracer.startSpan(`Method::${name}`, { parent: parentSpan.span, kind: 1 });

        span.setAttribute('connectionId', id);

        try {
          const res = handler.apply(this, arguments);

          const userId = Meteor.userId();
          if (userId) {
            const { profile, emails } = Meteor.user();

            span.setAttribute('userId', userId);
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
          // console.log({ userId, name, message });
          span.end();
          throw error;
        }
      },
    };
  }, {});
