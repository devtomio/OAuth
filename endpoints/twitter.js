const { Strategy } = require('passport-twitter');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	consumerKey: process.env.TWITTER_CONSUMER_KEY,
	consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
	callbackURL: 'https://oauth.tomio.codes/twitter/callback'
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/twitter', (_, res) => res.redirect('https://twitter.com'));

router.get('/twitter/login', passport.authenticate('twitter'));

router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), (_, res) => res.redirect('/twitter/profile'));

router.get('/twitter/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Twitter.' });

	res.status(200).json(req.user);
});

router.get('/twitter/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
