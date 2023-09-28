const https = require('https');
const axios = require('axios');
const consoleLogger = require('../logger/logger.js').console;

const httpCtrl = {};

httpCtrl.setApiRequestOptions = (requestOptionsData) => {

  // HTTPS Reject Unauthorized
  let rejectUnauthorized;
  // To override the HTTPS_REJECT_UNAUTHORIZED environment variable set the requestOptionsData.rejectUnauthorized value
  if (requestOptionsData.hasOwnProperty('rejectUnauthorized')) {
    rejectUnauthorized = requestOptionsData.rejectUnauthorized === false ? false : true;
  // If requestOptionsData.rejectUnauthorized is not set use the environment variable value (defaults to true)
  } else {
    rejectUnauthorized = process.env.HTTPS_REJECT_UNAUTHORIZED === 'false' ? false : true;
  }

  const agent = new https.Agent({
    requestCert: true,
    // SSL certificate verification
    rejectUnauthorized: rejectUnauthorized
  });

  let options = {
    url: requestOptionsData.url || null,
    headers: requestOptionsData.headers || {},
    method: requestOptionsData.method || `GET`,
    httpsAgent: agent
  }

  if (requestOptionsData.jwt) {
    options.headers.Authorization = `Bearer ${requestOptionsData.jwt}`
  }

  if (requestOptionsData.params) {
    options.params = requestOptionsData.params;
  }

  if (requestOptionsData.data) {
    options.data = requestOptionsData.data;
  }

  if (requestOptionsData.responseType) {
    options.responseType = requestOptionsData.responseType;
  }

  return options;

}

httpCtrl.makeRequest = async (requestOptionsData) => {

  // Set request options
  const requestOptions = httpCtrl.setApiRequestOptions(requestOptionsData);

  consoleLogger.debug(`HTTP request url: ${requestOptionsData.url}`);

  let response = {};
  try {
    response = await axios(requestOptions);
  } catch (error) {
    let errorMsg = { message: `Axios HTTP error: `, error: ``};
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      consoleLogger.error(JSON.stringify(error.response.data));
      consoleLogger.error(error.response.status);
      consoleLogger.error(JSON.stringify(error.response.headers));
      errorMsg.error += error.response.data || '';
      errorMsg.message += `Status code out of 2xx range`;
      response.status = error.response.status || 500;
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      consoleLogger.error(error.request);
      errorMsg.message += `Request was made but no response was received `;
      response.status = 500;
    } else {
      // Something happened in setting up the request that triggered an Error
      consoleLogger.error(`HTTP request error: Invalid request`);
      errorMsg.message += `Invalid request `;
      response.status = error && error.response && error.response.status ? error.response.status : 400;
    }
    errorMsg.error += error && error.message ? error.message : '';
    response.error = errorMsg;
  }

  return response;

}

module.exports = httpCtrl;
