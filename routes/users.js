const router = require('express').Router();

const { getProfileUser, setProfileUser } = require('../controlers/users');
const auth = require('../middlewares/auth');

router.get('/users/me', auth, getProfileUser);
router.patch('/users/me', auth, setProfileUser);


module.exports = router;