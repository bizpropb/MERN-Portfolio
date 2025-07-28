// Create initial collections and indexes
db = db.getSiblingDB('portfolio');

// Create users collection with sample data
db.users.insertMany([
  {
    name: "Sample User",
    email: "user@example.com",
    createdAt: new Date()
  }
]);

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });

print("MongoDB initialized successfully!");