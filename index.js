const { discord, github, gitlab, twitch, google, tixte, twitter } = require('./endpoints');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const { getReasonPhrase } = require('http-status-codes');
const statusEmojis = require('http-status-emojis');
const protect = require('@risingstack/protect');
const secure = require('express-secure-only');
const session = require('express-session');
const compression = require('compression');
const initStats = require('@phil-r/stats');
const volleyball = require('volleyball');
const Store = require('connect-redis');
const { nanoid } = require('nanoid');
const passport = require('passport');
const home = require('./home.json');
const express = require('express');
const helmet = require('helmet');
const redis = require('redis');
const cors = require('cors');

const app = express();
const client = redis.createClient(process.env.REDIS_URL);
const RedisStore = Store(session);
const rateLimiter = new RateLimiterRedis({
	storeClient: client,
	keyPrefix: 'middleware',
	points: 10,
	duration: 1
});
const { statsMiddleware, getStats } = initStats({
	endpointStats: true,
	addHeader: true
});

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.set('trust proxy', true);
app.set('json spaces', 8);

app.use(secure());
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.raw());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(volleyball);
app.use(compression());
app.use(protect.express.sqlInjection({ body: true }));
app.use(protect.express.xss({ body: true }));
app.use((req, res, next) => {
	rateLimiter.consume(req.ip)
		.then(() => next())
		.catch(() => res.status(429).send('Ratelimited'));
});
app.use(session({
	secret: nanoid(30),
	resave: false, 
	saveUninitialized: false, 
	cookie: { 
		secure: true
	},
	store: new RedisStore({ client }),
	name: nanoid(10)
}));
app.use(statsMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(discord);
app.use(twitter);
app.use(github);
app.use(gitlab);
app.use(twitch);
app.use(google);
app.use(tixte);

app.get('/', (_, res) => res.status(200).json(home));

app.get('/stats', (_, res) => res.status(200).json(getStats()));

app.get('/status/:code', (req, res) => {
	const { code } = req.params;

	try {
		const text = getReasonPhrase(code);
		res.status(code).json({ code, message: text });
	} catch {
		res.status(400).json({ message: 'Cannot find status code.' });
	}
});

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.get('/error', (req, res) => {
	const { message, code, error } = req.query;

	res.status(code).json({ message, error, code });
});

app.listen(3000, () => console.log('Server is online!'));
