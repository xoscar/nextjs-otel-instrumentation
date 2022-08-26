const dotEnv = require('dotenv');
const { resolve } = require('path');
const { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } = require('@opentelemetry/core');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { NodeSDK, api } = require('@opentelemetry/sdk-node');
const { PrismaClientInstrumentation } = require('opentelemetry-instrumentation-prisma-client');

dotEnv.config({
  path: resolve(__dirname, '../.env'),
});

api.propagation.setGlobalPropagator(
  new CompositePropagator({
    propagators: [new W3CBaggagePropagator(), new W3CTraceContextPropagator()],
  })
);

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations(), new PrismaClientInstrumentation()],
});

sdk.start();
