const express = require('express');
const cors = require('cors');
require('dotenv').config();

// جيب دالة الاتصال اللي قادينا فـ config/db.js
const connectDB = require('./config/db');

const app = express();

app.use(express.json());
app.use(cors());

// 👈 هنا كنعطيو الأوامر باش يتصل بالداتابيز قبل ما يخدم أي Route
connectDB();

// ==========================================
// ربط الـ Routes ديالك (أو الكود ديالك الحالي)
// ==========================================
// مثال على ربط ملفات الـ Routes (تأكدي من الأسماء واش هما هادوك عندك):
// const authRoutes = require('./routes/auth');
// const taskRoutes = require('./routes/tasks');
// 
// app.use('/api/auth', authRoutes);
// app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('API is running successfully...');
});

// تشغيل السيرفر محلياً فـ لوكال (مكياثرش على Vercel)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;