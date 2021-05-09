const { Strategy } = require('passport-github2');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.GITHUB_CLIENT_ID,
	clientSecret: process.env.GITHUB_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/github/callback',
	scope: ['user:email']
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/github', (_, res) => res.redirect('https://github.com'));

router.get('/github/login', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (_, res) => res.redirect('/github/profile'));

router.get('/github/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru GitHub.' });

	res.status(200).json(req.user);
});

router.get('/github/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
