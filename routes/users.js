const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getProfileUser, setProfileUser } = require('../controlers/users');
const auth = require('../middlewares/auth');

router.get('/users/me', auth, getProfileUser);
router.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), setProfileUser);

module.exports = router;
