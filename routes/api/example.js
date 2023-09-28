const express = require('express');
const router = express.Router();
const exampleCtrl = require('../../controllers/example.ctrl');
const consoleLogger = require('../../logger/logger.js').console;
const validation = require('../validation/validation.js');

// API route
router.get(['/:exampleId'], validation.validateExampleId, (req, res, next) => {

  return exampleCtrl.exampleMethod(req, res);

});

module.exports = router;
