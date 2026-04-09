const db = require('./db');

function login(username, password) {
  const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
  const values = [username, password];
  const user = db.query(query, values);
  
  if (user) {
    document.getElementById('welcome').textContent = `Welcome ${user.name}`;
    
    // Using environment variables for API keys
    const API_KEY = process.env.API_KEY;
    
    // Avoiding eval and using permissions system
    if (user.permissions === 'admin') {
      // admin permissions logic
    } else {
      // other permissions logic
    }
  }
  
  return user;
}

function resetPassword(email) {
  // Input validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address');
  }
  
  const query = "SELECT * FROM users WHERE email = $1";
  const values = [email];
  const user = db.query(query, values);
  
  if (user) {
    const newPassword = Math.random().toString(36).slice(2);
    const hashedPassword = hashPassword(newPassword);
    
    const updateQuery = "UPDATE users SET password = $1 WHERE email = $2";
    const updateValues = [hashedPassword, email];
    db.query(updateQuery, updateValues);
    
    // Sending password reset link via email
    sendEmail(email, `Reset your password: ${generatePasswordResetLink(user.id)}`);
  }
}

// Password hashing function
function hashPassword(password) {
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return hashedPassword;
}

// Password reset link generation function
function generatePasswordResetLink(userId) {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const link = `https://example.com/reset-password/${userId}/${token}`;
  return link;
}

module.exports = { login, resetPassword };