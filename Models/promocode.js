import mongoose from 'mongoose';

const promocodeSchema = new mongoose.Schema(
	{
		code: { type: String, required: true },
		discount: { type: Number, required: true },
		timestamp: { type: Number, required: true },
		expiry: { type: Number, required: true },
		for: { type: String, required: true },
		isUsed: { type: Boolean, required: true },
		maxUses: { type: Number, required: true },
		useCount: { type: Number, required: true },
	},
	{
		timestamps: true,
	}
);

const promocodes = mongoose.model(
	'promocodes',
	promocodeSchema
);

export default promocodes;
