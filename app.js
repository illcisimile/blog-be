const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const path = require('path');

const usersRouter = require('./controllers/users');
const blogsRouter = require('./controllers/blogs');

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

logger.info('Connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) =>
    logger.error('Error connecting to MongoDB:', error.message)
  );

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

// routes
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);

app.get('*', (request, response) =>
  response.sendFile(path.join(__dirname, 'build', 'index.html'))
);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
