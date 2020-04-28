// import otel dependencies
// import opentelemetry from '@opentelemetry/api';
import { LogLevel } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

function register(serviceName) {
  const jaegerOptions = {
    serviceName: serviceName,
  };
  const exporter = new JaegerExporter(jaegerOptions);

  const provider = new NodeTracerProvider({
    logLevel: LogLevel.ERROR,
   });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  provider.register();

  // const tracer = provider.getTracer(serviceName);
  return provider;
}

export default register;
