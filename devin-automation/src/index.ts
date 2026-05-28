import 'dotenv/config';
import express from 'express';
import path from 'path';
import { initDb } from './db';
import { startPoller } from './poller';
import { dashboardRouter } from './dashboard';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/dashboard', dashboardRouter);

initDb();
startPoller();

app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}/dashboard`);
  console.log(`Polling GitHub every ${process.env.POLL_INTERVAL_MS || 60000}ms`);
});
