# node-ci-template

A NodeJS example project with tests and CI integration.

# Preparing to use Project

All commands should be run inside the application container, not on the host machine. There should be no external software required, since all required software is installed in the docker image. Read the local docker setup instructions for more information.

## Rename Application

In the package.json file, there is an application name and version.  Set the application name and initial version.

## Application Version

Please use the npm package manager to update the version number for the application. The npm version ${patch|minor|major} command will generate the tag and update the project json file package.json Update the version each time a new version of the application is ready to deploy to the docker servers. 

**Please also make sure that package.json is always up to date with the version number.**

Read more information about setting the application version in the LTS standard processes wiki page [Git Processes Node JS](https://wiki.harvard.edu/confluence/display/LibraryTechServices/Git+Processes#GitProcesses-NodeJS).

## Update application account

### Change Dockerfile to application account

Update the Dockerfile to the application-specific account on the docker server. This is the account that has permissions to write to the application directories on the docker server. Update both the ID number `APP_ID_NUMBER` and the account name `APP_ID_NAME`.

```
ENV APP_ID_NUMBER=199
ENV APP_ID_NAME=exampleadm
```

### Change docker-compose-local.yml to application account

Please also set the app id name in the `docker-compose-local.yml` volumes section. Replace `exampleadm` with the name of the account that matches the change made in the Dockerfile above.

```
    volumes:
      - './:/home/exampleadm'
      - '/home/exampleadm/node_modules'
```

## Update Packages

Please update the packages to include the latest security updates.

Read the LTS wiki page for more information: [LTS On-Call Security Updates](https://wiki.harvard.edu/confluence/display/LibraryTechServices/On-Call+Security+Updates)

Install and run ncu to update the packages in this application.

```
npm install -g ncu
ncu -u
```

Optionally run the build-in npm audit fix command as well.

```
npm audit fix
```

## Setup HTTPS (optional)

A SSL/TLS certificate is recommended for containers that require a high level of security. The examples in the `examples/https` directory contain the code for setting up SSL/TLS in the contanier. The dockerfile `examples/https/DockerfileTLS` generates a self-signed certificate and the www binary `bin/wwwTLS` sets up the web server with HTTPS.

If this component requires SSL/TLS, copy the example files in the `https` directory to the corresponding paths in the project. Copy the contents of `examples/https/DockerfileTLS` to `Dockerfile` and copy the contents of `examples/https/wwwTLS` to `bin/www`.

# Healthcheck

This template has an executable healthcheck script. This template does not contain the curl package due to security vulnerabilities.

In the docker swarm compose healthcheck test command, add the path to the healthcheck executable <URL> or set an environment variable HEALTHCHECK_URL and put healthcheck in the healthcheck command line.
 
Add path to the healthcheck executable in the docker compose healthcheck:

```
    healthcheck:
      test: /home/${APP_ID_NAME}/healthcheck/healthcheck https://localhost:${INTERNAL_CONTAINER_PORT}/healthcheck
      interval: 1m
      timeout: 10s
      retries: 4
```

# Standard Template Code
### HTTP Controller
The HTTP Controller is a standard wrapper to make HTTP requests with the axios module. This is the recommended way to make API calls since it already has all of the parameter parsing and error handling builtin and allows reusing the standard calls without having to rewrite the error conditions every time.

HTTP Controller:
`./controllers/http.ctrl.js`

To make an HTTP request with the HTTP Controller, create an object with the request options, and call the makeRequest method.

```

// Create a wrapper around the HTTP request options 
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

// Create a wrapper around the HTTP request options and send a request with the HTTP controller
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

  return res.status(200).json(response.data);

}
```

# Tests

## Automated tests

The automated tests are organized by test type.
* **Unit tests** are tests that are isolated to the component that the tests are running in and do not require any external dependencies
* **Integration tests** are tests that require external components such as APIs or databases

The package.json file has commands for running unit tests and integration tests individually.

```
  "test:unit": "./node_modules/.bin/jest --testPathPattern=__tests__/unit",
  "test:integration": "./node_modules/.bin/jest --testPathPattern=__tests__/integration"
```

### Unit tests

Unit tests test the individual component without any external dependencies on other components.

Run unit tests

Open a shell inside the container

```
docker exec -it node-ci-template bash
```

Run the unit tests with the `npm run test:unit` command

```
npm run test:unit
```

#### Creating unit tests

Unit tests can be created to call the API routes of the component internally with jest and supertest.

Review the node template [example unit tests](https://github.huit.harvard.edu/LTS/node-ci-template/blob/main/__tests__/unit/api.test.js).

### Integration tests

Integration tests require additional components to be running with preset data in place to return the expected test results. Build and run these components locally or update the configuration to connect to the server urls.

Setup the additional components on the same docker network to run integration tests.

Open a shell inside the container

```
docker exec -it node-ci-templates bash
```

Run the integration tests with the `npm run test:integration` command

```
npm run test:integration
```

### All tests

The package.json file has commands for running all tests.

```
  "test": "./node_modules/.bin/jest",
  "test:watch": "./node_modules/.bin/jest --watchAll",
```

To run all tests run the npm test command.

```
npm test
```

To run all tests in watchAll mode run the npm test command.

```
npm run test:watch
```

# Build docker image for deployment
To build a docker image for deploying to the server, run the build script. This is not intended for local development, see the local development instructions for building local images.

Add the option -p to push the image to the docker registry.

```
sh build.sh -p
```

# Local development environment

### 1: Clone the repository to a local directory

```
git clone git@github.huit.harvard.edu:LTS/node-ci-template.git
```

### 2: Create a file for environment variables

Make a copy of the `env-example.txt` file and rename it to `.env` in the root directory of the project.

Replace placeholder usernames and passwords

*Note: The config file .env is specifically excluded in .gitignore and .dockerignore, since may contain credentials it should NOT ever be committed to any repository.*

### 3: Start the app

##### START

This command builds all images and runs all containers specified in the docker-compose-local.yml configuration.

```
docker-compose -f docker-compose-local.yml up --build --force-recreate
```

### 4. Open browser

The API is accessible at port 23033.

- **API** - https://localhost:23033/healthcheck

Example local requests:

```
https://localhost:23033/healthcheck
```

```
https://localhost:23033/example/${exampleId}
```

### 5: Run unit tests

Open a shell inside the container

```
docker exec -it node-ci-template sh
```

Run the unit tests with the npm test command

```
npm test
```

### 6. Stop the app
##### STOP AND REMOVE

This command stops and removes all containers specified in the docker-compose-local.yml configuration. This command can be used in place of the 'stop' and 'rm' commands.

```
docker-compose -f docker-compose-local.yml down
```
