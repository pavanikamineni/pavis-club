const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');
const INITIAL_DATA_FILE = path.join(__dirname, '..', 'data', 'initialMenu.json');

// Ensure local store file exists
if (!fs.existsSync(DATA_FILE)) {
  try {
    const initialData = fs.readFileSync(INITIAL_DATA_FILE, 'utf8');
    fs.writeFileSync(DATA_FILE, initialData, 'utf8');
  } catch (err) {
    console.error('Error creating local fallback store:', err.message);
  }
}

let pool = null;
let isMySQLConnected = false;
let dbStatusMessage = 'Connecting...';

async function testConnection() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pavis_club',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    isMySQLConnected = true;
    dbStatusMessage = `Connected to MySQL database "${process.env.DB_NAME || 'pavis_club'}"`;
    console.log(`✅ [Database] ${dbStatusMessage}`);
  } catch (err) {
    isMySQLConnected = false;
    dbStatusMessage = `MySQL offline (${err.code || err.message}). Fallback local store is active.`;
    console.log(`⚠️  [Database] ${dbStatusMessage}`);
    console.log(`💡 [Database] To connect your local MySQL server, edit .env with your credentials and run: npm run db:init`);
  }
}

// Fallback JSON Store Helpers
function getStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    const initial = JSON.parse(fs.readFileSync(INITIAL_DATA_FILE, 'utf8'));
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  } catch (err) {
    console.error('Error reading JSON store:', err);
    return { categories: [], items: [], orders: [], reservations: [], messages: [] };
  }
}

function saveStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to JSON store:', err);
  }
}

// Initialize connection immediately
testConnection();

module.exports = {
  get pool() {
    return pool;
  },
  isMySQLConnected: () => isMySQLConnected,
  getStatus: () => ({
    connected: isMySQLConnected,
    type: isMySQLConnected ? 'MySQL 8.0' : 'Fallback File/JSON Store',
    database: process.env.DB_NAME || 'pavis_club',
    message: dbStatusMessage
  }),
  getStore,
  saveStore
};
