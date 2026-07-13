import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET
};

if (!config.mongoUri) {
  console.error("Missing MONGO_URI in environment variables.");
  process.exit(1);
}

if (!config.jwtSecret) {
  console.error("Missing JWT_SECRET in environment variables.");
  process.exit(1);
}
