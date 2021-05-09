const { discord, github, gitlab, twitch } = require('./endpoints');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const protect = require('@risingstack/protect');
const session = require('express-session');
const compression = require('compression');
const Store = require('connect-redis');
const { nanoid } = require('nanoid');
const passport = require('passport');
const home = require('./home.json');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
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

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.set('trust proxy', true);
app.set('json spaces', 8);

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.raw());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
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
	store: new RedisStore({ client })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(discord);
app.use(github);
app.use(gitlab);
app.use(twitch);

app.get('/', (_, res) => res.status(200).json(home));

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

app.get('/error', (req, res) => {
	const { message, code, error } = req.query;

	res.status(code).json({ message, error, code });
});

app.listen(3000, () => console.log('Server is online!'));
