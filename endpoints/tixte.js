const { Strategy } = require('tixte-passport');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.TIXTE_CLIENT_ID,
	clientSecret: process.env.TIXTE_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/tixte/callback',
	scope: ['identify']
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/tixte', (_, res) => res.redirect('https://tixte.com'));

router.get('/tixte/login', passport.authenticate('tixte', { scope: ['identify'] }));

router.get('/tixte/callback', passport.authenticate('tixte', { failureRedirect: '/' }), (_, res) => res.redirect('/tixte/profile'));

router.get('/tixte/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Tixte.' });

	res.status(200).json(req.user);
});

router.get('/tixte/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
