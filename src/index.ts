import express, { Router, Request, Response } from 'express';

import { DBClient } from './database_client';

const app = express();
const port = 6969;

const routes = Router();

// GET routes
routes.get('/', (_req: Request, res: Response) => {
  console.log('HTTP GET @ /');
  res.send('😎');
});

routes.get('/contar-clientes', async (req: Request, res: Response) => {
  console.log('HTTP GET @ /contar-clientes');
  try {
    const { id } = req.params;
    const sql_query = `
      SELECT 
        COUNT(*) as total
      FROM cliente;`;
    const db = `rinha`;
    const db_res = await DBClient.query<Array<any>>(sql_query, db, [], true);
    if (db_res[0].length === 0) {
      return res.sendStatus(404);
    }
    const out = {
      total: db_res[0]?.total
    };
    res.json(out);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ err });
  }
});

routes.get('/clientes/:id/extrato', async (req: Request, res: Response) => {
  console.log('HTTP GET @ /clientes/:id/extrato');
  try {
    const { id } = req.params;
    const sql_query = `
            SELECT 
              saldo as total,
              NOW() as data_extrato,
              limite 
            FROM cliente WHERE id = ?;

            SELECT 
              valor,
              tipo,
              descricao,
              realizada_em
            FROM transacao WHERE id_cliente = ?
            ORDER BY realizada_em DESC
            LIMIT 10
            ;`;
    const db = `rinha`;
    const sql_args = [id, id];
    const db_res = await DBClient.query<Array<any>>(
      sql_query,
      db,
      sql_args,
      true
    );
    if (db_res[0].length === 0) {
      return res.status(404).json({ 'err_message': 'Cliente não encontrado' });
    }
    const out = {
      'saldo': db_res[0][0],
      'ultimas_transacoes': db_res[1]
    };
    res.json(out);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ err });
  }
});

// POST routes
routes.post('/clientes/:id/transacoes', async (req: Request, res: Response) => {
  console.log('HTTP POST @ /clientes/:id/transacoes');
  try {
    const { id } = req.params;
    const { valor, tipo, descricao } = req.body;

    if (typeof valor != 'number') {
      const err_message = `O valor da transação deve ser informado como sendo um número, não podendo ser uma string`;
      return res.status(422).json({ err_message });
    }

    if (!Number.isInteger(valor)) {
      const err_message = `O valor da transação deve ser um número inteiro`;
      return res.status(422).json({ err_message });
    }

    if (tipo != 'd' && tipo != 'c') {
      const err_message = `O campo tipo só pode ter os valores 'c' ou 'd'`;
      return res.status(422).json({ err_message });
    }

    if (descricao.length > 10) {
      const err_message = 'O campo descricao deve ter no máximo 10 caracteres';
      return res.status(422).json({
        err_message
      });
    }

    const db = `rinha`;

    const client_data_query = `
                  SELECT 
                    saldo,
                    NOW() as data_extrato,
                    limite 
                  FROM cliente WHERE id = ?;`;
    const client_data_query_args = [id];

    const client_data_res = await DBClient.query<any>(
      client_data_query,
      db,
      client_data_query_args
    );

    if (client_data_res.length === 0) {
      return res.status(404).json({ 'err_message': 'Cliente não encontrado' });
    }

    const client_data = client_data_res[0];

    const new_saldo = client_data?.saldo + valor * (tipo === 'd' ? -1 : 1);

    if (new_saldo < -client_data?.limite) {
      return res.status(422).json({
        'err_message':
          'A transação foi recusada pois o saldo final estaria inferior ao limite permitido para o usuário'
      });
    }
    const sql_query = `
              INSERT INTO transacao (id_cliente, valor, tipo, descricao, realizada_em) VALUES (?,?,?,?, NOW());
              UPDATE cliente SET saldo=? WHERE id=?;
    `;

    const sql_args = [id, valor, tipo, descricao, new_saldo, id];
    await DBClient.query(sql_query, db, sql_args, true);
    res.status(200).json({
      'limite': client_data?.limite,
      'saldo': new_saldo
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
