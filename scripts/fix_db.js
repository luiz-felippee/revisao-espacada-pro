import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_REF = 'vzvrpiykgbbbhrlpsvxp';
const DB_PASSWORD = 'sYnyUKgIQnKTKGAI';
const DB_HOST = `db.${PROJECT_REF}.supabase.co`;
// Connection string padrão do Supabase Transaction Pooler (Supavisor) na porta 5432 (Session) ou 6543 (Transaction)
// Vamos usar Direct Connection (5432) pois estamos rodando DDL
const CONNECTION_STRING = `postgres://postgres.${PROJECT_REF}:${DB_PASSWORD}@${DB_HOST}:5432/postgres`;

console.log('🔗 Connecting to database...');
console.log(`📡 Host: ${DB_HOST}`);

const client = new Client({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log('✅ Connected successfully!');

        const sqlPath = path.resolve(__dirname, '../supabase/migrations/20260122_FIX_ALL_SCHEMA.sql');

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`Migration file not found at ${sqlPath}`);
        }

        console.log(`📄 Reading SQL from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🔄 Applying migration... (This may take a moment)');
        // Executar o SQL inteiro
        await client.query(sql);

        console.log('✨ MIGRATION APPLIED SUCCESSFULLY! ✨');

    } catch (e) {
        console.error('❌ Migration failed:', e.message);
        if (e.code) console.error('Error Code:', e.code);
    } finally {
        await client.end();
    }
}

run();
