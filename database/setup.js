const path = require('node:path');
const Database = require('better-sqlite3');

const databasePath = path.join(__dirname, 'sporthub.db');

const initialFacilities = [
  {
    name: 'Campo Centrale',
    type: 'calcio',
    description: 'Campo all’aperto per partite e allenamenti di calcio.',
    indoor: 0
  },
  {
    name: 'Palestra Nord',
    type: 'basket',
    description: 'Palestra coperta con campo da basket e tribuna.',
    indoor: 1
  },
  {
    name: 'Campo Tennis',
    type: 'tennis',
    description: 'Campo all’aperto per partite singole e in doppio.',
    indoor: 0
  },
  {
    name: 'Piscina Coperta',
    type: 'nuoto',
    description: 'Piscina interna dedicata al nuoto libero e ai corsi.',
    indoor: 1
  }
];

function initializeDatabase(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('calcio', 'basket', 'tennis', 'pallavolo', 'nuoto')),
      description TEXT NOT NULL,
      indoor INTEGER NOT NULL CHECK (indoor IN (0, 1))
    );
  `);

  const count = db.prepare('SELECT COUNT(*) AS total FROM facilities').get().total;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO facilities (name, type, description, indoor)
    VALUES (@name, @type, @description, @indoor)
  `);
  const seed = db.transaction(() => {
    for (const facility of initialFacilities) insert.run(facility);
  });
  seed();
}

function openDatabase() {
  return new Database(databasePath);
}

module.exports = { databasePath, initializeDatabase, openDatabase };
