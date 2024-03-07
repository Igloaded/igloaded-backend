import User from '../../Models/userModel.js';
import Transaction from '../../Models/TransactionModel.js';
import {
	epochCurrent,
	epochToDateLocale,
} from '../../Reusables/getTimestamp.js';
import { createInvoice } from '../Billing/createInvoice.js';
import { setPlan } from '../Users/userUtils.js';
import { billingInvoice } from '../SendEmail/sendEmail.js';

const sendInvoice = async (data) => {
	const {
		email,
		timestamp,
		amount,
		tax,
		discount,
		gatewayCharges,
		finalAmount,
		orderId,
		title,
		description,
	} = data;

	return new Promise(async (resolve, reject) => {
		const user = await User.findOne({
			email,
		});
		if (!user) {
			reject({
				status: 'error',
				message: 'Invalid Email',
			});
		}
		const billData = {
			date: epochToDateLocale(timestamp, 'ms'),
			orderId: orderId,
			ogamount: `₹${amount}`,
			tax: `₹${tax}`,
			discount: `₹${discount}`,
			gatewayCharges: `₹${gatewayCharges}`,
			total: `₹${finalAmount}`,
			customerEmail: email,
			customerName: user.name,
			quantity: 1,
			title: title,
			description: description,
		};

		await createInvoice(billData)
			.then(async (resp) => {
				try {
					if (resp.status == 200) {
						const billDataObject = {
							billBuffer: resp.bufferData,
							total: `₹${finalAmount}`,
							date: epochToDateLocale(timestamp, 'ms'),
							purchaseDescription: description,
							purchaseTitle: title,
							customerName: user.name,
							customerEmail: email,
						};
						await billingInvoice(billDataObject)
							.then((resp) => {
								if (resp.status == 200) {
									resolve({
										status: 'ok',
										message: 'Invoice sent successfully',
									});
								}
							})
							.catch((err) => {
								console.log(err);
							});
					}
				} catch (error) {
					console.log(error);
					reject({
						status: 'error',
						message:
							'Something went wrong in sending invoice',
					});
				}
			})
			.catch((err) => {
				console.log(err);
				reject({
					status: 'error',
					message:
						'Something went wrong in sending invoice',
				});
			});
	});
};

const addToTransaction = async (data) => {
	const {
		timestamp,
		email,
		amount,
		title,
		description,
		transactionType,
		orderId,
	} = data;

	return new Promise(async (resolve, reject) => {
		const user = await User.findOne({ email });
		if (!user) {
			reject({
				status: 'error',
				message: 'Invalid Email',
			});
		}

		const TransactionObject = {
			userId: user._id,
			email: email,
			id: orderId,
			date: timestamp,
			title: title,
			description: description,
			amount: amount,
			type: transactionType,
			status: 'success',
		};

		const result = await Transaction.create(
			TransactionObject
		);

		if (result) {
			resolve({
				status: 'ok',
				message: 'Transaction added successfully',
				transaction: TransactionObject,
			});
		}
		reject({
			status: 'error',
			message:
				'Something went wrong in adding transaction',
		});
	});
};

const handleCreditTransaction = async (data) => {
	const {
		credits,
		totalAmount,
		email,
		timestamp,
		orderId,
	} = data;

	return new Promise(async (resolve, reject) => {
		const user = await User.findOne({ email });
		if (!user) {
			reject({
				status: 'error',
				message: 'Invalid Email',
			});
		}

		user.credits = user.credits + credits;
		user.activity.transactions =
			user.activity.transactions + 1;
		user.markModified('activity');

		const addToTransactionData = {
			timestamp: timestamp,
			email,
			amount: credits,
			title: `${credits} Credits Added`,
			description: `Added ${credits} credits to your account`,
			transactionType: 'credit',
			orderId: orderId,
		};

		await addToTransaction(addToTransactionData)
			.then(async (resp) => {
				if (resp.status == 'ok') {
					await user.save();
					console.log(
						'User credits updated successfully'
					);
					resolve({
						status: 'ok',
						message:
							'User credits updated successfully',
					});
				}
			})
			.catch((err) => {
				console.log(err);
				reject({
					status: 'error',
					message:
						'Something went wrong in updating user credits',
				});
			});
	});
};

const handleDebitTransaction = async (data) => {
	const {
		credits,
		email,
		timestamp,
		orderId,
		title,
		description,
	} = data;

	return new Promise(async (resolve, reject) => {
		const user = await User.findOne({
			email,
		});

		if (!user) {
			reject({
				status: 'error',
				message: 'Invalid Email',
			});
		}

		if (user.credits < credits) {
			reject({
				status: 'error',
				message: 'Insufficient credits',
			});
		}

		user.credits = user.credits - credits;
		user.activity.transactions =
			user.activity.transactions + 1;

		user.markModified('activity');
		await user.save();

		const addToTransactionData = {
			timestamp: timestamp,
			email,
			amount: credits,
			title: title,
			description: description,
			transactionType: 'debit',
			orderId: orderId,
		};

		await addToTransaction(addToTransactionData)
			.then(async (resp) => {
				if (resp.status == 'ok') {
					console.log(
						'User credits updated successfully'
					);
					resolve({
						status: 'ok',
						message:
							'User credits updated successfully',
					});
				}
			})
			.catch((err) => {
				console.log(err);
				reject({
					status: 'error',
					message:
						'Something went wrong in updating user credits',
				});
			});
	});
};

const handlePlanPurchaseTransaction = async (
	data
) => {
	const { plan, email, timestamp, orderId } = data;

	return new Promise(async (resolve, reject) => {
		const user = await User.findOne({ email });
		if (!user) {
			reject({
				status: 'error',
				message: 'Invalid Email',
			});
		}
		const planDetails = {
			planPrice: plan.planPrice,
			isExtensionEnabled: plan.isExtensionEnabled,
			planName: plan.planName,
			extensionUsernames: plan.extensionUsernames,
			planPurchaseDate: timestamp,
		};
		let planResp;
		try {
			planResp = await setPlan(email, planDetails);
		} catch (error) {
			console.log(error);
		}

		const addToTransactionData = {
			timestamp: timestamp,
			email: email,
			amount: plan.planPrice,
			orderId: orderId,
			title: `${plan.planName} Plan Activated`,
			description: `Purchased ${plan.planName} plan`,
			transactionType: 'planpurchase',
		};

		await addToTransaction(addToTransactionData)
			.then(async (resp) => {
				if (resp.status == 'ok' && planResp.success) {
					console.log(
						'User plan updated successfully'
					);
					resolve({
						status: 'ok',
						message: 'User plan updated successfully',
					});
				}
			})
			.catch((err) => {
				console.log(err);
				reject({
					status: 'error',
					message:
						'Something went wrong in updating user plan',
				});
			});
	});
};

export const addTransaction = async (
	dataObject
) => {
	const data = dataObject;
	console.log(data);
	const {
		notifyUser,
		email,
		transactionType,
		transactionData,
		orderId,
		plan,
		title,
		description,
	} = data;

	const {
		tax,
		discount,
		total,
		price,
		credits,
		gatewayCharges,
	} = transactionData;

	const timestamp = epochCurrent('ms');
	let Localtitle, Localdescription;
	let transactionObject;

	return new Promise(async (resolve, reject) => {
		try {
			switch (transactionType) {
				case 'credit':
					Localtitle = `${credits} Credits Added`;
					Localdescription = `Added ${credits} credits to your account`;
					transactionObject =
						await handleCreditTransaction({
							credits: credits,
							totalAmount: total,
							email: email,
							timestamp: timestamp,
							orderId: orderId,
						});
					break;
				case 'debit':
					Localtitle = `${credits} Credits Deducted`;
					Localdescription = `Deducted ${credits} credits from your account`;
					transactionObject =
						await handleDebitTransaction({
							credits: credits,
							email: email,
							timestamp: timestamp,
							orderId: orderId,
							title: title || Localtitle,
							description:
								description || Localdescription,
						});
					break;
				case 'planpurchase':
					Localtitle = `${plan.planName} Plan Activated`;
					Localdescription = `Purchased ${plan.planName} plan`;
					let planData = {
						planPrice: price,
						isExtensionEnabled: plan.isExtensionEnabled,
						planName: plan.planName,
						extensionUsernames: plan.extensionUsernames,
						planPurchaseDate: timestamp,
					};
					transactionObject =
						await handlePlanPurchaseTransaction({
							plan: planData,
							email: email,
							timestamp: timestamp,
							planPrice: price,
							orderId: orderId,
						});
					break;
			}

			if (notifyUser) {
				await sendInvoice({
					email: email,
					timestamp: timestamp,
					amount: price,
					tax: tax,
					discount: discount,
					gatewayCharges: gatewayCharges,
					finalAmount: total,
					orderId: orderId,
					title: Localtitle,
					description: Localdescription,
				})
					.then((resp) => {
						console.log(resp);
						if (resp.status == 'ok') {
							console.log('Invoice sent successfully');
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
			resolve(transactionObject);
		} catch (error) {
			console.error(error);
			reject({
				status: 'error',
				message:
					'Something went wrong in adding transaction',
				error,
			});
		}
	});
};
