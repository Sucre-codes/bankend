const dotenv = require('dotenv');

dotenv.config()

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const envMode = process.env.NODE_ENV ?? 'development';
if (!['development', 'test', 'production'].includes(envMode)) {
  throw new Error('NODE_ENV must be development, test, or production');
}


const env = { 
  NODE_ENV: envMode,
  PORT: Number(process.env.PORT ?? '4000'),
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  RESEND_API_KEY: required('RESEND_API_KEY'),
  RESEND_SENDER_EMAIL: required('RESEND_SENDER_EMAIL'),
  RESEND_SENDER_NAME: required('RESEND_SENDER_NAME'),
  CLIENT_ORIGIN: required('CLIENT_ORIGIN'),
};

module.exports = { env };