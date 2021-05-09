const { Strategy } = require('passport-twitch-latest');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.TWITCH_CLIENT_ID,
	clientSecret: process.env.TWITCH_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/twitch/callback',
	scope: ['user_read']
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/twitch', (_, res) => res.redirect('https://twitch.tv'));

router.get('/twitch/login', passport.authenticate('twitch', { scope: ['user_read'] }));

router.get('/twitch/callback', passport.authenticate('twitch', { failureRedirect: '/' }), (_, res) => res.redirect('/twitch/profile'));

router.get('/twitch/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Twitch.' });

	res.status(200).json(req.user);
});

router.get('/twitch/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
