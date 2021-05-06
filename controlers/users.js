const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

const SALT_ROUNDS = 10;
const MONGO_DUPLICATE_ERROR_CODE = 11000;

const getProfileUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new BadRequestError('Некорректные данные'));
      }
      return next(err);
    });
};

const setProfileUser = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { runValidators: true, new: true }).orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new BadRequestError('Некорректные данные'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Некорректные данные'));
      }
      if (err.code === MONGO_DUPLICATE_ERROR_CODE && err.codeName === 'DuplicateKey') {
        return next(new ConflictError('Такой пользователь уже существует'));
      }
      return next(err);
    });
};

const register = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Не передан емейл или пароль');
  }

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({ email, password: hash, name }))
    .then((user) => {
      res.status(200).send({
        email: user.email,
        _id: user._id,
        name: user.name,
      });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new BadRequestError('Некорректные данные'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Некорректные данные'));
      }
      if (err.code === MONGO_DUPLICATE_ERROR_CODE) {
        return next(new ConflictError('Такой пользователь уже существует'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Некорректные данные'));
      }
      return next(err);
    });
};

module.exports = {
  getProfileUser, setProfileUser, register, login,
};
