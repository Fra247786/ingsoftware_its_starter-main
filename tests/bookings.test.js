// Proposed API contract: see docs/bookings-api.md. Intentionally red until implemented.
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');
const { createApp } = require('../backend/app');
const { initializeDatabase } = require('../database/setup');

let db;
let server;
let apiUrl;
const validBooking = () => ({
  facilityId: 1, date: '2030-06-15', startTime: '10:00', endTime: '11:00'
});

beforeEach(async () => {
  db = new Database(':memory:');
  initializeDatabase(db);
  server = createApp(db).listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  apiUrl = `http://127.0.0.1:${server.address().port}`;
});
afterEach(async () => {
  try {
    if (server?.listening) await new Promise((resolve, reject) =>
      server.close(error => error ? reject(error) : resolve()));
  } finally {
    db?.close();
  }
});

async function postBooking(body) {
  return fetch(`${apiUrl}/bookings`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
async function expectError(body, status) {
  const response = await postBooking(body);
  assert.equal(response.status, status);
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  const payload = await response.json();
  assert.equal(typeof payload.error, 'string');
  assert.ok(payload.error.trim().length > 0);
}
async function expectCreated(body) {
  const response = await postBooking(body);
  assert.equal(response.status, 201);
  const booking = await response.json();
  assert.ok(Number.isSafeInteger(booking.id) && booking.id > 0);
  for (const [key, value] of Object.entries(body)) assert.equal(booking[key], value);
  return booking;
}

test('POST /bookings crea una prenotazione valida', async () => {
  await expectCreated(validBooking());
});
for (const field of Object.keys(validBooking())) {
  test(`POST /bookings rifiuta il campo mancante ${field}`, async () => {
    const body = validBooking();
    delete body[field];
    await expectError(body, 400);
    // A rejected request must not occupy the slot.
    await expectCreated(validBooking());
  });
}
for (const body of [{}, null, []]) {
  test(`POST /bookings rifiuta body ${JSON.stringify(body)}`, async () => {
    await expectError(body, 400);
  });
}
test('POST /bookings restituisce 404 per impianto inesistente', async () => {
  await expectError({ ...validBooking(), facilityId: 9999 }, 404);
});
for (const facilityId of [0, -1, 1.5, '1', null, 9007199254740992]) {
  test(`POST /bookings rifiuta facilityId ${facilityId}`, async () => {
    await expectError({ ...validBooking(), facilityId }, 400);
  });
}
for (const date of ['2030-02-29', '2030-04-31', '2030-13-01', '2030-00-10',
  '2030-06-00', '15/06/2030', '2030-6-15', '', null]) {
  test(`POST /bookings rifiuta data ${JSON.stringify(date)}`, async () => {
    await expectError({ ...validBooking(), date }, 400);
  });
}
for (const field of ['startTime', 'endTime']) {
  for (const value of ['24:00', '10:60', '9:00', '10:00:00', '', null, 10]) {
    test(`POST /bookings rifiuta ${field} ${JSON.stringify(value)}`, async () => {
      await expectError({ ...validBooking(), [field]: value }, 400);
    });
  }
}
for (const endTime of ['10:00', '09:00']) {
  test(`POST /bookings rifiuta fine ${endTime} non successiva all'inizio`, async () => {
    await expectError({ ...validBooking(), endTime }, 400);
  });
}
test('POST /bookings accetta una data bisestile valida', async () => {
  await expectCreated({ ...validBooking(), date: '2032-02-29' });
});
for (const [startTime, endTime] of [
  ['10:00', '11:00'], ['09:30', '10:30'], ['10:30', '11:30'],
  ['10:15', '10:45'], ['09:00', '12:00']
]) {
  test(`POST /bookings rifiuta sovrapposizione ${startTime}-${endTime}`, async () => {
    await expectCreated(validBooking());
    await expectError({ ...validBooking(), startTime, endTime }, 409);
  });
}
for (const [startTime, endTime] of [['09:00', '10:00'], ['11:00', '12:00']]) {
  test(`POST /bookings accetta intervalli adiacenti ${startTime}-${endTime}`, async () => {
    const first = await expectCreated(validBooking());
    const next = await expectCreated({ ...validBooking(), startTime, endTime });
    assert.notEqual(first.id, next.id);
  });
}
for (const change of [{ facilityId: 2 }, { date: '2030-06-16' }]) {
  test(`POST /bookings separa disponibilità per ${JSON.stringify(change)}`, async () => {
    await expectCreated(validBooking());
    await expectCreated({ ...validBooking(), ...change });
  });
}
