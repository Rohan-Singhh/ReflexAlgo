const express = require('express');
const { configureMiddleware, configureRoutes } = require('./config');

const app = express();

// Configure Middleware
configureMiddleware(app);

// Configure Routes
configureRoutes(app);

module.exports = app;

