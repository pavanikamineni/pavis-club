const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  console.log('🔄 Connecting to MySQL server to initialize Pavi\'s Club database...');
  console.log(`📡 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  console.log(`👤 User: ${process.env.DB_USER || 'root'}`);

  let connection;
  try {
    // Connect without database first to create database if not exists
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server successfully!');

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📦 Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('✅ Tables created successfully!');

    // Read and run seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('🌱 Executing seed.sql...');
    await connection.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    console.log('\n🎉 Pavi\'s Club MySQL Database initialized completely!\n');
  } catch (error) {
    console.error('\n❌ MySQL Database Initialization Error:', error.message);
    console.log('\n💡 Tip: Please check that your MySQL credentials in `.env` are accurate.');
    console.log('   The application also includes resilient auto-fallback so all features work immediately even if MySQL is currently connecting!\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
