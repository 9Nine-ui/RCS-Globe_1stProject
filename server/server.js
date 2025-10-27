import express from 'express';
import cors from 'cors';
import multer from 'multer';
import xlsx from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';
import pool from './config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// In-memory fallback storage (when MySQL is not available)
let inMemoryData = {
    chartData: [],
    imports: []
};
let useMySQLStorage = true;

// Test MySQL connection
async function testMySQLConnection() {
    try {
        await pool.query('SELECT 1');
        console.log('✓ MySQL connection successful');
        useMySQLStorage = true;
        return true;
    } catch (error) {
        console.warn('⚠ MySQL not available, using in-memory storage');
        console.warn('  To enable MySQL: Start MySQL service and create database "rsc_globe_db"');
        useMySQLStorage = false;
        return false;
    }
}

// Test connection on startup
testMySQLConnection();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve uploaded files statically (optional)
app.use('/uploads', express.static(uploadsDir));

// Helper: read file by extension into array of row objects
async function readFileAsRows(filePath, originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const buf = fs.readFileSync(filePath);

    if (ext === '.xlsx' || ext === '.xls') {
        const wb = xlsx.readFile(filePath);
        const sheet = wb.SheetNames[0];
        return xlsx.utils.sheet_to_json(wb.Sheets[sheet]);
    }

    if (ext === '.json') {
        const json = JSON.parse(buf.toString('utf8'));
        return Array.isArray(json) ? json : [json];
    }

    if (ext === '.csv' || ext === '.txt') {
        // try to detect delimiter (comma, semicolon, tab, pipe)
        const text = buf.toString('utf8');
        const firstLine = text.split(/\r?\n/)[0] || '';
        const delimiter = firstLine.includes('\t')
            ? '\t'
            : firstLine.includes(';')
            ? ';'
            : firstLine.includes('|')
            ? '|'
            : ',';
        const records = parseCsv(text, {
            columns: true,
            skip_empty_lines: true,
            delimiter
        });
        return records;
    }

    // Fallback: treat as lines of text
    return buf
        .toString('utf8')
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line, i) => ({ line, idx: i + 1 }));
}

// Helper: detect technology from any text in row using suffix rules
function detectTechFromRow(row) {
    const hay = Object.values(row || {})
        .filter(v => v !== null && v !== undefined)
        .map(v => v.toString().toUpperCase())
        .join(' ');

    // 5G first
    if (/(\bN78\b|\bN41\b|5G|NR)/.test(hay)) return '5g';
    // LTE
    if (/(\bL18\b|\bL1800\b|\bL26\b|\bL2600\b|\bL28\b|\bL700\b|\bL40\b|\bL2300\b|LTE)/.test(hay)) return 'lte';
    // 3G
    if (/(\bU9\b|\bU900\b|\bU21\b|\bU2100\b|3G|UMTS|WCDMA)/.test(hay)) return '3g';
    // 2G (per reference provided: G9, L9, etc.)
    if (/(\bG9\b|\bG900\b|\bG1800\b|\bL9\b|2G|GSM)/.test(hay)) return '2g';
    return 'other';
}

// Helper: detect category; default wireless for radio techs
function detectCategoryFromRow(row, inferredTech) {
    const explicit = (row.Category || row.category || row.CATEGORY || '').toString().toLowerCase();
    if (explicit.includes('transport')) return 'transport';
    if (explicit.includes('wireline')) return 'wireline';
    if (explicit.includes('wireless')) return 'wireless';

    const hay = Object.values(row || {})
        .filter(v => v !== null && v !== undefined)
        .map(v => v.toString().toLowerCase())
        .join(' ');

    if (/(fiber|ftth|fttx|copper|dsl|wired)/.test(hay)) return 'wireline';
    if (/(transport|backhaul|mpls|ip|microwave|mw)/.test(hay)) return 'transport';

    if (['2g', '3g', 'lte', '5g'].includes(inferredTech)) return 'wireless';
    return 'wireless';
}

// Handle file upload and data processing
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const data = await readFileAsRows(req.file.path, req.file.originalname);

        // Initialize counters and tech breakdown
        const categories = ['transport', 'wireless', 'wireline'];
        const techKeys = ['2g', 'lte', '5g', 'other'];

        const breakdown = {
            categories: {
                transport: { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 } },
                wireless: { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 } },
                wireline: { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 } }
            }
        };

        // Process data and populate breakdown
        data.forEach(row => {
            const tech = detectTechFromRow(row);
            const category = detectCategoryFromRow(row, tech);
            breakdown.categories[category].total += 1;
            breakdown.categories[category].tech[tech] = (breakdown.categories[category].tech[tech] || 0) + 1;
        });

        // Compute totals and percentages
        const totals = { total: 0, tech: { '2g': 0, lte: 0, '5g': 0, other: 0 } };
        categories.forEach(cat => {
            totals.total += breakdown.categories[cat].total;
            techKeys.forEach(tk => {
                totals.tech[tk] += breakdown.categories[cat].tech[tk] || 0;
            });
        });

        // Add percentage fields per category and overall
        Object.keys(breakdown.categories).forEach(cat => {
            const catObj = breakdown.categories[cat];
            catObj.techPercent = {};
            techKeys.forEach(tk => {
                const count = catObj.tech[tk] || 0;
                catObj.techPercent[tk] = catObj.total ? +( (count / catObj.total) * 100 ).toFixed(1) : 0;
            });
        });

        totals.techPercent = {};
        techKeys.forEach(tk => {
            const count = totals.tech[tk] || 0;
            totals.techPercent[tk] = totals.total ? +( (count / totals.total) * 100 ).toFixed(1) : 0;
        });

        breakdown.totals = totals;

        // Store both simple category counts and the detailed breakdown for compatibility
        const simpleCounts = {
            transport: breakdown.categories.transport.total,
            wireless: breakdown.categories.wireless.total,
            wireline: breakdown.categories.wireline.total
        };

        if (useMySQLStorage) {
            try {
                await pool.query('INSERT INTO chart_data (chart_type, data_values) VALUES (?, ?)', ['category_counts', JSON.stringify(simpleCounts)]);
                await pool.query('INSERT INTO chart_data (chart_type, data_values) VALUES (?, ?)', ['category_tech_counts', JSON.stringify(breakdown)]);
                
                // Store file information
                await pool.query(
                    'INSERT INTO data_imports (file_name, status, data_type) VALUES (?, ?, ?)',
                    [req.file.originalname, 'completed', path.extname(req.file.originalname).replace('.', '') || 'unknown']
                );
            } catch (dbError) {
                console.error('MySQL error, falling back to in-memory:', dbError.message);
                useMySQLStorage = false;
                // Store in memory instead
                inMemoryData.chartData.push({ 
                    chart_type: 'category_counts', 
                    data_values: simpleCounts,
                    created_at: new Date()
                });
                inMemoryData.chartData.push({ 
                    chart_type: 'category_tech_counts', 
                    data_values: breakdown,
                    created_at: new Date()
                });
                inMemoryData.imports.push({
                    file_name: req.file.originalname,
                    status: 'completed',
                    data_type: path.extname(req.file.originalname).replace('.', '') || 'unknown',
                    import_date: new Date()
                });
            }
        } else {
            // Use in-memory storage
            inMemoryData.chartData.push({ 
                chart_type: 'category_counts', 
                data_values: simpleCounts,
                created_at: new Date()
            });
            inMemoryData.chartData.push({ 
                chart_type: 'category_tech_counts', 
                data_values: breakdown,
                created_at: new Date()
            });
            inMemoryData.imports.push({
                file_name: req.file.originalname,
                status: 'completed',
                data_type: path.extname(req.file.originalname).replace('.', '') || 'unknown',
                import_date: new Date()
            });
        }

        res.json({
            message: 'File processed successfully',
            breakdown,
            filesSavedTo: '/uploads',
            rowsProcessed: data.length,
            storageMode: useMySQLStorage ? 'MySQL' : 'in-memory'
        });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get latest chart data
app.get('/chart-data', async (req, res) => {
    try {
        if (useMySQLStorage) {
            // Prefer the detailed tech breakdown if available
            const [rowsTech] = await pool.query(
                'SELECT * FROM chart_data WHERE chart_type = "category_tech_counts" ORDER BY created_at DESC LIMIT 1'
            );
            if (rowsTech && rowsTech.length > 0) {
                return res.json(JSON.parse(rowsTech[0].data_values));
            }

            // Fallback to simple counts
            const [rows] = await pool.query(
                'SELECT * FROM chart_data WHERE chart_type = "category_counts" ORDER BY created_at DESC LIMIT 1'
            );
            return res.json(rows[0] ? JSON.parse(rows[0].data_values) : { transport: 0, wireless: 0, wireline: 0 });
        } else {
            // Use in-memory storage
            const techData = inMemoryData.chartData
                .filter(d => d.chart_type === 'category_tech_counts')
                .sort((a, b) => b.created_at - a.created_at)[0];
            
            if (techData) {
                return res.json(techData.data_values);
            }
            
            const simpleData = inMemoryData.chartData
                .filter(d => d.chart_type === 'category_counts')
                .sort((a, b) => b.created_at - a.created_at)[0];
                
            return res.json(simpleData ? simpleData.data_values : { transport: 0, wireless: 0, wireline: 0 });
        }
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Clear all data
app.post('/clear-data', async (req, res) => {
    try {
        if (useMySQLStorage) {
            await pool.query('TRUNCATE TABLE chart_data');
            await pool.query('TRUNCATE TABLE data_imports');
        } else {
            inMemoryData.chartData = [];
            inMemoryData.imports = [];
        }
        res.json({ message: 'All data cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Basic stats endpoint
app.get('/stats', async (req, res) => {
    try {
        let filesUploaded = 0;
        let latestBreakdown = null;
        
        if (useMySQLStorage) {
            const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM data_imports');
            filesUploaded = count;

            // Try latest detailed breakdown
            const [rowsTech] = await pool.query('SELECT * FROM chart_data WHERE chart_type = "category_tech_counts" ORDER BY created_at DESC LIMIT 1');
            latestBreakdown = rowsTech?.[0] ? JSON.parse(rowsTech[0].data_values) : null;
        } else {
            filesUploaded = inMemoryData.imports.length;
            
            const techData = inMemoryData.chartData
                .filter(d => d.chart_type === 'category_tech_counts')
                .sort((a, b) => b.created_at - a.created_at)[0];
            
            latestBreakdown = techData ? techData.data_values : null;
        }

        const entriesPerTechnology = latestBreakdown
            ? latestBreakdown.totals?.tech || { '2g': 0, lte: 0, '5g': 0, other: 0 }
            : { '2g': 0, lte: 0, '5g': 0, other: 0 };

        res.json({ 
            filesUploaded, 
            entriesPerTechnology, 
            latestBreakdown,
            storageMode: useMySQLStorage ? 'MySQL' : 'in-memory'
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});