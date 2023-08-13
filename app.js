const express = require('express');
require('express-async-errors');
const app = express();
// const cors = require('cors');

const usersRouter = require('./controllers/users');

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

logger.info('Connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to mongoDB'))
  .catch((error) =>
    logger.error('Error connecting to mongoDB:', error.message)
  );

// app.use(cors());
// static build
app.use(express.json());
app.use(middleware.requestLogger);

// routes
app.use('/api/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
