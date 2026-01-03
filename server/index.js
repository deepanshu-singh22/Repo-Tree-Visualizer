require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(express.json());

// --- ENV Check ---
if (!process.env.EMAIL_USER) console.log("❌ .env missing!");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function fetchWithToken(url) {
    const token = process.env.GITHUB_TOKEN;
    const headers = token ? { 'Authorization': `token ${token}` } : {};
    return await axios.get(url, { headers });
}

// --- DICTIONARY ---
const FILE_MEANINGS = {
    'src': 'Source Code',
    'public': 'Public Assets',
    'components': 'UI Components',
    'assets': 'Images/Fonts',
    'server': 'Backend Logic',
    'client': 'Frontend UI',
    'utils': 'Helpers',
    'config': 'Config Settings',
    'routes': 'API Routes',
    'models': 'DB Models',
    'controllers': 'API Logic',
    'package.json': 'Dependencies',
    '.gitignore': 'Git Ignore',
    'README.md': 'Documentation',
    '.env': 'Secrets',
    'index.js': 'Entry Point',
    'App.js': 'Main Component',
    'vite.config.js': 'Vite Config'
};

function getMeaning(path) {
    const name = path.split('/').pop();
    if (FILE_MEANINGS[name]) return FILE_MEANINGS[name];
    if (name.endsWith('.js')) return "Logic File";
    if (name.endsWith('.css')) return "Styles";
    if (name.endsWith('.html')) return "HTML";
    if (name.endsWith('.json')) return "Data";
    if (name.endsWith('.jsx')) return "Component";
    return "";
}

// --- API ROUTE ---
app.post('/api/generate', async (req, res) => {
    const { url, email } = req.body;
    
    try {
        const cleanUrl = url.trim().replace(/\/$/, "");
        const parts = cleanUrl.split('/');
        const repo = parts[parts.length - 1];
        const owner = parts[parts.length - 2];

        // 1. Fetch Data
        let tree = [];
        try {
            const resMain = await fetchWithToken(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
            tree = resMain.data.tree;
        } catch (e) {
            const resMaster = await fetchWithToken(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`);
            tree = resMaster.data.tree;
        }

        // --- 2. GENERATE CLEAN PDF ---
        const doc = new PDFDocument({ margin: 40 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: `Clean Report: ${repo}`,
                html: `<h3>Your Clean Report is Ready!</h3>`,
                attachments: [{ filename: `${repo}-Report.pdf`, content: pdfData, contentType: 'application/pdf' }]
            });
        });

        // -- HEADER --
        doc.fontSize(18).fillColor('#333').text(`Report: ${repo}`, { align: 'center' });
        doc.fontSize(10).text(`Total Files: ${tree.length}`, { align: 'center' });
        doc.moveDown();
        
        // -- TABLE HEADERS --
        const startX = 40;
        let currentY = doc.y;

        doc.fontSize(10).fillColor('#000');
        doc.text("TYPE", startX, currentY);
        doc.text("FILE PATH", startX + 60, currentY);
        doc.text("DESCRIPTION", startX + 350, currentY); // Right side column
        
        // Line under header
        doc.moveTo(startX, currentY + 15).lineTo(550, currentY + 15).stroke();
        currentY += 25;

        // -- LIST ITEMS --
        tree.forEach((file) => {
            // New Page Logic
            if (currentY > 700) {
                doc.addPage();
                currentY = 40;
            }

            const isFile = file.type === 'blob';
            const meaning = getMeaning(file.path);

            // 1. Type Column
            doc.fontSize(9);
            if (isFile) {
                doc.fillColor('#007bff').text("[ FILE ]", startX, currentY); // Blue
            } else {
                doc.fillColor('#ff9800').text("[ DIR  ]", startX, currentY); // Orange
            }

            // 2. Path Column (Truncate if too long)
            let displayPath = file.path;
            if (displayPath.length > 55) displayPath = displayPath.substring(0, 52) + "...";
            
            doc.fillColor('#333').text(displayPath, startX + 60, currentY);

            // 3. Meaning Column
            if (meaning) {
                doc.fillColor('#666').text(meaning, startX + 350, currentY);
            }

            currentY += 15; // Next Line Gap
        });

        doc.end();

        // Send Data to Frontend
        const nodes = tree.map(f => ({ 
            id: f.path, 
            type: f.type,
            info: getMeaning(f.path)
        }));
        
        res.json({ success: true, data: { nodes } });

    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: "Error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));