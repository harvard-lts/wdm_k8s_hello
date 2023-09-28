const consoleLogger = require('../../logger/logger.js').console;

const validation = {};

const exampleIdRegex = /^[0-9]{1,3}$/;

validation.validateExampleId = async (req, res, next) => {
  const exampleId = req.params.exampleId || null;

  let result = {};
  if (!exampleId || !exampleIdRegex.test(exampleId)) {
    result.error = `Invalid parameters. `;
    result.error += `exampleId must contain up to three numbers only. `;
    result.error += `exampleId: ${exampleId}`;
    result.status = 400;
    consoleLogger.error(result.error);
    return res.status(result.status).json(result);
  }
  next();
}

/**
 * Validates a URN to rfc2141 format
 * @param {*} req http request
 * @param {*} res http response
 * @param {*} next callback for calling next middleware method
 */
validation.validateURN = async (req, res, next) => {
  const urn = req.params.urn || null;
  if (!urn || !urn.match(/^urn:[a-z0-9][a-z0-9-]{1,31}:[a-z0-9()+,\-.:=@;$_!*'%\/?#]+$/)) {
    result.error = `Invalid parameters. `;
    result.error += `urn must be a valid URN. `;
    result.error += `urn: ${urn}`;
    result.status = 400;
    consoleLogger.error(result.error);
    return res.status(result.status).json(result);
  }
  next();
}

module.exports = validation;
