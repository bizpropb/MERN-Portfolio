import mongoose from 'mongoose';

// Establishes connection to MongoDB database using connection string from environment variables
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


// Main database connection function exported for use throughout the application
const connectDB = async (): Promise<typeof mongoose> => {
  return await connectMongoDB();
};

export { connectDB, connectMongoDB };