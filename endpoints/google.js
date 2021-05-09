const { Strategy } = require('passport-google-oauth20');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/google/callback',
	scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/google', (_, res) => res.redirect('https://google.com'));

router.get('/google/login', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (_, res) => res.redirect('/google/profile'));

router.get('/google/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Google.' });

	res.status(200).json(req.user);
});

router.get('/google/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
