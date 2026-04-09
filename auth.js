require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const crypto = require('crypto');

// Password hashing function using stronger algorithm
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(password, salt);
}

// Password verification function
function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

async function login(username, password) {
  try {
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(8).required(),
    });
    const { error } = schema.validate({ username, password });
    if (error) {
      throw new Error(error.details[0].message);
    }

    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const user = await db.query(query, values);

    if (user && user.rows && user.rows.length > 0 && await verifyPassword(password, user.rows[0].password)) {
      // Using environment variables for API keys
      const API_KEY = process.env.API_KEY;

      // Avoiding eval and using permissions system
      if (user.rows[0].permissions === 'admin') {
        // admin permissions logic
      } else {
        // other permissions logic
      }
      return user.rows[0];
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

async function resetPassword(email) {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });
    const { error } = schema.validate({ email });
    if (error) {
      throw new Error(error.details[0].message);
    }

    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const user = await db.query(query, values);

    if (user && user.rows && user.rows.length > 0) {
      const newPassword = crypto.randomBytes(32).toString('hex').slice(0, 12);
      const hashedPassword = hashPassword(newPassword);

      const updateQuery = "UPDATE users SET password = $1 WHERE email = $2";
      const updateValues = [hashedPassword, email];
      await db.query(updateQuery, updateValues);

      // Sending password reset link via email
      sendEmail(email, `Reset your password: ${generatePasswordResetLink(user.rows[0].id)}`);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

// Password reset link generation function
function generatePasswordResetLink(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const link = `https://example.com/reset-password/${userId}/${token}`;
  return link;
}

// User registration function
async function register(username, password, email) {
  try {
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().min(8).required(),
      email: Joi.string().email().required(),
    });
    const { error } = schema.validate({ username, password, email });
    if (error) {
      throw new Error(error.details[0].message);
    }

    const hashedPassword = hashPassword(password);
    const query = "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)";
    const values = [username, hashedPassword, email];
    await db.query(query, values);
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { login, resetPassword, register };