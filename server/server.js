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
    imports: [],
    processedRows: [],
    archivedImports: [],
    archivedProcessedRows: []
};
let inMemoryProcessedId = 1;
let inMemoryImportId = 1;
let useMySQLStorage = true;
let processedRowsTable = 'processed_rows';

const CATEGORY_KEYS = ['transport', 'wireless', 'wireline'];
const TECH_KEYS = ['2g', '3g', 'lte', '5g', 'other'];

const createZeroMap = () => (
    TECH_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {})
);

const createEmptyBreakdownStructure = () => ({
    categories: CATEGORY_KEYS.reduce((acc, category) => {
        acc[category] = {
            total: 0,
            tech: createZeroMap(),
            techPercent: createZeroMap()
        };
        return acc;
    }, {}),
    totals: {
        total: 0,
        tech: createZeroMap(),
        techPercent: createZeroMap()
    }
});

const computeBreakdownFromRows = (rows) => {
    const breakdown = createEmptyBreakdownStructure();

    rows.forEach((row) => {
        const rowCategory = (row.category || '').toString().toLowerCase();
        const rowTech = (row.tech || '').toString().toLowerCase();

        const categoryKey = CATEGORY_KEYS.includes(rowCategory) ? rowCategory : 'wireless';
        const techKey = TECH_KEYS.includes(rowTech) ? rowTech : 'other';

        breakdown.categories[categoryKey].total += 1;
        breakdown.categories[categoryKey].tech[techKey] = (breakdown.categories[categoryKey].tech[techKey] || 0) + 1;
    });

    breakdown.totals.total = CATEGORY_KEYS.reduce(
        (sum, category) => sum + (breakdown.categories[category].total || 0),
        0
    );

    TECH_KEYS.forEach((tech) => {
        breakdown.totals.tech[tech] = CATEGORY_KEYS.reduce(
            (sum, category) => sum + (breakdown.categories[category].tech[tech] || 0),
            0
        );
    });

    CATEGORY_KEYS.forEach((category) => {
        const categoryBucket = breakdown.categories[category];
        categoryBucket.techPercent = createZeroMap();
        TECH_KEYS.forEach((tech) => {
            const count = categoryBucket.tech[tech] || 0;
            categoryBucket.techPercent[tech] = categoryBucket.total
                ? +((count / categoryBucket.total) * 100).toFixed(1)
                : 0;
        });
    });

    breakdown.totals.techPercent = createZeroMap();
    TECH_KEYS.forEach((tech) => {
        const count = breakdown.totals.tech[tech] || 0;
        breakdown.totals.techPercent[tech] = breakdown.totals.total
            ? +((count / breakdown.totals.total) * 100).toFixed(1)
            : 0;
    });

    return breakdown;
};

const extractSimpleCounts = (breakdown) => ({
    transport: breakdown.categories.transport.total,
    wireless: breakdown.categories.wireless.total,
    wireline: breakdown.categories.wireline.total
});

async function refreshChartDataMySQL() {
    const [rows] = await pool.query(`SELECT category, tech FROM ${processedRowsTable}`);
    const breakdown = computeBreakdownFromRows(rows);
    const simpleCounts = extractSimpleCounts(breakdown);

    await pool.query('INSERT INTO chart_data (chart_type, data_values) VALUES (?, ?)', [
        'category_counts',
        JSON.stringify(simpleCounts)
    ]);
    await pool.query('INSERT INTO chart_data (chart_type, data_values) VALUES (?, ?)', [
        'category_tech_counts',
        JSON.stringify(breakdown)
    ]);

    return { breakdown, simpleCounts };
}

function refreshChartDataInMemory() {
    const breakdown = computeBreakdownFromRows(inMemoryData.processedRows);
    const simpleCounts = extractSimpleCounts(breakdown);
    const timestamp = new Date();

    inMemoryData.chartData.push({
        chart_type: 'category_counts',
        data_values: simpleCounts,
        created_at: timestamp
    });
    inMemoryData.chartData.push({
        chart_type: 'category_tech_counts',
        data_values: breakdown,
        created_at: timestamp
    });

    return { breakdown, simpleCounts };
}

// Test MySQL connection
async function testMySQLConnection() {
    try {
        await pool.query('SELECT 1');
        console.log('✓ MySQL connection successful');
        useMySQLStorage = true;
        await ensureProcessedRowsTable();
    await ensureArchiveTables();
        return true;
    } catch (error) {
        console.warn('⚠ MySQL not available, using in-memory storage');
        console.warn('  To enable MySQL: Start MySQL service and create database "rsc_globe_db"');
        useMySQLStorage = false;
        return false;
    }
}

async function ensureArchiveTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS archived_imports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                original_import_id INT NULL,
                file_name VARCHAR(255) NOT NULL,
                import_date DATETIME NULL,
                data_type VARCHAR(100) NULL,
                status VARCHAR(50) NULL,
                deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS archived_processed_rows (
                id INT AUTO_INCREMENT PRIMARY KEY,
                archived_import_id INT NOT NULL,
                original_processed_id INT NULL,
                original_import_id INT NULL,
                file_name VARCHAR(255) NOT NULL,
                import_date DATETIME NULL,
                category VARCHAR(50) NULL,
                tech VARCHAR(50) NULL,
                row_data LONGTEXT NOT NULL,
                deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (archived_import_id) REFERENCES archived_imports(id)
            )
        `);

        try {
            await pool.query('CREATE INDEX idx_archived_processed_import ON archived_processed_rows (archived_import_id)');
        } catch (indexErr) {
            // Index may already exist; ignore duplicate errors
        }
    } catch (error) {
        console.error('Failed to ensure archive tables:', error.message);
    }
}

async function ensureProcessedRowsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${processedRowsTable} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                import_id INT NULL,
                file_name VARCHAR(255) NOT NULL,
                import_date DATETIME NOT NULL,
                category VARCHAR(50) NOT NULL,
                tech VARCHAR(50) NOT NULL,
                row_data LONGTEXT NOT NULL
            )
        `);

        const [importIdColumn] = await pool.query(`SHOW COLUMNS FROM ${processedRowsTable} LIKE "import_id"`);
        if (importIdColumn.length === 0) {
            await pool.query(`ALTER TABLE ${processedRowsTable} ADD COLUMN import_id INT NULL`);
        }

        try {
            await pool.query(`ALTER TABLE ${processedRowsTable} ADD INDEX idx_processed_import (import_id)`);
        } catch (indexError) {
            // Index may already exist; ignore duplicate errors
        }

        try {
            await pool.query(
                `ALTER TABLE ${processedRowsTable} ADD CONSTRAINT fk_processed_import FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE`
            );
        } catch (fkError) {
            // Foreign key may already exist; ignore duplicate errors
        }
    } catch (error) {
        const shouldFallbackToNewTable =
            error.message &&
            (error.message.includes("doesn't exist in engine") || error.message.includes('Tablespace for table'));

        if (shouldFallbackToNewTable) {
            const fallbackName = processedRowsTable === 'processed_rows' ? 'processed_rows_v2' : `${processedRowsTable}_v2`;
            console.warn(
                `Processed rows table issue detected (${error.message}). Switching to fallback table "${fallbackName}".`
            );
            processedRowsTable = fallbackName;
            await ensureProcessedRowsTable();
            return;
        }

        console.error('Failed to ensure processed_rows table:', error.message);
    }
}

// Test connection on startup
testMySQLConnection();

// Configure multer for file upload with file size limits
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

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
        // Read ALL sheets and concatenate rows
        const rows = [];
        for (const sheetName of wb.SheetNames) {
            const ws = wb.Sheets[sheetName];
            if (!ws) continue;
            const sheetRows = xlsx.utils.sheet_to_json(ws, { defval: '' });
            // Optionally annotate with sheet name for downstream diagnostics
            sheetRows.forEach(r => rows.push({ __sheet: sheetName, ...r }));
        }
        return rows;
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

    // 5G / NR
    if (/(\bN78\b|\bN41\b|\bNR26\b|\bNR35\b|\bNR700\b|\bNR\b|\b5G\b)/.test(hay)) return '5g';

    // LTE (FDD/TDD codes and common tokens)
    if (/(\bLTE\b|\bL7\b|\bL9\b|\bL18\b|\bL1800\b|\bL21\b|\bL2100\b|\bL23\b|\bL26\b|\bL2600\b|\bL28\b|\bL700\b|\bL40\b|\bL2300\b|\bMM26\b)/.test(hay)) return 'lte';

    // 3G
    if (/(\bU9\b|\bU900\b|\bU21\b|\bU2100\b|\b3G\b|UMTS|WCDMA|HSPA)/.test(hay)) return '3g';

    // 2G (GSM bands/codes)
    if (/(\bG9\b|\bG900\b|\bG18\b|\bG1800\b|\b2G\b|GSM)/.test(hay)) return '2g';

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

    // Wireline keywords
    if (/(fiber|fibre|ftth|fttx|copper|dsl|wired|osp|duct|splice|odf|ofc)/.test(hay)) return 'wireline';

    // Transport/backhaul keywords
    if (/(transport|backhaul|mpls|ip\s?\b|l2vpn|vlan|microwave|mw|ethernet|ptp|sdh|pdh)/.test(hay)) return 'transport';

    // Wireless indicators: tech present or RAN-specific terms
    if (['2g', '3g', 'lte', '5g'].includes(inferredTech)) return 'wireless';
    if (/(bts|enodeb|gnodeb|gnb|nodeb|trx|oml|rnc|bbu|ru\b|rru|lte|wcdma|umts|gsm|nr|radio)/.test(hay)) return 'wireless';

    // Default to wireless if uncertain
    return 'wireless';
}

// Handle file upload and data processing
app.post('/upload', upload.single('file'), async (req, res) => {
    const startTime = Date.now();
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(`Processing file: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

        const data = await readFileAsRows(req.file.path, req.file.originalname);
        console.log(`File read completed: ${data.length} rows`);

        const importDate = new Date();
        const importDateISO = importDate.toISOString();
        const dataType = path.extname(req.file.originalname).replace('.', '') || 'unknown';

        // Optimize row classification with batch processing
        const classifiedRows = data.map((row, idx) => {
            const techDetected = detectTechFromRow(row);
            const tech = TECH_KEYS.includes(techDetected) ? techDetected : 'other';
            const categoryDetected = detectCategoryFromRow(row, tech);
            const category = CATEGORY_KEYS.includes(categoryDetected) ? categoryDetected : 'wireless';
            const sheetName =
                (row && (row.__sheet || row.sheet || row.Sheet || row.SHEET))
                    ? (row.__sheet || row.sheet || row.Sheet || row.SHEET).toString()
                    : '';

            return {
                temp_id: `${importDateISO}-${idx}`,
                file_name: req.file.originalname,
                import_date: importDateISO,
                category,
                tech,
                sheet: sheetName,
                row_data: row
            };
        });

        console.log(`Classification completed: ${classifiedRows.length} rows`);

        const breakdown = computeBreakdownFromRows(classifiedRows);

        const persistProcessedRowsInMemory = (targetImportId) => {
            classifiedRows.forEach((item) => {
                inMemoryData.processedRows.push({
                    ...item,
                    id: inMemoryProcessedId++,
                    import_id: targetImportId,
                    import_date: item.import_date
                });
            });
        };

        let storageUsed = useMySQLStorage ? 'mysql' : 'memory';
        let importId = null;

        if (useMySQLStorage) {
            let connection;
            try {
                connection = await pool.getConnection();
                await connection.beginTransaction();

                const [importResult] = await connection.query(
                    'INSERT INTO data_imports (file_name, import_date, status, data_type) VALUES (?, ?, ?, ?)',
                    [req.file.originalname, new Date(importDateISO), 'completed', dataType]
                );
                importId = importResult.insertId;

                if (classifiedRows.length > 0) {
                    // Bulk insert for better performance
                    const rowsToInsert = classifiedRows.map(row => [
                        importId,
                        row.file_name,
                        new Date(row.import_date),
                        row.category,
                        row.tech,
                        JSON.stringify(row.row_data)
                    ]);

                    // Insert in chunks to avoid query size limits
                    const chunkSize = 1000;
                    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
                        const chunk = rowsToInsert.slice(i, i + chunkSize);
                        await connection.query(
                            `INSERT INTO ${processedRowsTable} (import_id, file_name, import_date, category, tech, row_data) VALUES ?`,
                            [chunk]
                        );
                    }
                }

                await connection.commit();
                await refreshChartDataMySQL();
                storageUsed = 'mysql';
            } catch (dbError) {
                if (connection) {
                    try {
                        await connection.rollback();
                    } catch (rollbackError) {
                        console.error('Rollback failed:', rollbackError.message);
                    }
                }
                console.error('MySQL error, falling back to in-memory:', dbError.message);
                useMySQLStorage = false;
                storageUsed = 'memory';
                importId = null;
            } finally {
                if (connection) {
                    connection.release();
                }
            }
        }

        if (storageUsed === 'memory') {
            const resolvedImportId = importId ?? inMemoryImportId++;
            importId = resolvedImportId;

            inMemoryData.imports.push({
                id: resolvedImportId,
                file_name: req.file.originalname,
                status: 'completed',
                data_type: dataType,
                import_date: importDate
            });

            persistProcessedRowsInMemory(resolvedImportId);
            refreshChartDataInMemory();
        }

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`Upload completed in ${processingTime}s`);

        res.json({
            message: 'File processed successfully',
            breakdown,
            filesSavedTo: '/uploads',
            rowsProcessed: data.length,
            storageMode: storageUsed === 'mysql' ? 'MySQL' : 'in-memory',
            processingTime: `${processingTime}s`
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
            await pool.query(`TRUNCATE TABLE ${processedRowsTable}`);
        } else {
            inMemoryData.chartData = [];
            inMemoryData.imports = [];
            inMemoryData.processedRows = [];
            inMemoryProcessedId = 1;
            inMemoryImportId = 1;
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
            ? { ...createZeroMap(), ...(latestBreakdown.totals?.tech || {}) }
            : createZeroMap();

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

// List recent imports
app.get('/imports', async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 20, 200));
        if (useMySQLStorage) {
            const [rows] = await pool.query(
                'SELECT id, file_name, import_date, status, data_type FROM data_imports ORDER BY import_date DESC LIMIT ?',[limit]
            );
            return res.json(rows);
        } else {
            const items = [...inMemoryData.imports]
                .sort((a,b)=> new Date(b.import_date) - new Date(a.import_date))
                .slice(0, limit);
            return res.json(items);
        }
    } catch (error) {
        console.error('Error fetching imports:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/imports', async (req, res) => {
    try {
        const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
        const normalizedIds = ids
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0);

        if (normalizedIds.length === 0) {
            return res.status(400).json({ error: 'No valid import IDs provided' });
        }

        if (useMySQLStorage) {
            let connection;
            try {
                connection = await pool.getConnection();
                await connection.beginTransaction();

                const placeholders = normalizedIds.map(() => '?').join(',');

                const [importsToDelete] = await connection.query(
                    `SELECT id, file_name, import_date, status, data_type FROM data_imports WHERE id IN (${placeholders})`,
                    normalizedIds
                );

                const archiveKey = (fileName, importDate) => {
                    if (!fileName || !importDate) return null;
                    const dateObj = importDate instanceof Date ? importDate : new Date(importDate);
                    if (Number.isNaN(dateObj.valueOf())) return null;
                    return `${fileName}__${dateObj.toISOString()}`;
                };

                let processedRowsToArchive = [];
                if (normalizedIds.length > 0) {
                    const [rowsByImport] = await connection.query(
                        `SELECT id, import_id, file_name, import_date, category, tech, row_data FROM ${processedRowsTable} WHERE import_id IN (${placeholders})`,
                        normalizedIds
                    );
                    processedRowsToArchive = rowsByImport;
                }

                const fallbackClauses = [];
                const fallbackParams = [];

                if (importsToDelete.length > 0) {
                    for (const importRow of importsToDelete) {
                        fallbackClauses.push('(import_id IS NULL AND file_name = ? AND import_date = ?)');
                        fallbackParams.push(importRow.file_name);
                        fallbackParams.push(importRow.import_date);
                    }
                }

                let fallbackRowsToArchive = [];
                let fallbackDeleteParams = [];
                if (fallbackClauses.length > 0) {
                    const fallbackQuery = `SELECT id, import_id, file_name, import_date, category, tech, row_data FROM ${processedRowsTable} WHERE ${fallbackClauses.join(' OR ')}`;
                    const [fallbackRows] = await connection.query(fallbackQuery, fallbackParams);
                    fallbackRowsToArchive = fallbackRows;
                    fallbackDeleteParams = [...fallbackParams];
                }

                const rowsToArchive = [...processedRowsToArchive, ...fallbackRowsToArchive];
                const archivedImportMap = new Map();

                // Archive imports (usually small number, so one-by-one is fine)
                for (const importRow of importsToDelete) {
                    const [archiveResult] = await connection.query(
                        `INSERT INTO archived_imports (original_import_id, file_name, import_date, data_type, status) VALUES (?, ?, ?, ?, ?)`,
                        [
                            importRow.id,
                            importRow.file_name,
                            importRow.import_date ? new Date(importRow.import_date) : null,
                            importRow.data_type || null,
                            importRow.status || null
                        ]
                    );

                    const archivedImportId = archiveResult.insertId;
                    archivedImportMap.set(importRow.id, archivedImportId);

                    const key = archiveKey(importRow.file_name, importRow.import_date);
                    if (key) {
                        archivedImportMap.set(key, archivedImportId);
                    }
                }

                // Bulk archive processed rows (much faster for large datasets)
                if (rowsToArchive.length > 0) {
                    const rowsToInsert = [];
                    
                    for (const row of rowsToArchive) {
                        let archivedImportId;
                        if (Number.isInteger(row.import_id)) {
                            archivedImportId = archivedImportMap.get(row.import_id);
                        } else {
                            const key = archiveKey(row.file_name, row.import_date);
                            if (key) {
                                archivedImportId = archivedImportMap.get(key);

                                if (!archivedImportId) {
                                    const matchedImport = importsToDelete.find(
                                        (imp) => archiveKey(imp.file_name, imp.import_date) === key
                                    );
                                    if (matchedImport) {
                                        archivedImportId = archivedImportMap.get(matchedImport.id);
                                    }
                                }
                            }
                        }

                        if (!archivedImportId) {
                            continue;
                        }

                        rowsToInsert.push([
                            archivedImportId,
                            row.id || null,
                            row.import_id || null,
                            row.file_name || '',
                            row.import_date ? new Date(row.import_date) : null,
                            row.category || null,
                            row.tech || null,
                            typeof row.row_data === 'string' ? row.row_data : JSON.stringify(row.row_data ?? {})
                        ]);
                    }

                    // Bulk insert in chunks to avoid query size limits
                    const chunkSize = 1000;
                    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
                        const chunk = rowsToInsert.slice(i, i + chunkSize);
                        if (chunk.length > 0) {
                            await connection.query(
                                `INSERT INTO archived_processed_rows (archived_import_id, original_processed_id, original_import_id, file_name, import_date, category, tech, row_data) VALUES ?`,
                                [chunk]
                            );
                        }
                    }
                }

                if (normalizedIds.length > 0) {
                    await connection.query(
                        `DELETE FROM ${processedRowsTable} WHERE import_id IN (${placeholders})`,
                        normalizedIds
                    );
                }

                if (fallbackClauses.length > 0) {
                    await connection.query(
                        `DELETE FROM ${processedRowsTable} WHERE ${fallbackClauses.join(' OR ')}`,
                        fallbackDeleteParams
                    );
                }

                const [deleteResult] = await connection.query(
                    `DELETE FROM data_imports WHERE id IN (${placeholders})`,
                    normalizedIds
                );

                await connection.commit();

                const { breakdown } = await refreshChartDataMySQL();
                const [[{ count: filesUploaded }]] = await pool.query('SELECT COUNT(*) AS count FROM data_imports');

                return res.json({
                    message: 'Selected imports deleted successfully',
                    deletedCount: deleteResult.affectedRows,
                    stats: {
                        filesUploaded,
                        entriesPerTechnology: breakdown.totals?.tech || createZeroMap(),
                        latestBreakdown: breakdown,
                        storageMode: 'MySQL'
                    }
                });
            } catch (error) {
                if (connection) {
                    try {
                        await connection.rollback();
                    } catch (rollbackError) {
                        console.error('Rollback failed:', rollbackError.message);
                    }
                }
                throw error;
            } finally {
                if (connection) {
                    connection.release();
                }
            }
        }

        const idsToDelete = new Set(normalizedIds);
        const importsBeingDeleted = inMemoryData.imports.filter((item) => idsToDelete.has(item.id));
        const importsBefore = inMemoryData.imports.length;
        inMemoryData.imports = inMemoryData.imports.filter((item) => !idsToDelete.has(item.id));
        const deletedCount = importsBefore - inMemoryData.imports.length;

        const processedRowsBeingDeleted = inMemoryData.processedRows.filter((item) => {
            if (idsToDelete.has(item.import_id)) {
                return true;
            }

            if (!item.import_id) {
                return importsBeingDeleted.some(
                    (imp) => imp.file_name === item.file_name && imp.import_date === item.import_date
                );
            }

            return false;
        });

        const processedBefore = inMemoryData.processedRows.length;
        inMemoryData.processedRows = inMemoryData.processedRows.filter((item) => !processedRowsBeingDeleted.includes(item));
        const processedDeleted = processedBefore - inMemoryData.processedRows.length;

        if (importsBeingDeleted.length > 0) {
            importsBeingDeleted.forEach((imp) => {
                inMemoryData.archivedImports.push({
                    ...imp,
                    archived_at: new Date().toISOString()
                });
            });
        }

        if (processedRowsBeingDeleted.length > 0) {
            processedRowsBeingDeleted.forEach((row) => {
                inMemoryData.archivedProcessedRows.push({
                    ...row,
                    archived_at: new Date().toISOString()
                });
            });
        }

        let breakdown = computeBreakdownFromRows(inMemoryData.processedRows);
        if (deletedCount > 0 || processedDeleted > 0) {
            ({ breakdown } = refreshChartDataInMemory());
        }

        return res.json({
            message: deletedCount > 0 ? 'Selected imports deleted successfully' : 'No matching imports found to delete',
            deletedCount,
            stats: {
                filesUploaded: inMemoryData.imports.length,
                entriesPerTechnology: breakdown.totals?.tech || createZeroMap(),
                latestBreakdown: breakdown,
                storageMode: 'in-memory'
            }
        });
    } catch (error) {
        console.error('Error deleting imports:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/uploads/:category', async (req, res) => {
    try {
        const categoryParam = (req.params.category || '').toLowerCase();
        const normalizedCategory = ['total', 'all'].includes(categoryParam) ? 'all' : categoryParam;
        const allowed = new Set(['wireless', 'transport', 'wireline', 'all']);

        if (!allowed.has(normalizedCategory)) {
            return res.status(400).json({ error: 'Invalid category requested' });
        }

        const searchRaw = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        const hasSearch = searchRaw.length > 0;
        const normalizedSearch = searchRaw.toLowerCase();

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const pageSizeRaw = parseInt(req.query.pageSize, 10);
        const boundedPageSize = Number.isFinite(pageSizeRaw) ? pageSizeRaw : NaN;
        const pageSize = Math.max(1, Math.min(100, Number.isNaN(boundedPageSize) ? 10 : boundedPageSize));
        const offset = (page - 1) * pageSize;

        const buildPayload = (rows, totalRowsRaw) => {
            const totalRows = Number.isFinite(Number(totalRowsRaw)) ? Number(totalRowsRaw) : 0;
            const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
            return {
                rows,
                totalRows,
                page: Math.min(page, totalPages),
                pageSize,
                totalPages
            };
        };

        if (useMySQLStorage) {
            const filters = [];
            const clauses = [];

            if (normalizedCategory !== 'all') {
                clauses.push('category = ?');
                filters.push(normalizedCategory);
            }

            if (hasSearch) {
                clauses.push('(file_name LIKE ? OR category LIKE ? OR tech LIKE ? OR row_data LIKE ?)' );
                const likeValue = `%${searchRaw}%`;
                filters.push(likeValue, likeValue, likeValue, likeValue);
            }

            const whereClause = clauses.length > 0 ? ` WHERE ${clauses.join(' AND ')}` : '';

            const countQuery = `SELECT COUNT(*) AS total FROM ${processedRowsTable}${whereClause}`;
            const [[{ total }]] = await pool.query(countQuery, filters);

            let dataQuery = `SELECT id, file_name, import_date, category, tech, row_data FROM ${processedRowsTable}${whereClause}`;
            dataQuery += ' ORDER BY import_date DESC, id DESC LIMIT ? OFFSET ?';

            const dataParams = [...filters, pageSize, offset];
            const [rows] = await pool.query(dataQuery, dataParams);
            const mappedRows = rows.map(row => {
                let parsedRow = {};
                if (typeof row.row_data === 'string') {
                    try {
                        parsedRow = JSON.parse(row.row_data);
                    } catch {
                        parsedRow = {};
                    }
                } else if (row.row_data && typeof row.row_data === 'object') {
                    parsedRow = row.row_data;
                }

                const sheetName =
                    (row.sheet || parsedRow.__sheet || parsedRow.sheet || parsedRow.Sheet || parsedRow.SHEET)
                        ? (row.sheet || parsedRow.__sheet || parsedRow.sheet || parsedRow.Sheet || parsedRow.SHEET).toString()
                        : '';

                return {
                    id: row.id,
                    file_name: row.file_name,
                    import_date: row.import_date instanceof Date ? row.import_date.toISOString() : row.import_date,
                    category: row.category,
                    tech: row.tech,
                    sheet: sheetName,
                    row_data: parsedRow
                };
            });
            return res.json(buildPayload(mappedRows, total));
        }

        let rows = inMemoryData.processedRows;
        if (normalizedCategory !== 'all') {
            rows = rows.filter(item => item.category === normalizedCategory);
        }

        if (hasSearch) {
            rows = rows.filter(item => {
                const haystack = [
                    item.file_name,
                    item.category,
                    item.tech,
                ]
                    .filter(value => value !== null && value !== undefined)
                    .map(value => value.toString().toLowerCase())
                    .join(' ');

                let rowDataText = '';
                if (item.row_data) {
                    if (typeof item.row_data === 'string') {
                        rowDataText = item.row_data.toLowerCase();
                    } else {
                        try {
                            rowDataText = JSON.stringify(item.row_data).toLowerCase();
                        } catch {
                            rowDataText = '';
                        }
                    }
                }

                return haystack.includes(normalizedSearch) || rowDataText.includes(normalizedSearch);
            });
        }

        const totalRows = rows.length;

        const paginatedRows = rows
            .slice()
            .sort((a, b) => new Date(b.import_date) - new Date(a.import_date))
            .slice(offset, offset + pageSize)
            .map(item => {
                const sheetName =
                    (item.sheet || (item.row_data && (item.row_data.__sheet || item.row_data.sheet || item.row_data.Sheet || item.row_data.SHEET)))
                        ? (item.sheet || item.row_data.__sheet || item.row_data.sheet || item.row_data.Sheet || item.row_data.SHEET).toString()
                        : '';

                return {
                    ...item,
                    sheet: sheetName
                };
            });

        return res.json(buildPayload(paginatedRows, totalRows));
    } catch (error) {
        console.error('Error fetching uploads by category:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5001;

// Archive API endpoints
app.get('/api/archives', async (req, res) => {
    try {
        if (useMySQLStorage) {
            const [rows] = await pool.query(`
                SELECT id, archived_import_id, original_processed_id, original_import_id,
                       file_name, import_date, category, tech, row_data, deleted_at as archived_date
                FROM archived_processed_rows
                ORDER BY deleted_at DESC
                LIMIT 1000
            `);
            
            const mappedRows = rows.map(row => ({
                id: row.id,
                archived_import_id: row.archived_import_id,
                original_processed_id: row.original_processed_id,
                original_import_id: row.original_import_id,
                file_name: row.file_name,
                import_date: row.import_date,
                category: row.category,
                tech: row.tech,
                row_data: typeof row.row_data === 'string' ? JSON.parse(row.row_data) : row.row_data,
                archived_date: row.archived_date
            }));
            
            return res.json(mappedRows);
        } else {
            // In-memory storage
            return res.json(inMemoryData.archivedProcessedRows || []);
        }
    } catch (error) {
        console.error('Error fetching archives:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/archives/restore', async (req, res) => {
    try {
        const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
        const normalizedIds = ids.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0);
        
        if (normalizedIds.length === 0) {
            return res.status(400).json({ error: 'No valid archive IDs provided' });
        }
        
        if (useMySQLStorage) {
            let connection;
            try {
                connection = await pool.getConnection();
                await connection.beginTransaction();
                
                const placeholders = normalizedIds.map(() => '?').join(',');
                
                // Get archived rows to restore
                const [archivedRows] = await connection.query(
                    `SELECT * FROM archived_processed_rows WHERE id IN (${placeholders})`,
                    normalizedIds
                );
                
                if (archivedRows.length > 0) {
                    // Restore to processed_rows table
                    const rowsToInsert = archivedRows.map(row => [
                        row.original_import_id,
                        row.file_name,
                        row.import_date ? new Date(row.import_date) : new Date(),
                        row.category || 'wireless',
                        row.tech || 'other',
                        typeof row.row_data === 'string' ? row.row_data : JSON.stringify(row.row_data)
                    ]);
                    
                    const chunkSize = 1000;
                    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
                        const chunk = rowsToInsert.slice(i, i + chunkSize);
                        await connection.query(
                            `INSERT INTO ${processedRowsTable} (import_id, file_name, import_date, category, tech, row_data) VALUES ?`,
                            [chunk]
                        );
                    }
                    
                    // Delete from archive
                    await connection.query(
                        `DELETE FROM archived_processed_rows WHERE id IN (${placeholders})`,
                        normalizedIds
                    );
                }
                
                await connection.commit();
                await refreshChartDataMySQL();
                
                return res.json({ message: 'Records restored successfully', restoredCount: archivedRows.length });
            } catch (error) {
                if (connection) {
                    try {
                        await connection.rollback();
                    } catch (rollbackError) {
                        console.error('Rollback failed:', rollbackError.message);
                    }
                }
                throw error;
            } finally {
                if (connection) {
                    connection.release();
                }
            }
        } else {
            // In-memory restore
            const idsToRestore = new Set(normalizedIds);
            const rowsToRestore = inMemoryData.archivedProcessedRows.filter(item => idsToRestore.has(item.id));
            
            rowsToRestore.forEach(row => {
                inMemoryData.processedRows.push({
                    ...row,
                    id: inMemoryProcessedId++
                });
            });
            
            inMemoryData.archivedProcessedRows = inMemoryData.archivedProcessedRows.filter(
                item => !idsToRestore.has(item.id)
            );
            
            refreshChartDataInMemory();
            
            return res.json({ message: 'Records restored successfully', restoredCount: rowsToRestore.length });
        }
    } catch (error) {
        console.error('Error restoring archives:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/archives/delete', async (req, res) => {
    try {
        const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
        const normalizedIds = ids.map(id => Number(id)).filter(id => Number.isInteger(id) && id > 0);
        
        if (normalizedIds.length === 0) {
            return res.status(400).json({ error: 'No valid archive IDs provided' });
        }
        
        if (useMySQLStorage) {
            const placeholders = normalizedIds.map(() => '?').join(',');
            const [result] = await pool.query(
                `DELETE FROM archived_processed_rows WHERE id IN (${placeholders})`,
                normalizedIds
            );
            
            return res.json({ message: 'Records deleted permanently', deletedCount: result.affectedRows });
        } else {
            // In-memory delete
            const idsToDelete = new Set(normalizedIds);
            const before = inMemoryData.archivedProcessedRows.length;
            inMemoryData.archivedProcessedRows = inMemoryData.archivedProcessedRows.filter(
                item => !idsToDelete.has(item.id)
            );
            const deletedCount = before - inMemoryData.archivedProcessedRows.length;
            
            return res.json({ message: 'Records deleted permanently', deletedCount });
        }
    } catch (error) {
        console.error('Error deleting archives:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});