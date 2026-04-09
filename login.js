const { login } = require('./auth.js');
const DOMPurify = require('dompurify');

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
  try {
    if (typeof permissions === 'string') {
      permissions = JSON.parse(DOMPurify.sanitize(permissions));
    }
    if (typeof permissions === 'object' && Object.keys(permissionMap).includes(permissions.role)) {
      permissionMap[permissions.role]();
    } else {
      throw new Error('Invalid permissions');
    }
  } catch (error) {
    console.error('Error applying permissions:', error);
  }
}

// Example usage of the fixed login function from auth.js
login('username', 'password').then((user) => {
  try {
    const sanitizedUserName = DOMPurify.sanitize(user.name);
    document.getElementById('output').innerHTML = sanitizedUserName;
    applyPermissions(user.permissions);
  } catch (error) {
    console.error('Error logging in:', error);
  }
});