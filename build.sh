#!/bin/sh
PACKAGE_NAME=`npm pkg get name | tr -d '"' | tr '[:upper:]' '[:lower:]'`
# Set package version auto prefixed with 'v'
PACKAGE_VERSION=v`npm pkg get version | tr -d '"'`
REGISTRY_BASE='registry.lts.harvard.edu/lts/'

if [ -n "$1" ]; then
  if [ $1 == '--help' ]; then 
     echo "USAGE: build [-p]"
     echo "Build the docker node container based on npm name and vesion"
     echo "-p option pushes to server after build"
  fi 
fi

# Build and push images to Docker registry
# sh build.sh -p
docker build --no-cache . --pull -t ${REGISTRY_BASE}${PACKAGE_NAME}:${PACKAGE_VERSION}
if [ -n "$1" ]; then
  if [ $1 == '-p' ]; then 
     docker push ${REGISTRY_BASE}${PACKAGE_NAME}:${PACKAGE_VERSION}
  fi 
fi
