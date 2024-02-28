import express, { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 6969;

const routes = Router();

// GET routes
routes.get('/', (_req: Request, res: Response) => {
  res.send('😎');
});

routes.get('/clientes/:id/extrato', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ 'id': id });
});

// POST routes
routes.post('/clientes/:id/transacoes', (req: Request, res: Response) => {
  const { id } = req.params;
  const { valor, tipo, descricao } = req.body;
  console.log(req.body);
  res.json({ id, valor, tipo, descricao });
});

app.use(express.json());
app.use(routes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
