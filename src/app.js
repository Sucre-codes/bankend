const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const { env } = require('./config/env');

const app = express();

app.use('/static', express.static(path.join(__dirname, '../public')));
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' }); 
});

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);

module.exports = app;