import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // default XAMPP password is empty
    database: 'rsc_globe_db'  // Correct database name
}).promise();

export default pool;