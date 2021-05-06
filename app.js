require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');

const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const notFoundRouter = require('./routes/notFound');

const { register, login } = require('./controlers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const rateLimiter = require('./middlewares/rateLimit');
const handleError = require('./middlewares/handleError');

const app = express();

const {
  PORT = 3000,
  MONGO_URL_ADRESS = 'mongodb://localhost:27017/bitfilmsdb',
} = process.env;

mongoose.connect(MONGO_URL_ADRESS, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: true,
});

app.use(bodyParser.json());

app.use(requestLogger);

app.use(helmet());
app.use(rateLimiter);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), register);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use('/', userRouter);

app.use('/', movieRouter);

app.use('/', notFoundRouter);

app.use(errorLogger);

app.use(errors());

app.use(handleError);

app.listen(PORT);
