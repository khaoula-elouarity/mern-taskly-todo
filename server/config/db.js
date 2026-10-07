const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    const error = new Error(
      'MONGO_URI is not defined. Set it in server/.env (check MONGO_URI vs MONGODB_URI).'
    );
    error.code = 'MONGO_URI_MISSING';
    throw error;
  }

  try {
    // إيلا كان متصل ديجا، ما تعاودش تفتح الاتصال
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(uri);

    console.log("MongoDB Connected Successfully 🔥");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;