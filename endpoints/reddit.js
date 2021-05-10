const { Strategy } = require('passport-reddit');
const router = require('express').Router();
const { nanoid } = require('nanoid');
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.REDDIT_CLIENT_ID,
	clientSecret: process.env.REDDIT_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/reddit/callback',
	scope: ['identity'],
	authorizationURL: 'https://www.reddit.com/api/v1/authorize',
	tokenURL: 'https://www.reddit.com/api/v1/access_token',
	state: nanoid()
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/reddit', (_, res) => res.redirect('https://reddit.com'));

router.get('/reddit/login', passport.authenticate('reddit', { scope: ['identity'] }));

router.get('/reddit/callback', passport.authenticate('reddit', { failureRedirect: '/' }), (_, res) => res.redirect('/reddit/profile'));

router.get('/reddit/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Reddit.' });

	res.status(200).json(req.user);
});

router.get('/reddit/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
