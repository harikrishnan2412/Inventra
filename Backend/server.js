const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const stockMonitorRoutes= require('./routes/stockMonitorRoutes');
const salesStatsRoutes= require('./routes/salesStatsRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// app.use('/app/user', userRoutes);
app.use('/app/order', orderRoutes);
app.use('/app/inventory', inventoryRoutes);
app.use('/app/stockmonitor', stockMonitorRoutes);
app.use('/app/stats', salesStatsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
