const { Strategy } = require('passport-spotify');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/spotify/callback',
	scope: ['user-read-email', 'user-read-private']
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/spotify', (_, res) => res.redirect('https://spotify.com'));

router.get('/spotify/login', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'] }));

router.get('/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/' }), (_, res) => res.redirect('/spotify/profile'));

router.get('/spotify/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Spotify.' });

	res.status(200).json(req.user);
});

router.get('/spotify/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
