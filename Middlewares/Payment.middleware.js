import adminCollection from '../Models/adminConfig.js';
import User from '../Models/userModel.js';
import { checkPromoCodeLocal } from '../Controllers/Users/user.js';
import { vars } from '../secrets.js';

const getGatewayCharges = (
	amount,
	percentage
) => {
	const MultiplyingFactor = percentage / 100;
	const charges = Math.ceil(
		amount * MultiplyingFactor
	);
	return charges;
};

const getTaxCharges = (amount, percentage) => {
	const MultiplyingFactor = percentage / 100;
	const tax = Math.ceil(
		amount * MultiplyingFactor
	);
	return tax;
};

const getFinalAmount = (
	amount,
	tax,
	gatewayCharges,
	discount
) => {
	const finalAmount =
		amount + tax + gatewayCharges - discount;
	return finalAmount.toFixed(0);
};

export const handlePaymentValidation = async (
	req,
	res,
	next
) => {
	const userId = req.userId;
	const { email, paymentData, promocodeData } =
		req.body;
	const {
		purchaseId,
		creditsAmount,
		price,
		tax,
		gatewayCharges,
		finalAmount,
		discount,
		purchaseType,
	} = paymentData;

	const { isPromocodeApplied, promocode } =
		promocodeData;

	let PromocodeDiscount = 0;
	if (isPromocodeApplied) {
		try {
			const promocodeParams = {
				email,
				promocode,
				amount: price,
			};
			const promocodeDetails =
				await checkPromoCodeLocal(promocodeParams);
			console.log(
				'promocodeDetails : ',
				promocodeDetails
			);
			console.log(
				discount,
				promocodeDetails.discountamount
			);
			if (promocodeDetails.status == 'ok') {
				const { discountamount } = promocodeDetails;
				if (discountamount != discount) {
					console.log(
						'Promocode discount amount mismatch'
					);
				} else {
					PromocodeDiscount = discountamount;
				}
			}
		} catch (error) {
			console.log('Promocode error', error);
			return res.status(400).json({
				status: 'error',
				message:
					error?.message || 'Invalid promocode!',
			});
		}
	}

	if (purchaseType === 'credits') {
		const creditData =
			await adminCollection.findOne({
				email: vars.adminMail,
			});
		const { creditsDetails } = creditData;
		const creditDetails = creditsDetails.find(
			(credit) => credit.id === purchaseId
		);
		console.log('creditDetails : ', creditDetails);
		if (!creditDetails) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid credits id',
			});
		} else if (
			creditDetails.credits != creditsAmount ||
			getTaxCharges(
				creditDetails.price,
				creditDetails.tax
			) != tax ||
			getGatewayCharges(
				creditDetails.price,
				creditDetails.gatewayCharges
			) != gatewayCharges ||
			getFinalAmount(
				creditDetails.price,
				getTaxCharges(
					creditDetails.price,
					creditDetails.tax
				),
				getGatewayCharges(
					creditDetails.price,
					creditDetails.gatewayCharges
				),
				PromocodeDiscount
			) != finalAmount
		) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid charges for credits',
				serverData: creditDetails,
				clientData: paymentData,
			});
		}
	} else if (purchaseType === 'plan') {
		const planData = await adminCollection.findOne({
			email: vars.adminMail,
		});
		const { planDetails } = planData;
		const plansDetails = planDetails.find(
			(plan) => plan.id === purchaseId
		);
		if (!plansDetails) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid plan id',
			});
		} else if (
			price != plansDetails.planPrice ||
			tax !=
				getTaxCharges(
					plansDetails.planPrice,
					plansDetails.planTax
				) ||
			gatewayCharges !=
				getGatewayCharges(
					plansDetails.planPrice,
					plansDetails.gatewayCharges
				) ||
			getFinalAmount(
				plansDetails.planPrice,
				getTaxCharges(
					plansDetails.planPrice,
					plansDetails.planTax
				),
				getGatewayCharges(
					plansDetails.planPrice,
					plansDetails.gatewayCharges
				),
				PromocodeDiscount
			) != finalAmount
		) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid charges for plan',
				serverData: plansDetails,
				clientData: paymentData,
			});
		}
	}
	console.log('Payment validation success');
	next();
};
