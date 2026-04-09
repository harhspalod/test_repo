const db = require('./db');

function login(username, password) {
  // SQL injection vulnerability
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const user = db.query(query);
  
  // XSS vulnerability  
  document.getElementById('welcome').innerHTML = "Welcome " + user.name;
  
  // Hardcoded secret
  const API_KEY = "sk-prod-1234567890abcdef";
  
  // eval vulnerability
  eval(user.permissions);
  
  return user;
}

function resetPassword(email) {
  // No input validation
  const query = "UPDATE users SET password = '" + Math.random() + "' WHERE email = '" + email + "'";
  db.query(query);
  
  // Sending password in plain text email
  sendEmail(email, "Your new password is: " + Math.random());
}

module.exports = { login, resetPassword };
// trigger
// trigger
