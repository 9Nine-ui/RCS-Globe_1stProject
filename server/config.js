import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // default XAMPP password is empty
    database: 'rcs_globe_db'  // Fixed: was rsc_globe_db, should be rcs_globe_db
}).promise();

export default pool;