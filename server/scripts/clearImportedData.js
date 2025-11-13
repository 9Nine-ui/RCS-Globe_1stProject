import pool from '../config.js';

const TABLES = [
    'archived_processed_rows',
    'archived_imports',
    'processed_rows',
    'processed_rows_v2',
    'data_imports',
    'chart_data'
];

async function clearTables() {
    for (const table of TABLES) {
        try {
            await pool.query(`DELETE FROM ${table}`);
            console.log(`✓ Cleared table: ${table}`);
        } catch (error) {
            if (error && error.message && error.message.includes("doesn't exist")) {
                console.log(`⊘ Skipping missing table: ${table}`);
            } else {
                console.error(`✗ Failed to clear table ${table}:`, error.message || error);
            }
        }
    }
    console.log('\n✓ All data cleared successfully');
    pool.end();
}

clearTables().catch((err) => {
    console.error('Unexpected error while clearing tables:', err);
    pool.end();
});
