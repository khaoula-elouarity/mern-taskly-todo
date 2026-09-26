const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // إيلا كان متصل ديجا، ما تعاودش تفتح الاتصال
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    
    // الاتصال المباشر بدون إعدادات معقدة
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("MongoDB Connected Successfully 🔥");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
  }
};

module.exports = connectDB;