import {
  context,
  trace,
  Tracer,
  Span,
  Context,
  SpanOptions,
  SpanStatusCode,
  Exception,
  propagation,
  SpanKind,
} from '@opentelemetry/api';
import { NextApiHandler } from 'next';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

interface ITracer {
  getTracer(): Tracer;
  createSpanFromContext(name: string, ctx: Context, options?: SpanOptions | undefined): Span;
  runWithSpan<T>(parentSpan: Span, fn: () => Promise<T>): Promise<T>;
  middleware(handler: NextApiHandler): NextApiHandler;
}

const BackendTracer = (): ITracer => ({
  getTracer() {
    return trace.getTracer(process.env.OTEL_SERVICE_NAME as string);
  },
  createSpanFromContext(name, ctx, options) {
    const tracer = this.getTracer();

    if (!ctx) return tracer.startSpan(name, options, context.active());

    return tracer.startSpan(name, options, ctx);
  },
  async runWithSpan(parentSpan, fn) {
    const ctx = trace.setSpan(context.active(), parentSpan);

    try {
      return await context.with(ctx, fn);
    } catch (error) {
      parentSpan.recordException(error as Exception);
      parentSpan.setStatus({ code: SpanStatusCode.ERROR });

      throw error;
    }
  },
  middleware(handler) {
    const wrapper: NextApiHandler = async (request, response) => {
      const { headers, method, url = '', httpVersion } = request;
      const [target] = url.split('?');

      const parentContext = propagation.extract(context.active(), headers);
      const span = await this.createSpanFromContext(`API HTTP ${method}`, parentContext, { kind: SpanKind.SERVER });

      try {
        await this.runWithSpan(span, async () => handler(request, response));
      } catch (error) {
        span.recordException(error as Exception);
        span.setStatus({ code: SpanStatusCode.ERROR });

        throw error;
      } finally {
        span.setAttributes({
          [SemanticAttributes.HTTP_TARGET]: target,
          [SemanticAttributes.HTTP_STATUS_CODE]: response.statusCode,
          [SemanticAttributes.HTTP_ROUTE]: url,
          [SemanticAttributes.HTTP_METHOD]: method,
          [SemanticAttributes.HTTP_USER_AGENT]: headers['user-agent'] || '',
          [SemanticAttributes.HTTP_URL]: `${headers.host}${url}`,
          [SemanticAttributes.HTTP_FLAVOR]: httpVersion,
        });

        span.end();
      }
    };

    return wrapper;
  },
});

export default BackendTracer();
