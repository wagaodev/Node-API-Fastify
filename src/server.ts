import fastify from 'fastify';
import { knex } from './database';

const app = fastify({
  logger: true,
});

app.get('/hello', async () => await knex('sqlite_schema').select('*'));

try {
  app.listen({ port: 3333 });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
