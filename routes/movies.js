const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getSavedMovies, createMovies, deleteMovies } = require('../controlers/movies');

const auth = require('../middlewares/auth');

router.get('/movies', auth, getSavedMovies);
router.post('/movies', auth, celebrate({
  body: Joi.object().keys({
    country: Joi.string().min(2).max(30),
    director: Joi.string().min(2).max(30),
    duration: Joi.number().required().min(2),
    year: Joi.string().min(2).max(30),
    description: Joi.string().min(2).max(30),
    image: Joi.string().required().pattern(/^https?:\/\/(www\.)?([a-zA-Z0-9-])+\.([a-zA-Z])+\/?([a-zA-Z0-9\-_~:/#[\]@!&â€™,;=]+)/),
    trailer: Joi.string().required().pattern(/^https?:\/\/(www\.)?([a-zA-Z0-9-])+\.([a-zA-Z])+\/?([a-zA-Z0-9\-_~:/#[\]@!&â€™,;=]+)/),
    nameRU: Joi.string().min(2).max(30),
    nameEN: Joi.string().min(2).max(30),
    thumbnail: Joi.string().required().pattern(/^https?:\/\/(www\.)?([a-zA-Z0-9-])+\.([a-zA-Z])+\/?([a-zA-Z0-9\-_~:/#[\]@!&â€™,;=]+)/),
    movieId: Joi.number().required().label('id'),
    owner: Joi.string().min(2).max(30),
  }),
}), createMovies);

router.delete('/movies/:movieId', auth, celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), deleteMovies);

module.exports = router;
