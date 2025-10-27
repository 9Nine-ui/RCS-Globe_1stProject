import mysql from 'mysql2/promise';

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'rsc_globe_db'
        });
        
        console.log('✓ MySQL connection successful!');
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables found:', rows);
        await connection.end();
    } catch (error) {
        console.error('✗ MySQL connection failed:', error.message);
        console.error('Error code:', error.code);
    }
}

testConnection();
