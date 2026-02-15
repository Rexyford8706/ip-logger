const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const LOG_FILE = path.join(__dirname, 'ips.txt');

// Catch IPs
app.post('/log', (req, res) => {
    const data = req.body;
    const log = `${new Date().toISOString()} | IP: ${data.ip || req.ip} | UA: ${req.get('User-Agent')} | ${JSON.stringify(data)}\n`;
    
    fs.appendFileSync(LOG_FILE, log);
    res.json({status: 'logged'});
});

// View logs (password: pentest)
app.get('/logs', (req, res) => {
    if (req.query.pass !== 'pentest') {
        return res.status(401).send('Wrong password');
    }
    res.sendFile(path.join(__dirname, LOG_FILE));
});

// Clear logs
app.get('/clear', (req, res) => {
    if (req.query.pass !== 'pentest') {
        return res.status(401).send('Wrong password');
    }
    fs.writeFileSync(LOG_FILE, '');
    res.send('Cleared!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Logger on port ${port}`));
