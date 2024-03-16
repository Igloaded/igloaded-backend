import express from 'express';
import cors from 'cors';
import usersPath from './Routes/user.js';
import trackPath from './Routes/track.js';
import adminPath from './Routes/admin.js';
import connectDB from './Connections/db.js';
import { vars } from './secrets.js';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = MongoDBStore(session);
const port = vars.port;
connectDB();

const RequestUrl = [
	'http://172.28.112.1:5174',
	'https://www.igloaded.com',
];

app.set('trust proxy', 1);
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);
			if (RequestUrl.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				if (origin.includes('chrome-extension://')) {
					callback(null, true);
				} else {
					callback(new Error('Not allowed by CORS'));
				}
			}
		},
		methods: [
			'GET',
			'POST',
			'PUT',
			'DELETE',
			'OPTIONS',
			'PATCH',
		],
		credentials: true,
	})
);

// app.use((req, res, next) => {
// 	const origin = req.headers.origin;
// 	if (origin === undefined) {
// 		const key = req.get('IGL-API-Key');
// 		if (key !== vars.powerfetcherId) {
// 			res.status(403).json({
// 				status: 403,
// 				message: 'Invalid API Key',
// 				success: 'false',
// 			});
// 		} else {
// 			next();
// 		}
// 	} else {
// 		next();
// 	}
// });

app.use(
	session({
		store: new store({
			uri: vars.mongoDbUrl,
			collection: 'sessionData',
		}),
		secret: vars.secretCode,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);

app.get('/', (req, res) => {
	res.send('Server is Up and running...');
});

app.use('/user', usersPath);
app.use('/track', trackPath);
app.use('/admin', adminPath);

app.listen(port || 5696, () => {
	console.log(`Server started on port ${port}`);
});

// export const handler = ServerlessHttp(app);
