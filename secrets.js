import { config } from 'dotenv';
config();

export const vars = {
	rapidApiReelHost: String(
		process.env.RAPIDAPI_REEL_HOST
	),
	rapidApiProfileHost: String(
		process.env.RAPIDAPI_PROFILE_HOST
	),
	rapidApiKey: String(process.env.RAPIDAPI_KEY),
	jwtSecret: String(process.env.JWT_SECRET),
	mongoDbUrl: String(process.env.MONGODB_URL),
	mongoDbId: String(process.env.MONGODB_ID),
	mongoDbPass: String(process.env.MONGODB_PASS),
	rapidApiHost: String(process.env.RAPIDAPI_HOST),
	requestUrl: String(process.env.REQUEST_URL),
	extensionId: String(process.env.EXTENSION_ID),
	secretCode: String(process.env.SECRET_CODE),
	cloudName: String(process.env.CLOUD_NAME),
	apiKeyCloudinary: String(
		process.env.API_KEY_CLOUDINARY
	),
	apiSecretCloudinary: String(
		process.env.API_SECRET_CLOUDINARY
	),
	apiMailgun: String(process.env.API_MAILGUN),
	googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY,
	googleClientEmail: String(
		process.env.GOOGLE_CLIENT_EMAIL
	),
	port: String(process.env.PORT),
	authFile: String(process.env.AUTH_FILE),
	rapidApiKey1: String(process.env.RAPIDAPI_KEY1),
	rapidApiHost1: String(
		process.env.RAPIDAPI_HOST1
	),
	razorpayKey: String(process.env.RAZORPAY_KEY_ID),
	razorpaySecret: String(
		process.env.RAZORPAY_KEY_SECRET
	),
	adminMail: String(process.env.ADMIN_MAIL),
	powerfetcherId: String(
		process.env.POWERFETCHER_ID
	),
};
