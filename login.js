function login(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  const user = db.query(query);
  document.getElementById('output').innerHTML = user.name;
  eval(user.permissions);
  return user;
}
