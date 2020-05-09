import { ExportResult } from '@opentelemetry/base';
import { hrTimeToMicroseconds } from '@opentelemetry/core';
/**
 * This is implementation of {@link SpanExporter} that prints spans to the
 * console. This class can be used for diagnostic purposes.
 */
export class ConsoleSpanExporter {
    /**
     * Export spans.
     * @param spans
     * @param resultCallback
     */
    export(spans, resultCallback) {
        return this._sendSpans(spans, resultCallback);
    }

    /**
     * Shutdown the exporter.
     */
    shutdown() {
        return this._sendSpans([]);
    }

    /**
     * converts span info into more readable format
     * @param span
     */
    _exportInfo(span) {
        return {
            traceId: span.spanContext.traceId,
            parentId: span.parentSpanId,
            name: span.name,
            id: span.spanContext.spanId,
            kind: span.kind,
            timestamp: hrTimeToMicroseconds(span.startTime),
            duration: hrTimeToMicroseconds(span.duration),
            attributes: span.attributes,
            status: span.status,
            events: span.events,
        };
    }

    /**
     * Showing spans in console
     * @param spans
     * @param done
     */
    // eslint-disable-next-line consistent-return
    _sendSpans(spans, done) {
        // eslint-disable-next-line no-restricted-syntax
        for (const span of spans) {
            console.log(this._exportInfo(span));
        }

        if (done) {
            return done(ExportResult.SUCCESS);
        }
    }
}
