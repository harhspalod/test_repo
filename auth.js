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
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

function login(username, password) {
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
  const user = db.query(query, values);

  if (user && verifyPassword(password, user.password)) {
    // Using environment variables for API keys
    const API_KEY = process.env.API_KEY;

    // Avoiding eval and using permissions system
    if (user.permissions === 'admin') {
      // admin permissions logic
    } else {
      // other permissions logic
    }
  } else {
    throw new Error('Invalid username or password');
  }

  return user;
}

function resetPassword(email) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate({ email });
  if (error) {
    throw new Error(error.details[0].message);
  }

  const query = "SELECT * FROM users WHERE email = $1";
  const values = [email];
  const user = db.query(query, values);

  if (user) {
    const newPassword = crypto.randomBytes(32).toString('hex').slice(0, 12);
    const hashedPassword = hashPassword(newPassword);

    const updateQuery = "UPDATE users SET password = $1 WHERE email = $2";
    const updateValues = [hashedPassword, email];
    db.query(updateQuery, updateValues);

    // Sending password reset link via email
    sendEmail(email, `Reset your password: ${generatePasswordResetLink(user.id)}`);
  }
}

// Password reset link generation function
function generatePasswordResetLink(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const link = `https://example.com/reset-password/${userId}/${token}`;
  return link;
}

// User registration function
function register(username, password, email) {
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
  db.query(query, values);
}

module.exports = { login, resetPassword, register };