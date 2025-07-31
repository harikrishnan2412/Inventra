const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
//clconst userRoutes = require('./routes/userRoutes');
//const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
//app.use('/app/user', userRoutes);
//app.use('/app/order', orderRoutes);
app.use('/app/inventory', inventoryRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
