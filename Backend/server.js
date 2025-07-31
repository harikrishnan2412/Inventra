require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const stockMonitorRoutes= require('./routes/stockMonitorRoutes');
const salesStatsRoutes= require('./routes/salesStatsRoutes');
const reportRoutes=require('./routes/reportRoutes')

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.use('/app/stockmonitor', stockMonitorRoutes);
app.use('/app/stats', salesStatsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/report',reportRoutes);

app.get('/', (req, res) => {
  res.send('API is running successfully');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});