const express = require('express');
const router = express.Router();

// This should test application base functionality, e.g. database connection
router.get('/', (req, res, next) => {
  const version = { version: process.env.npm_package_version || process.env.APP_VERSION || 'NOT FOUND' };
  res.status(200).json(version);
});

module.exports = router;