const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// اتصال بقاعدة البيانات
connectDB().catch((error) => {
  console.error(`❌ ${error.message}`);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// مسار تجريبي للتأكد أن السيرفر خدام
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// 404 + centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;