import mongoose from 'mongoose';
import { vars } from '../secrets.js';

const connectDB = async () => {
	console.log('Connecting to MongoDB');
	await mongoose
		.connect(vars.mongoDbUrl)
		.then((response) => {
			console.log('MongoDB Connected');
			return true;
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
};

export default connectDB;
