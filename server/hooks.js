import { Meteor } from 'meteor/meteor';
import { tracer, exporter } from './tracing';

Meteor.onConnection(function (connection) {
  const { id, onClose, clientAddress, httpHeaders } = connection;
  // console.log({ httpHeaders });

  // start trace-spans
  const mainSpan = tracer.startSpan('connected');

  mainSpan.setAttribute('clientAddress', clientAddress);
  mainSpan.setAttribute('connectionId', id);

  onClose(function () {
    mainSpan.end();
    // exporter.shutdown();
  });
});

const originalMethods = Meteor.server.method_handlers;

Meteor.server.method_handlers = Object.entries(originalMethods)
  .reduce(function (prev, [name, handler]) {
    return {
      ...prev,
      [name]: function () {
        const parentSpan = tracer.getCurrentSpan();
        console.log(parentSpan);
        const span = tracer.startSpan(`Method::${name}`);
        const { userId } = this;

        if (userId) {
          span.setAttribute('userId', userId);
        }


        try {
          span.addEvent(`invoking ${name}`);
          const res = handler.apply(this, arguments);
          span.end();
          return res;
        } catch (error) {
          const { message /* stack */ } = error;
          console.log({ userId, name, message });
          span.end();
          throw error;
        }
      },
    };
  }, {});
