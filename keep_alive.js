// keep_alive.js
// Small HTTP server to keep the Discord bot alive in cloud environments

const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Discord Bot Status</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            margin-top: 100px; 
            background-color: #36393f; 
            color: #ffffff; 
          }
          .status { 
            background-color: #7289da; 
            padding: 20px; 
            border-radius: 10px; 
            display: inline-block; 
          }
        </style>
      </head>
      <body>
        <div class="status">
          <h1>🤖 Discord Bot is Running</h1>
          <p>Bot is online and ready to serve!</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
});

app.get('/ping', (req, res) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`💻 Keep-alive server running on http://0.0.0.0:${port}`);
});

module.exports = app;
