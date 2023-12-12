import fastify from 'fastify';
import { env } from './env';
import { transactionsRoutes } from './routes/transactions';

const app = fastify({
  logger: true,
});

app.register(transactionsRoutes);

app.listen({ port: env.PORT }).then(() => console.log('HTTP Server Running'));
