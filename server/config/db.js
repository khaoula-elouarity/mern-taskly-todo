const mongoose = require('mongoose');

// متغير لحفظ حالة الاتصال فـ الذاكرة (Caching) باش ما يبقاش يحل اتصال جديد فكل مرة
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // 👈 هادي هي الأداة السحرية اللي كتحبس داك الـ Timeout
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;