// import otel dependencies
// import opentelemetry from '@opentelemetry/api';
import { LogLevel } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor, SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
// import { LightstepExporter } from 'lightstep-opentelemetry-exporter';

// const lightStepToken = Meteor.settings.public.lightStepToken;

function register(serviceName) {
  
  const jaegerOptions = {
    serviceName: serviceName,
  };
  // const exporter = new JaegerExporter(jaegerOptions);

  const provider = new NodeTracerProvider({
    logLevel: LogLevel.ERROR,
   });

  // provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  
  provider.register();

  // const tracer = provider.getTracer(serviceName);
  return provider;
}

export default register;
