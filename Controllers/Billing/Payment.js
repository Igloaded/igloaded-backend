import razorpay from 'razorpay';
import crypto from 'crypto';
import { vars } from '../../secrets.js';
import { epochCurrent } from '../../Reusables/getTimestamp.js';
import { addTransaction } from './Transaction.js';

const razorpayInstance = new razorpay({
	key_id: vars.razorpayKey,
	key_secret: vars.razorpaySecret,
});

export const createPayment = async (req, res) => {
	const { paymentData } = req.body;
	const { finalAmount } = paymentData;
	const epoch = epochCurrent('ms');
	const options = {
		amount: finalAmount * 100,
		currency: 'INR',
		receipt: `receipt_${epoch}`,
	};
	razorpayInstance.orders.create(
		options,
		(err, order) => {
			if (err) {
				console.log('hii');
				console.log(err);
				return res.status(500).json(err);
			} else {
				console.log(order);
				return res.status(200).json(order);
			}
		}
	);
};

export const verifyPayment = async (req, res) => {
	const {
		razorpayPaymentId,
		razorpayOrderId,
		razorpaySignature,
		ordeDetails,
	} = req.body;
	const secret = vars.razorpaySecret;
	const signature = razorpaySignature;
	const generatedSignature = crypto
		.createHmac('sha256', secret)
		.update(
			`${razorpayOrderId}|${razorpayPaymentId}`
		)
		.digest('hex');
	if (generatedSignature === signature) {
		await addTransaction(ordeDetails)
			.then((resp) => {
				console.log(resp);
			})
			.catch((err) => {
				console.log(err);
			});
		return res.status(200).json({
			status: 'ok',
			message: 'Payment Verified Successfully',
		});
	} else {
		return res.status(400).json({
			status: 'error',
			message: 'Payment Verification Failed',
		});
	}
};
