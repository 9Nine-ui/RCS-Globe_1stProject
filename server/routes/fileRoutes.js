import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";

const router = express.Router();

// Set up multer for file upload
const upload = multer({ dest: "uploads/" });

// POST /api/files/upload
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log("📄 Excel Data:", data);

    // Example processing
    const counts = { transport: 0, wireless: 0, wireline: 0 };
    data.forEach((item) => {
      if (item.Category === "Transport") counts.transport++;
      else if (item.Category === "Wireless") counts.wireless++;
      else if (item.Category === "Wireline") counts.wireline++;
    });

    // Clean up file
    fs.unlinkSync(req.file.path);

    res.json({
      message: "File uploaded successfully",
      counts,
      rows: data.length,
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Failed to process file" });
  }
});

export default router;
