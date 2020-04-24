import initTracer from '/imports/api/telementry/tracer';

export const { tracer, exporter } = initTracer(process.env.TRACE_SERVICE_NAME);
