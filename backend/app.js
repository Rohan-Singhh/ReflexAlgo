const express = require('express');
const configureMiddleware = require('./config/middleware.config');
const configureRoutes = require('./config/routes.config');

const app = express();

// Configure Middleware
configureMiddleware(app);

// Configure Routes
configureRoutes(app);

module.exports = app;

