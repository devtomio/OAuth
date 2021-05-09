const { Strategy } = require('passport-gitlab2');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.GITLAB_APPLICATION_ID,
	clientSecret: process.env.GITLAB_APPLICATION_SECRET,
	callbackURL: 'https://oauth.tomio.codes/gitlab/callback',
	scope: ['read_user']
}, (_, __, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/gitlab', (_, res) => res.redirect('https://gitlab.com'));

router.get('/gitlab/login', passport.authenticate('gitlab', { scope: ['read_user'] }));

router.get('/gitlab/callback', passport.authenticate('gitlab', { failureRedirect: '/' }), (_, res) => res.redirect('/gitlab/profile'));

router.get('/gitlab/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru GitLab.' });

	res.status(200).json(req.user);
});

router.get('/gitlab/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
