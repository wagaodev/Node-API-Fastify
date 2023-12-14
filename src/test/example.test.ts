import { afterAll, beforeAll, beforeEach, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { describe } from 'node:test';
import { execSync } from 'child_process';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Title',
        amount: 1000,
        type: 'credit',
      })
      .expect(201);
  });

  it('should be able to list all transactions', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Compra do Jetta',
        amount: 65000,
        type: 'credit',
      });

    const cookies = createTransactionsResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'Compra do Jetta',
        amount: 65000,
      }),
    ]);
  });

  it('should be able to list specific transaction', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Title',
        amount: 1000,
        type: 'credit',
      });

    const cookies = createTransactionsResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New Title',
        amount: 1000,
      }),
    );
  });

  it('should be able to get the summary', async () => {
    const createTransactionsResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Playstation 5',
        amount: 4000,
        type: 'credit',
      });

    const cookies = createTransactionsResponse.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Controle PS5',
        amount: 500,
        type: 'credit',
      });

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({ title: 'Base Controle PS5', amount: 300, type: 'debit' });

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 4200,
    });
  });
});
