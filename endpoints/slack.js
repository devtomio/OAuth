const Strategy = require('@aoberoi/passport-slack/src/index');
const router = require('express').Router();
const passport = require('passport');

passport.use(new Strategy({
	clientID: process.env.SLACK_CLIENT_ID,
	clientSecret: process.env.SLACK_CLIENT_SECRET,
	callbackURL: 'https://oauth.tomio.codes/slack/callback',
	scope: ['identity.basic']
}, (_, __, ___, ____, profile, done) => process.nextTick(() => done(null, profile))));

router.get('/slack', (_, res) => res.redirect('https://slack.com'));

router.get('/slack/login', passport.authenticate('slack', {
	scope: ['identity.basic']
}));

router.get('/slack/callback', passport.authenticate('slack', { failureRedirect: '/' }), (_, res) => res.redirect('/slack/profile'));

router.get('/slack/profile', async (req, res) => {
	if (!req.isAuthenticated()) return res.status(401).json({ message: 'You need to login thru Slack.' });

	res.status(200).json(req.user);
});

router.get('/slack/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

module.exports = router;
