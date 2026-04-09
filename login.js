function login(username, password) {
  const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
  const values = [username, password];
  const user = db.query(query, values);
  document.getElementById('output').innerHTML = user.name;
  const permissions = JSON.parse(user.permissions);
  applyPermissions(permissions);
  return user;
}

function applyPermissions(permissions) {
  const permissionMap = {
    'admin': () => {
      // admin permissions
    },
    'moderator': () => {
      // moderator permissions
    },
    'user': () => {
      // user permissions
    }
  };
  if (permissions in permissionMap) {
    permissionMap[permissions]();
  }
}