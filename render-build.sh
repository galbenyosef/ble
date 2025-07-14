#!/bin/bash
set -e

# Install server dependencies
cd server
npm install
cd ..

# Install and build the web app
cd web
npm install
npm run build
cd ..

# Copy the web build output to the server directory
rm -rf server/build
cp -r web/build server/build