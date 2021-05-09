const { Strategy } = require('passport-facebook');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.FACEBOOK_CLIENT_ID,
	clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/facebook/callback'
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/facebook', (_, res) => res.redirect('https://facebook.com'));

router.get('/facebook/login', passport.authenticate('facebook'));

router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (_, res) => res.redirect('/facebook/profile'));

router.get('/facebook/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Facebook.' });

	res.status(200).json(req.user);
});

router.get('/facebook/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
