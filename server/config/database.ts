import mongoose from 'mongoose';
import { Client } from 'pg';

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

// PostgreSQL connection
const connectPostgreSQL = async (): Promise<Client> => {
  try {
    const client = new Client({
      host: process.env.POSTGRESQL_HOST,
      port: parseInt(process.env.POSTGRESQL_PORT!),
      user: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASSWORD,
      database: process.env.POSTGRESQL_DATABASE,
    });
    
    await client.connect();
    console.log(`PostgreSQL Connected: ${process.env.POSTGRESQL_HOST}`);
    return client;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
};

// Dynamic connection based on environment variable
const connectDB = async (): Promise<typeof mongoose | Client> => {
  const dbType = process.env.DATABASE_TYPE || 'mongodb';
  
  if (dbType === 'mongodb') {
    return await connectMongoDB();
  } else if (dbType === 'postgresql') {
    return await connectPostgreSQL();
  } else {
    throw new Error('Invalid DATABASE_TYPE. Use "mongodb" or "postgresql"');
  }
};

export { connectDB, connectMongoDB, connectPostgreSQL };