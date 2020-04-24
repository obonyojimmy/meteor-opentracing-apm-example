// import otel dependencies
import opentelemetry from '@opentelemetry/api';
import { LogLevel } from '@opentelemetry/core';
import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

 function initTracer(serviceName) {
  const jaegerOptions = {
    serviceName: serviceName,
    // host: process.env.JAEGER_HOST,
    // port: 6832,
  };

  const provider = new NodeTracerProvider({ logLevel: LogLevel.ERROR });

  const exporter = new JaegerExporter(jaegerOptions);

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  provider.register();

  const tracer = opentelemetry.trace.getTracer(serviceName);

  return { tracer, exporter };
}

export default initTracer;
