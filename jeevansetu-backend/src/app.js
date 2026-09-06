const express = require('express');
const cors = require('cors');
const consultationsRouter = require('./routes/consultations');
const followupsRouter = require('./routes/followups');
const timelineRouter = require('./routes/timeline');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/consultations', consultationsRouter);
app.use('/api/followups', followupsRouter);
app.use('/api/timeline', timelineRouter);

app.use((error, req, res, next) => {
	console.error(error);
	res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
app.use('/auth', authRoutes);

module.exports = app;
