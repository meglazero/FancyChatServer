const monk = require('monk');
const connectionString = process.env.MONGODB_URI || 'localhost/fancy-chat';
const db = monk(connectionString);

module.exports = db;