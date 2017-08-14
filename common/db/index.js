import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

export const createConnection = opts => mongoose.createConnection(
  process.env.MONGODB_URI, { useMongoClient: true, ...opts }
);

export default { mongoose, createConnection };
