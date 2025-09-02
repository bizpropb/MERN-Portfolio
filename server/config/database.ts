import mongoose from 'mongoose';

// MongoDB connection
const connectMongoDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};


// Database connection
const connectDB = async (): Promise<typeof mongoose> => {
  return await connectMongoDB();
};

export { connectDB, connectMongoDB };