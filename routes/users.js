const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { getProfileUser, setProfileUser } = require('../controlers/users');
const auth = require('../middlewares/auth');

router.get('/users/me', auth, getProfileUser);
router.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().min(2).max(30),
  }),
}), setProfileUser);

module.exports = router;
