const router = require('express').Router();

const { getSavedMovies, createMovies, deleteMovies } = require('../controlers/movies');

const auth = require('../middlewares/auth');

router.get('/movies', auth, getSavedMovies);
router.post('/movies', auth, createMovies);
router.delete('/movies/:movieId', auth, deleteMovies);

module.exports = router;