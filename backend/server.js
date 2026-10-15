const { createApp } = require('./app');
const { openDatabase, initializeDatabase } = require('../database/setup');

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve essere un numero tra 1 e 65535.');
}

const db = openDatabase();
initializeDatabase(db);

const app = createApp(db);
app.listen(port, () => {
  console.log(`Backend SportHub disponibile su http://localhost:${port}`);
});
