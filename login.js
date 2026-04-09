const { login } = require('./auth.js');

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

// Example usage of the fixed login function from auth.js
login('username', 'password').then((user) => {
  document.getElementById('output').innerHTML = user.name;
  const permissions = JSON.parse(user.permissions);
  applyPermissions(permissions);
});