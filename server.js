const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// FIXED: Use process.cwd() for Render path
const LOG_FILE = path.join(process.cwd(), 'ips.txt');

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '');
}

// Catch IPs
app.post('/log', (req, res) => {
    const data = req.body;
    const ip = data.ip || req.ip || req.connection.remoteAddress;
    const ua = req.get('User-Agent') || data.ua;
    
    const log = `${new Date().toISOString()} | IP: ${ip} | UA: ${ua} | Data: ${JSON.stringify(data)}\n`;
    
    fs.appendFileSync(LOG_FILE, log);
    console.log('Captured:', ip); // Render logs
    res.json({status: 'logged OK'});
});

// View logs
app.get('/logs', (req, res) => {
    if (req.query.pass !== 'pentest') {
        return res.status(401).send('❌ Wrong password');
    }
    if (fs.existsSync(LOG_FILE)) {
        res.sendFile(LOG_FILE, { root: process.cwd() });
    } else {
        res.send('No logs yet');
    }
});

// Clear logs
app.get('/clear', (req, res) => {
    if (req.query.pass !== 'pentest') {
        return res.status(401).send('❌ Wrong password');
    }
    fs.writeFileSync(LOG_FILE, '');
    res.send('🧹 Logs cleared!');
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ip: req.ip, status: 'alive'});
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
    console.log(`Logger LIVE on port ${port}`);
    console.log(`Logs at: ${LOG_FILE}`);
});
