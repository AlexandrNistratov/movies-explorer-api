const Movies = require('../models/movie');

const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const ConflictError = require('../errors/conflict-err');

const MONGO_DUPLICATE_ERROR_CODE = 11000;
// Сохраненные фильмы
const getSavedMovies = (req, res, next) => {
  const owner = req.user._id;

  Movies.find({ owner }).select('-owner')
    .then((movie) => res.status(200).send(movie))
    .catch(next);
};

// Создать фильм
const createMovies = (req, res, next) => {
  Movies.create({ ...req.body, owner: req.user._id })
    .then((movie) => res.status(200).send({
      _id: movie._id,
      country: movie.country,
      director: movie.director,
      duration: movie.duration,
      year: movie.year,
      description: movie.description,
      image: movie.image,
      trailer: movie.trailer,
      thumbnail: movie.thumbnail,
      movieId: movie.movieId,
      nameRU: movie.nameRU,
      nameEN: movie.nameEN,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Некорректные данные'));
      }
      if (err.code === MONGO_DUPLICATE_ERROR_CODE && err.name === 'MongoError') {
        return next(new ConflictError('Такой фильм уже существует'));
      }
      return next(err);
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
        return next(new BadRequestError('Некорректные данные'));
      }
      return next(err);
    });
};

module.exports = { getSavedMovies, createMovies, deleteMovies };
