import mongoose from 'mongoose';

const adminConfig = new mongoose.Schema(
	{
		email: {
			type: String,
			default: 'admin@igloaded.com',
			required: true,
		},
		serverDetails: {
			type: Object,
			default: {
				type: Object,
				isServerUp: true,
			},
		},
		planDetails: {
			type: Array,
			default: [
				{
					id: 1,
					planName: 'Free',
					planType: 'Monthly',
					planPrice: 0,
					planTax: 0,
					gatewayCharges: 2,
					planValidity: 30,
				},
				{
					id: 2,
					planName: 'Individual',
					planType: 'Monthly',
					planPrice: 3999,
					planTax: 0,
					gatewayCharges: 2,
					planValidity: 30,
				},
				{
					id: 3,
					planName: 'Professional',
					planType: 'Monthly',
					planPrice: 5999,
					planTax: 0,
					gatewayCharges: 2,
					planValidity: 30,
				},
			],
		},
		creditsDetails: {
			type: Array,
			default: [
				{
					id: 1,
					credits: 100,
					price: 100,
					tax: 0,
					gatewayCharges: 2,
				},
				{
					id: 2,
					credits: 500,
					price: 500,
					tax: 0,
					gatewayCharges: 2,
				},
				{
					id: 3,
					credits: 1000,
					price: 999,
					tax: 0,
					gatewayCharges: 2,
				},
				{
					id: 4,
					credits: 3000,
					price: 2499,
					tax: 0,
					gatewayCharges: 2,
				},
				{
					id: 5,
					credits: 5000,
					price: 4249,
					tax: 0,
					gatewayCharges: 2,
				},
				{
					id: 6,
					credits: 10000,
					price: 8999,
					tax: 0,
					gatewayCharges: 2,
				},
			],
		},
	},
	{
		timestamps: true,
	}
);

const adminCollection = mongoose.model(
	'adminConfig',
	adminConfig
);

export default adminCollection;
