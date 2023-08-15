const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.status(200).json(users);
});

usersRouter.post('/signup', async (request, response) => {
  const { username, name, password, confirmPassword } = request.body;

  let nameError,
    usernameError,
    passwordError,
    confirmPasswordError = null;

  if (!name) {
    nameError = { name: 'name is required' };
  }

  if (!username) {
    usernameError = { username: 'username is required' };
  }

  if (password.length < 3) {
    passwordError = {
      password: 'password must be at least 3 characters',
    };
  }

  if (!password) {
    passwordError = { password: 'password is required' };
  }

  if (password !== confirmPassword) {
    confirmPasswordError = { confirmPassword: 'passwords do not match' };
  }

  if (!name || !username || !password || !confirmPassword) {
    return response.status(400).json({
      error: {
        ...nameError,
        ...usernameError,
        ...passwordError,
        ...confirmPasswordError,
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.post('/signin', async (request, response) => {
  const { username, password } = request.body;

  let usernameError,
    passwordError = null;

  if (!username) {
    usernameError = { username: 'username is required' };
  }

  if (!password) {
    passwordError = { password: 'password is required' };
  }

  if (!username || !password) {
    return response.status(400).json({
      error: {
        ...usernameError,
        ...passwordError,
      },
    });
  }

  const user = await User.findOne({ username });

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid username or password' });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, process.env.TOKEN);

  response
    .status(200)
    .json({ token, username: user.username, name: user.name });
});

module.exports = usersRouter;
