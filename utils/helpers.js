const { v4: uuidv4 } = require('uuid');

// Generate UUID
const generateId = () => {
  return uuidv4();
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    limit: parseInt(limit),
    offset: parseInt(offset),
    page: parseInt(page)
  };
};

// Calculate total pages
const calculateTotalPages = (total, limit) => {
  return Math.ceil(total / limit);
};

// Format user response (remove password)
const formatUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  generateId,
  paginate,
  calculateTotalPages,
  formatUser
};
