
import opentelemetry from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/web';
import {
  // ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { DocumentLoad } from '@opentelemetry/plugin-document-load';
import { ZoneContextManager } from '@opentelemetry/context-zone';
// import { CollectorExporter } from '@opentelemetry/exporter-collector';
// import { LightstepExporter } from 'lightstep-opentelemetry-exporter';
import { ConsoleSpanExporter } from './exporter';

// const lightStepToken = Meteor.settings.public.lightStepToken

function MeteorTraceProvider(serviceName) {
  const collectorOptions = {
    url: 'http://localhost:14268',
  };

  // Create a provider for activating and tracking spans
  const tracerProvider = new WebTracerProvider({
    plugins: [new DocumentLoad()],
  });

  // Configure a span processor and exporter for the tracer
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
 /*  tracerProvider.addSpanProcessor(
    new SimpleSpanProcessor(
      new LightstepExporter({
        serviceName: serviceName,
        token: lightStepToken,
      }),
    ),
  ); */
  // const exporter = new CollectorExporter(collectorOptions);
  // tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exporter));

  // Register the tracer
  tracerProvider.register({
    contextManager: new ZoneContextManager().enable(),
  });

  return tracerProvider;
}

export default MeteorTraceProvider;
