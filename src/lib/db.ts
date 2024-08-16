import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
};

// Close the pool when the Node.js process exits
process.on('exit', async () => {
  await pool.end();
  console.log('Database connection pool closed.');
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database connection pool closed.');
  process.exit();
});

process.on('SIGTERM', async () => {
  await pool.end();
  console.log('Database connection pool closed.');
  process.exit();
});


// import { MongoClient, Db } from 'mongodb';

// const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
// const client = new MongoClient(uri);
// const dbName = 'url_shortner'; // Replace with your database name
// let db: Db | null = null; // Variable to store the database instance

// export const connectToDatabase = async (): Promise<Db> => {
//   if (!db) {
//     // Connect to the MongoDB server only if not already connected
//     await client.connect();
//     db = client.db(dbName); // Store the database instance
//   }
//   return db; // Return the database instance
// };

// // Close the connection when the Node.js process exits or receives a termination signal
// const closeConnection = async () => {
//   if (await client.connect()) {
//     await client.close();
//     console.log('MongoDB connection closed.');
//   }
// };

// process.on('exit', closeConnection);
// process.on('SIGINT', closeConnection);
// process.on('SIGTERM', closeConnection);