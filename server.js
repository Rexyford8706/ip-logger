const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create logs dir + file
const logsDir = './logs';
const LOG_FILE = `${logsDir}/ips.txt`;

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '');

// HOME PAGE
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html><body style="font-family:Arial;padding:50px;text-align:center;background:#1e1e1e;color:white;">
<h1>🚀 IP Logger LIVE</h1>
<p><b>Your IP:</b> ${req.ip || 'unknown'}</p>
<hr>
<h3>Controls:</h3>
<p>
• <a href="/logs?pass=pentest" style="color:#4CAF50">📊 View Logs</a><br>
• <a href="/clear?pass=pentest" style="color:#f44336">🧹 Clear Logs</a><br>
• <a href="/test" style="color:#2196F3">🧪 Test</a>
</p>
<hr>
<p>POST endpoint: <code>https://ip-logger-iw55.onrender.com/log</code></p>
</body></html>
    `);
});

// CAPTURE IP
app.post('/log', (req, res) => {
    const data = req.body;
    const log = `${new Date().toISOString()} | IP: ${data.ip || req.ip} | UA: ${req.headers['user-agent']} | ${JSON.stringify(data)}\n`;
    
    fs.appendFileSync(LOG_FILE, log);
    console.log('🎯 CAPTURED:', data.ip || req.ip);
    
    res.json({status: 'logged', ip: data.ip});
});

// VIEW LOGS
app.get('/logs', (req, res) => {
    if (req.query.pass !== 'pentest') {
        return res.status(401).send('<h1>❌ Wrong Password</h1><p>Try: ?pass=pentest</p>');
    }
    
    const logs = fs.readFileSync(LOG_FILE, 'utf8');
    res.send(`
<!DOCTYPE html>
<html><body style="font-family:monospace;background:black;color:lime;padding:20px;font-size:12px;">
<h2>📋 IP LOGS (${new Date().toLocaleString()})</h2>
<pre style="white-space:pre-wrap;">${logs || 'No logs yet...'}</pre>
<p><a href="/">&larr; Back</a> | <a href="/clear?pass=pentest">Clear</a></p>
</body></html>
    `);
});

// CLEAR LOGS
app.get('/clear', (req, res) => {
    if (req.query.pass !== 'pentest') {
        return res.status(401).send('<h1>❌ Wrong Password</h1>');
    }
    fs.writeFileSync(LOG_FILE, '');
    res.send('<h1>🧹 Logs Cleared!</h1><a href="/logs?pass=pentest">Refresh Logs</a>');
});

// TEST
app.get('/test', (req, res) => {
    res.json({alive: true, yourIP: req.ip, time: new Date().toISOString()});
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 LIVE on ${port}`));
