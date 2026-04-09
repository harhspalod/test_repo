require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Password hashing function using stronger algorithm
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(12);
  return bcrypt.hashSync(password, salt);
}

// Password verification function
function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

// Generate password reset token
function generatePasswordResetToken() {
  return uuidv4();
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

    if (user && user.rows && user.rows.length > 0 && verifyPassword(password, user.rows[0].password)) {
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
      const passwordResetToken = generatePasswordResetToken();
      const updateQuery = "UPDATE users SET password_reset_token = $1, password_reset_expiration = NOW() + INTERVAL '1 hour' WHERE email = $2";
      const updateValues = [passwordResetToken, email];
      await db.query(updateQuery, updateValues);

      // Send password reset link via email
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset your password',
        text: `Reset your password: https://example.com/reset-password/${user.rows[0].id}/${passwordResetToken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error(error.message);
        }
      });
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

async function resetPasswordWithToken(userId, token, newPassword) {
  try {
    const query = "SELECT * FROM users WHERE id = $1 AND password_reset_token = $2 AND password_reset_expiration > NOW()";
    const values = [userId, token];
    const user = await db.query(query, values);

    if (user && user.rows && user.rows.length > 0) {
      const hashedPassword = hashPassword(newPassword);
      const updateQuery = "UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expiration = NULL WHERE id = $2";
      const updateValues = [hashedPassword, userId];
      await db.query(updateQuery, updateValues);
    } else {
      throw new Error('Invalid token or token has expired');
    }
  } catch (error) {
    throw new Error(error.message);
  }
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

module.exports = { login, resetPassword, register };// trigger proper review Thu Apr  9 08:38:35 AM IST 2026
