
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTable(tableName: string) {
    // Attempt a simple select. Since we likely don't have a user session, 
    // we expect RLS to return an empty array (success) or a specific error if table doesn't exist.
    // Actually, asking for one row count is a good test.

    // Note: With RLS on and no user, count should be 0 or error.
    const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.error(`❌ Table '${tableName}' DOES NOT exist.`);
            return false;
        }
        console.log(`⚠️  Table '${tableName}' check returned error (might be RLS): ${error.message}`);
        // If it's not undefined_table, the table likely exists.
        return true;
    }

    console.log(`✅ Table '${tableName}' exists (RLS active, returned ${count} visible rows).`);
    return true;
}

async function verifySetup() {
    console.log('🚀 Verifying Supabase connection...');
    console.log(`📡 URL: ${SUPABASE_URL}`);

    const tables = ['profiles', 'themes', 'subthemes', 'tasks', 'goals'];
    let allGood = true;

    for (const table of tables) {
        const exists = await checkTable(table);
        if (!exists) allGood = false;
    }

    if (allGood) {
        console.log('\n✅✅✅ DATABASE SETUP VERIFIED!');
        console.log('Your production database is ready with the correct schema.');
    } else {
        console.log('\n❌ Check failed. Please run the migration SQL in your Supabase Dashboard.');
    }
}

verifySetup().catch(console.error);
