const express = require('express');
const path = require('path');
const agentRoutes = require('./routes/agents');
const processRoutes = require('./routes/process');
const cacheRoutes = require('./routes/cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/agents', agentRoutes);
app.use('/api/process', processRoutes);
app.use('/api/cache', cacheRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'CodeClaude Local Agents API funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`CodeClaude Local Agents ejecutándose en puerto ${PORT}`);
});