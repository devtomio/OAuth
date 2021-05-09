const { Strategy } = require('passport-discord');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.DISCORD_CLIENT_ID,
	clientSecret: process.env.DISCORD_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/discord/callback',
	scope: ['identify']
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/discord', (_, res) => res.redirect('https://discord.com'));

router.get('/discord/login', passport.authenticate('discord', { scope: ['identify'] }));

router.get('/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), (_, res) => res.redirect('/discord/profile'));

router.get('/discord/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Discord.' });

	res.status(200).json(req.user);
});

router.get('/discord/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
