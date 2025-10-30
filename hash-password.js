// Generate bcrypt hash for a password
const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('Usage: node hash-password.js <password>');
  console.log('Example: node hash-password.js mypassword123');
  process.exit(1);
}

console.log('Generating bcrypt hash for password...\n');

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }

  console.log('Password:', password);
  console.log('Hash:    ', hash);
  console.log('\nUse this hash in your SQL INSERT statement:');
  console.log(`INSERT INTO users (id, username, password, firstName, lastName, role) VALUES`);
  console.log(`('your_id', 'your_username', '${hash}', 'First', 'Last', 'admin');`);
});
