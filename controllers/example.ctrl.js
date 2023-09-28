const consoleLogger = require('../logger/logger.js').console;
const httpCtrl = require('./http.ctrl');
const exampleCtrl = {};

// Call the getExampleApi wrapper function and handle the response
exampleCtrl.exampleMethod = async (req, res) => {
  
  const exampleId = req.params.exampleId;
  let result = {};
  let response;
  try {
    response = await exampleCtrl.getExampleApi(exampleId);
  } catch (e) {
    consoleLogger.error(`Error in getExampleApi`);
    consoleLogger.error(e);
  }

  if (!response || !response.status || response.status >= 500 || !response.data) {
    result.error = `Unable to get response from external api url`;
    consoleLogger.error(result.error);
    return res.status(500).json(result);
  }

  result.status = response.status;
  result.data = response.data;

  return res.status(result.status).json(result);

}

// Create a wrapper around the HTTP request options and send a request with the HTTP controller
exampleCtrl.getExampleApi = async (exampleId) => {

  const url = process.env.API_URL_EXTERNAL_EXAMPLE ? `${process.env.API_URL_EXTERNAL_EXAMPLE}/${exampleId}` : `https://jsonplaceholder.typicode.com/todos/${exampleId}`;
  
  // Set request values that are specific to this route
  const requestOptionsData = {
    method: 'GET',
    // Send HTTP get request to an example API url
    url: url
    // add other axios options such as data, headers, jwt token, and more
  };

  return httpCtrl.makeRequest(requestOptionsData);

}

module.exports = exampleCtrl;
