import express from 'express';
import asyncDiScope from 'di-tory/async-scope';
import main from './main';
import hooks from './middlewares/express-hooks';

const app = express();
const parseJson = express.json();

app.use((req, res, next) => {
  asyncDiScope.run(next);
});

app.use((req, res, next) => {
  main.setRequestId(req.header('X-Request-Id'));
  next();
});

app.use(
  hooks({
    onRequest: (req) => main.logger.info(`${req.method} ${req.url} - Request`),
    onResponse: (req, res, duration) =>
      main.logger.info(
        `${req.method} ${req.url} - Response ${res.statusCode} ` +
          `[${duration.toFixed(3).padStart(7)}ms]`,
      ),
  }),
);

app.use((req, res, next) =>
  parseJson(req, res, (error) =>
    error instanceof SyntaxError && /json/i.test(error.message)
      ? res.status(400).json({ ok: false, error: 'invalid-json' })
      : next(error),
  ),
);

app.post('/login', async (req, res, next) => {
  const { userName, password } = (req.body ?? {}) as Record<string, unknown>;

  if (typeof userName !== 'string' || typeof password !== 'string') {
    res.status(400).json({ ok: false, error: 'invalid-input' });
    return;
  }

  try {
    const result = await main.signIn(userName, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// express error handler - suppress eslint error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: any, req: any, res: any, next: any) => {
  console.error(error);

  res.status(500).json({ ok: false, error: 'something-went-wrong' });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  main.logger.info(`Server running on port ${port}`);
});
