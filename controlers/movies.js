const Movies = require('../models/movie');

const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

// Сохраненные фильмы
const getSavedMovies = (req, res, next) => {
  const owner = req.user._id;

  Movies.find({ owner })
    .then((movie) => res.status(200).send(movie))
    .catch(next);
};

// Создать фильм
const createMovies = (req, res, next) => {
  Movies.create({ ...req.body, owner: req.user._id })
    .then((movie) => res.status(200).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные'));
      }
      next(err);
    });
};

// Удалить фильм
const deleteMovies = (req, res, next) => {
  const owner = req.user._id;

  Movies.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      }
      if (movie.owner.toString() !== owner) {
        throw new ForbiddenError('Не ваш фильм');
      }
      Movies.findByIdAndRemove(req.params.movieId)
        .then(() => res.status(200).send({ message: 'Удалили' }));
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        next(new BadRequestError('Некорректные данные'));
      }
      next(err);
    });
};

module.exports = { getSavedMovies, createMovies, deleteMovies };
