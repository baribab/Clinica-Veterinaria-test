import express from 'express';
import tutoresRoutes from './routes/tutores.routes.js';
import animaisRoutes from './routes/animais.routes.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/tutores', tutoresRoutes);
app.use('/animais', animaisRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
