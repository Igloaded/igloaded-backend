import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../../Models/userModel.js';
import TrackReel from '../../Models/trackReelModel.js';
import promocodes from '../../Models/promocode.js';
import Transaction from '../../Models/TransactionModel.js';

import { vars } from '../../secrets.js';
import { ValidateToken } from '../../Middlewares/Users.js';
import {
	sendMailTest,
	sendMail,
	sendWelcomeMail,
	passwordChangedMail,
	billingInvoice,
} from '../../Controllers/SendEmail/sendEmail.js';
import {
	epochCurrent,
	epochToDateLocale,
} from '../../Reusables/getTimestamp.js';
import { setPlan } from '../../Controllers/Users/userUtils.js';
import { createInvoice } from '../Billing/createInvoice.js';

export const createUser = async (req, res) => {
	try {
		const { email, password, name, ...restOfBody } =
			req.body;
		const userExists = await User.findOne({
			email,
		});
		if (userExists) {
			res.status(400).json({
				status: 'error',
				message: 'User already exists',
			});
			return;
		}

		const hash = await bcrypt.hash(password, 10);
		const user = await User.create({
			email: email,
			password: hash,
			name: name,
			...restOfBody,
		});

		if (user) {
			const isMailsent = await sendWelcomeMail(
				email,
				name
			);
			if (isMailsent.status == 400) {
				console.log('Welcome Mail not sent');
			}
			res.status(200).json({
				status: 'ok',
				message: 'User created successfully',
				token: jwt.sign(
					{ id: user._id },
					vars.jwtSecret,
					{ expiresIn: '7d' }
				),
				user,
			});
		} else {
			res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in creating account',
			});
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in creating account',
			error,
		});
	}
};

export const getUser = async (req, res) => {
	const token =
		req.headers.authorization.split(' ')[1];
	let tokenData;

	if (token) {
		tokenData = await ValidateToken(token);
	} else {
		return res.status(401).json({
			status: 'error',
			message: 'Token not found',
			actionRequired: 'login',
		});
	}

	if (tokenData.error) {
		return res.status(401).json({
			status: 'error',
			message: 'Invalid Token',
			actionRequired: 'login',
			error: isUserValid.error,
		});
	}

	if (tokenData.status == 'success') {
		let userId = tokenData.id;
		try {
			const user = await User.findById(userId);
			const {
				email,
				name,
				credits,
				isAdmin,
				plan,
				limits,
			} = user;
			res.status(200).json({
				status: 'ok',
				message: 'User fetched successfully',
				email,
				name,
				credits,
				isAdmin,
				plan,
				limits,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in getting user',
				error,
			});
		}
	}
};

export const loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Email',
			});
		}

		const { name, credits, isAdmin, plan } = user;
		const isPasswordValid = await bcrypt.compare(
			password,
			user.password
		);

		if (!isPasswordValid) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Password',
			});
		}

		if (user.isBlocked) {
			return res.status(401).json({
				status: 'error',
				message: 'User blocked',
				actionRequired: 'contact support',
			});
		}

		const token = jwt.sign(
			{ id: user._id },
			vars.jwtSecret,
			{ expiresIn: '7d' }
		);

		res.status(200).json({
			status: 'ok',
			message: 'User logged in successfully',
			name,
			credits,
			email,
			isAdmin,
			token,
			plan,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong',
			error,
		});
	}
};

export const getPlanDetails = async (
	req,
	res
) => {
	const { email } = req.query;
	try {
		const user = await User.findOne({ email });
		const plandetails = {
			name: user.name,
			credits: user.credits,
			plan: user.plan,
		};
		res.status(200).json({
			status: 'ok',
			message: 'Plan details fetched successfully',
			data: plandetails,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in getting plan details',
			error,
		});
	}
};

export const getUsers = async (req, res) => {
	if (!req.isAdmin) {
		res.status(401).json({
			status: 'error',
			message: 'Not authorized',
			actionRequired: 'admin login required',
		});
		return;
	}
	try {
		const users = await User.find({});
		res.status(200).json({
			status: 'ok',
			message: 'Users fetched successfully',
			users,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in fetching users',
			error,
		});
	}
};

export const deleteUser = async (req, res) => {
	if (!req.isAdmin) {
		res.status(401).json({
			status: 'error',
			message: 'Not authorized',
			actionRequired: 'admin login required',
			status1: req.isAdmin,
		});
		return;
	}
	try {
		const { email } = req.params;
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Email',
			});
		}
		const userDelete = await User.findOneAndDelete({
			email,
		});
		res.status(200).json({
			status: 'ok',
			message: 'User deleted successfully',
			id: userDelete._id,
			email: userDelete.email,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in deleting user',
			error,
		});
	}
};

export const findUser = async (req, res) => {
	try {
		const { email } = req.query;
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(200).json({
				status: 'ok',
				message: 'User not found',
				userExist: false,
				email: email,
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'User found',
				userExist: true,
				email: email,
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in finding user',
			error,
		});
	}
};

export const updateUser = async (req, res) => {
	if (!req.userId) {
		res.status(401).json({
			status: 'error',
			message: 'Not logged In',
			actionRequired: 'login',
		});
		return;
	}
	try {
		if (Object.keys(req.body).length === 0) {
			return res.status(400).json({
				status: 'error',
				message: 'No fields to update',
			});
		}
		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: 'User not found',
				email: email,
			});
		}
		const userUpdate = await User.findByIdAndUpdate(
			req.userId,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		const updatedFields = {};
		for (const key in req.body) {
			if (req.body[key] !== user[key]) {
				updatedFields[key] = userUpdate[key];
			}
		}
		res.status(200).json({
			status: 'ok',
			message: 'User updated successfully',
			...updatedFields,
		});
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in updating user',
			error,
		});
	}
};

export const forgetPassword = async (
	req,
	res
) => {
	const { newpassword, email } = req.body;
	try {
		const user = await User.findOne({ email });
		const IsPasswordSame = await bcrypt.compare(
			newpassword,
			user.password
		);
		if (!IsPasswordSame) {
			const hash = await bcrypt.hash(
				newpassword,
				10
			);
			user.password = hash;
			await user.save();
			return res.status(200).json({
				status: 'ok',
				message: 'Password reset successfully',
				id: user._id,
				email: user.email,
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message:
					'New password cannot be same as old password',
			});
		}
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in resetting password',
			error,
		});
	}
};

export const changePassword = async (
	req,
	res
) => {
	const { newpassword, oldpassword, email } =
		req.body;
	try {
		const user = await User.findOne({ email });
		const IsPasswordSame = await bcrypt.compare(
			oldpassword,
			user.password
		);
		const isNewPasswordSame = await bcrypt.compare(
			newpassword,
			user.password
		);
		if (IsPasswordSame && !isNewPasswordSame) {
			user.password = await bcrypt.hash(
				newpassword,
				10
			);
			await user.save();
			// const sendMailResp = //To Fix
			// 	await passwordChangedMail();
			// if (sendMailResp.status == 200) {
			// 	console.log('Password Changed Mail sent');
			// }
			passwordChangedMail(email, user.name)
				.then((resp) => {
					if (resp.status == 200) {
						console.log('Password Changed Mail sent');
					}
				})
				.catch((err) => {
					console.log(err);
				});
			return res.status(200).json({
				status: 'ok',
				message: 'Password changed successfully',
				id: user._id,
				email: user.email,
			});
		} else {
			if (!IsPasswordSame) {
				return res.status(400).json({
					status: 'error',
					message: 'Old password is incorrect',
				});
			}
			if (isNewPasswordSame) {
				return res.status(400).json({
					status: 'error',
					message:
						'New password cannot be same as old password',
				});
			}
		}
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in changing password',
			error,
		});
	}
};

export const getUsage = async (req, res) => {
	let userId = req.userId;
	try {
		const user = await User.findById(userId);
		res.status(200).json({
			status: 'ok',
			message: 'Usage fetched successfully',
			data: {
				limits: user.limits,
				plan: user.plan,
				reelsTracked: user.activity.reels,
				credits: user.credits,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong',
			error,
		});
	}
};

export const addTransaction = async (
	req,
	res
) => {
	try {
		const {
			email,
			amount,
			title,
			Description,
			transactionType,
			plan,
			transactionData,
		} = req.body;

		const {
			tax,
			discount,
			total,
			price,
			quantity,
			purchaseTitle,
			purchaseDescription,
		} = transactionData;

		let transactionObject = {
			userId: '',
			email: email,
			Id: '',
			date: 0,
			title: '',
			description: '',
			amount: 0,
			type: '',
			status: '',
		};

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Email',
			});
		}

		if (
			transactionType == 'debit' &&
			user.credits < amount
		) {
			return res.status(400).json({
				status: 'error',
				message: 'Insufficient credits',
			});
		}

		if (
			transactionType == 'debit' &&
			user.credits >= amount
		) {
			const currentDate = epochCurrent('ms');
			transactionObject = {
				userId: user._id,
				email: email,
				id: String(`IGL${currentDate}`),
				date: currentDate,
				title: title,
				description: Description,
				amount: amount,
				type: transactionType,
				status: 'success',
			};
			user.credits = user.credits - amount;
			user.activity.transactions =
				user.activity.transactions + 1;
			user.markModified('activity');
			await user.save();

			const result = await Transaction.create(
				transactionObject
			);
			if (result) {
				return res.status(200).json({
					status: 'ok',
					message: 'Transaction added successfully',
					transaction: transactionObject,
				});
			} else {
				return res.status(500).json({
					status: 'error',
					message:
						'Something went wrong in adding transaction',
				});
			}
		}

		if (transactionType == 'credit') {
			const currentDate = epochCurrent('ms');
			transactionObject = {
				userId: user._id,
				email: email,
				id: String(`IGL${currentDate}`),
				date: currentDate,
				title: title,
				description: Description,
				amount: amount,
				type: transactionType,
				status: 'success',
			};
			user.credits = user.credits + amount;
			user.activity.transactions =
				user.activity.transactions + 1;
			user.markModified('activity');
			await user.save();
			const result = await Transaction.create(
				transactionObject
			);
			if (result) {
				return res.status(200).json({
					status: 'ok',
					message: 'Transaction added successfully',
					transaction: transactionObject,
				});
			} else {
				return res.status(500).json({
					status: 'error',
					message:
						'Something went wrong in adding transaction',
				});
			}
		}

		if (transactionType == 'planpurchase') {
			const currentDate = epochCurrent('ms');
			transactionObject = {
				userId: user._id,
				email: email,
				id: String(`IGL${currentDate}`),
				date: currentDate,
				title: title,
				description: Description,
				amount: plan.planPrice,
				type: transactionType,
				status: 'success',
			};

			const planDetails = {
				planPrice: plan.planPrice,
				isExtensionEnabled: plan.isExtensionEnabled,
				planName: plan.planName,
				extensionUsernames: plan.extensionUsernames,
				planPurchaseDate: currentDate,
			};

			console.log(currentDate);
			user.activity.transactions =
				user.activity.transactions + 1;
			user.markModified('activity');
			await user.save();

			const billData = {
				date: epochToDateLocale(currentDate, 'ms'),
				orderId: String(currentDate),
				ogamount: `₹${price}`,
				discount: `₹${discount}`,
				tax: `₹${tax}`,
				total: `₹${total}`,
				customerEmail: email,
				customerName: user.name,
				quantity: quantity,
				title: purchaseTitle,
				description: purchaseDescription,
			};

			let billGenereted = false;
			let billBuffer;
			await createInvoice(billData)
				.then((resp) => {
					if (resp.status == 200) {
						billGenereted = true;
						billBuffer = resp.bufferData;
					}
				})
				.catch((err) => {
					console.log(err);
				});

			const planResp = await setPlan(
				email,
				planDetails
			);
			const result = await Transaction.create(
				transactionObject
			);
			console.log(currentDate);
			if (billGenereted) {
				const dataRes = {
					date: epochToDateLocale(currentDate, 'ms'),
					total: `₹${total}`,
					customerEmail: email,
					customerName: user.name,
					purchaseTitle: purchaseTitle,
					purchaseDescription: purchaseDescription,
					billBuffer: billBuffer,
				};

				await billingInvoice(dataRes)
					.then((resp) => {
						if (resp.status == 200) {
							console.log('Invoice sent successfully');
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
			if (result && planResp.success) {
				return res.status(200).json({
					status: 'ok',
					message: 'Transaction added successfully',
					transaction: transactionObject,
				});
			} else {
				return res.status(500).json({
					status: 'error',
					message:
						'Something went wrong in adding transaction',
				});
			}
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in adding transaction',
			error,
		});
	}
};

export const addTransactionLocal = async (
	data
) => {
	try {
		const {
			notifyUser,
			email,
			amount,
			title,
			Description,
			transactionType,
			transactionData,
			plan,
		} = data;

		const {
			tax,
			discount,
			total,
			price,
			quantity,
			purchaseTitle,
			purchaseDescription,
		} = transactionData;

		let transactionObject = {
			userId: '',
			email: email,
			Id: '',
			date: 0,
			title: '',
			description: '',
			amount: 0,
			type: '',
			status: '',
		};

		return new Promise(async (resolve, reject) => {
			const user = await User.findOne({ email });
			if (!user) {
				reject({
					status: 'error',
					message: 'Invalid Email',
				});
			}

			if (
				transactionType == 'debit' &&
				user.credits < amount
			) {
				reject({
					status: 'error',
					message: 'Insufficient credits',
				});
			}

			if (
				transactionType == 'debit' &&
				user.credits >= amount
			) {
				const currentDate = epochCurrent('ms');
				transactionObject = {
					userId: user._id,
					email: email,
					id: String(`IGL${currentDate}`),
					date: currentDate,
					title: title,
					description: Description,
					amount: amount,
					type: transactionType,
					status: 'success',
				};
				user.credits = user.credits - amount;
				user.activity.transactions =
					user.activity.transactions + 1;
				user.markModified('activity');
				await user.save();

				const result = await Transaction.create(
					transactionObject
				);

				let billGenereted = false;
				let billBuffer;

				if (notifyUser) {
					const billData = {
						date: epochToDateLocale(currentDate, 'ms'),
						orderId: String(currentDate),
						ogamount: `₹${price}`,
						discount: `₹${discount}`,
						tax: `₹${tax}`,
						total: `₹${total}`,
						customerEmail: email,
						customerName: user.name,
						quantity: quantity,
						title: purchaseTitle,
						description: purchaseDescription,
					};
					await createInvoice(billData)
						.then((resp) => {
							if (resp.status == 200) {
								billGenereted = true;
								billBuffer = resp.bufferData;
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}

				if (billGenereted) {
					const dataRes = {
						date: epochToDateLocale(currentDate, 'ms'),
						total: `₹${total}`,
						customerEmail: email,
						customerName: user.name,
						purchaseTitle: purchaseTitle,
						purchaseDescription: purchaseDescription,
						billBuffer: billBuffer,
					};

					await billingInvoice(dataRes)
						.then((resp) => {
							if (resp.status == 200) {
								console.log('Invoice sent successfully');
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}
				if (result) {
					resolve({
						status: 'ok',
						message: 'Transaction added successfully',
						transaction: transactionObject,
					});
				} else {
					reject({
						status: 'error',
						message:
							'Something went wrong in adding transaction',
					});
				}
			}

			if (transactionType == 'credit') {
				const currentDate = epochCurrent('ms');
				transactionObject = {
					userId: user._id,
					email: email,
					id: String(`IGL${currentDate}`),
					date: currentDate,
					title: title,
					description: Description,
					amount: amount,
					type: transactionType,
					status: 'success',
				};
				user.credits = user.credits + amount;
				user.activity.transactions =
					user.activity.transactions + 1;
				user.markModified('activity');
				await user.save();
				const result = await Transaction.create(
					transactionObject
				);

				let billGenereted = false;
				let billBuffer;

				if (notifyUser) {
					const billData = {
						date: epochToDateLocale(currentDate, 'ms'),
						orderId: String(currentDate),
						ogamount: `₹${price}`,
						discount: `₹${discount}`,
						tax: `₹${tax}`,
						total: `₹${total}`,
						customerEmail: email,
						customerName: user.name,
						quantity: quantity,
						title: purchaseTitle,
						description: purchaseDescription,
					};
					await createInvoice(billData)
						.then((resp) => {
							if (resp.status == 200) {
								billGenereted = true;
								billBuffer = resp.bufferData;
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}

				if (billGenereted) {
					const dataRes = {
						date: epochToDateLocale(currentDate, 'ms'),
						total: `₹${total}`,
						customerEmail: email,
						customerName: user.name,
						purchaseTitle: purchaseTitle,
						purchaseDescription: purchaseDescription,
						billBuffer: billBuffer,
					};

					await billingInvoice(dataRes)
						.then((resp) => {
							if (resp.status == 200) {
								console.log('Invoice sent successfully');
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}
				if (result) {
					resolve({
						status: 'ok',
						message: 'Transaction added successfully',
						transaction: transactionObject,
					});
				} else {
					reject({
						status: 'error',
						message:
							'Something went wrong in adding transaction',
					});
				}
			}

			if (transactionType == 'planpurchase') {
				const currentDate = epochCurrent('ms');
				transactionObject = {
					userId: user._id,
					email: email,
					id: String(`IGL${currentDate}`),
					date: currentDate,
					title: title,
					description: Description,
					amount: plan.planPrice,
					type: transactionType,
					status: 'success',
				};

				const planDetails = {
					planPrice: plan.planPrice,
					isExtensionEnabled: plan.isExtensionEnabled,
					planName: plan.planName,
					extensionUsernames: plan.extensionUsernames,
					planPurchaseDate: currentDate,
				};

				console.log(currentDate);

				user.activity.transactions =
					user.activity.transactions + 1;
				user.markModified('activity');
				await user.save();

				const planResp = await setPlan(
					email,
					planDetails
				);
				const result = await Transaction.create(
					transactionObject
				);
				console.log(currentDate);

				let billGenereted = false;
				let billBuffer;

				if (notifyUser) {
					const billData = {
						date: epochToDateLocale(currentDate, 'ms'),
						orderId: String(currentDate),
						ogamount: `₹${price}`,
						discount: `₹${discount}`,
						tax: `₹${tax}`,
						total: `₹${total}`,
						customerEmail: email,
						customerName: user.name,
						quantity: quantity,
						title: purchaseTitle,
						description: purchaseDescription,
					};
					await createInvoice(billData)
						.then((resp) => {
							if (resp.status == 200) {
								billGenereted = true;
								billBuffer = resp.bufferData;
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}

				if (billGenereted) {
					const dataRes = {
						date: epochToDateLocale(currentDate, 'ms'),
						total: `₹${total}`,
						customerEmail: email,
						customerName: user.name,
						purchaseTitle: purchaseTitle,
						purchaseDescription: purchaseDescription,
						billBuffer: billBuffer,
					};

					await billingInvoice(dataRes)
						.then((resp) => {
							if (resp.status == 200) {
								console.log('Invoice sent successfully');
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}

				if (result && planResp.success) {
					resolve({
						status: 'ok',
						message: 'Transaction added successfully',
						transaction: transactionObject,
					});
				} else {
					reject({
						status: 'error',
						message:
							'Something went wrong in adding transaction',
					});
				}
			}
		});
	} catch (error) {
		console.error(error);
		reject({
			status: 'error',
			message:
				'Something went wrong in adding transaction',
			error,
		});
	}
};

export const getTrackedReels = async (
	req,
	res
) => {
	const { page, limit, email, include, showOnly } =
		req.body;

	if (
		!page ||
		!limit ||
		!email ||
		!include ||
		!showOnly
	) {
		return res.status(400).json({
			status: 'error',
			message: 'please check the body fields',
		});
	}

	const token = req.userId;
	const user = await User.findById(token);

	if (user && user.email != email) {
		return res.status(401).json({
			status: 'error',
			message: 'Token and Email not matched',
			actionRequired: 'login',
		});
	}

	if (!user) {
		return res.status(401).json({
			status: 'error',
			message: 'User not found',
			actionRequired: 'login',
		});
	}

	if (include == 1) {
		const reelLength = await TrackReel.find({
			userEmail: user.email,
			status: { $in: showOnly },
		});
		const reelItems = await TrackReel.find({
			userEmail: user.email,
			status: { $in: showOnly },
		})
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		if (reelItems.length == 0) {
			return res.status(200).json({
				status: 'ok',
				message: 'No reels found',
				hasMore: false,
				reels: [],
				totalReels: reelItems.length,
			});
		}

		res.status(200).json({
			status: 'ok',
			message: 'Reels fetched successfully',
			reels: reelItems,
			hasMore: reelLength.length > page * limit,
			totalReels: reelLength.length,
		});
	} else {
		const documents = await TrackReel.find({
			userEmail: user.email,
			title: { $regex: include, $options: 'i' },
		});

		if (documents.length == 0) {
			return res.status(200).json({
				status: 'ok',
				message: 'No reels found',
				hasMore: false,
				reels: [],
				totalReels: 0,
			});
		}

		res.status(200).json({
			status: 'ok',
			message: 'Reels fetched successfully',
			reels: documents,
			totalReels: documents.length,
		});
	}
};

export const verifyMail = async (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).json({
			status: 'error',
			message: 'Email is required',
		});
	}
	const user = await User.findOne({ email });
	if (!user) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid Email',
		});
	} else {
		req.body.email = email;
		sendMailTest(req, res);
	}
};

export const getTransaction = async (
	req,
	res
) => {
	const { page, limit, email, order, filter } =
		req.body;
	if (
		!page ||
		!limit ||
		!email ||
		!order ||
		!filter
	) {
		return res.status(400).json({
			status: 'error',
			message:
				'page, limit, order and email are required',
		});
	}
	const token = req.userId;
	const user = await User.findById(token);

	const filterType =
		Array.isArray(filter.byType) &&
		filter.byType.length > 0
			? filter.byType
			: ['credit', 'debit', 'planpurchase'];

	let transactionLength =
		user.activity.transactions;

	if (filterType.length != 0) {
		await Transaction.find({
			userId: token,
			email: email,
			type: filterType,
		})
			.then((data) => {
				transactionLength = data.length;
			})
			.catch((err) => {
				console.log(err);
			});
	}

	const transaction = await Transaction.find({
		userId: token,
		email: email,
		type: filterType,
	})
		.sort({ createdAt: order })
		.skip((page - 1) * limit)
		.limit(limit);

	if (transaction.length == 0) {
		return res.status(200).json({
			status: 'ok',
			message: 'No transaction found',
			hasMore: false,
			transactions: [],
			totalTransactions: transactionLength,
		});
	}

	res.status(200).json({
		status: 'ok',
		message: 'Transactions fetched successfully',
		transactions: transaction,
		hasMore: transactionLength > page * limit,
		totalTransactions: transactionLength,
	});
};

export const checkPromoCode = async (
	req,
	res
) => {
	const { email, amount, promocode } = req.body;
	if (!email || !amount || !promocode) {
		return res.status(400).json({
			status: 'error',
			message:
				'email, amount and promocode are required',
		});
	}

	const code = await promocodes.findOne({
		code: promocode,
	});

	if (!code) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid promocode',
		});
	}

	let timestamp = epochCurrent('ms');

	if (code.for == email) {
		if (!code.isUsed) {
			if (code.expiry > timestamp) {
				if (amount < code.discount) {
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: code.discount - amount,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				if (amount == code.discount) {
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: 1,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				const dataRes = {
					status: 'ok',
					message: 'Promocode applied successfully',
					promocode: code.code,
					amount: amount,
					discount: code.discount,
					usedBy: email,
				};
				return res.status(200).json(dataRes);
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Promocode expired',
				});
			}
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Promocode already used',
			});
		}
	} else if (code.for == 'all') {
		if (code.useCount < code.maxUses) {
			if (code.expiry > timestamp) {
				if (amount < code.discount) {
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: code.discount - amount,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				if (amount == code.discount) {
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: 1,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				const dataRes = {
					status: 'ok',
					message: 'Promocode applied successfully',
					promocode: code.code,
					amount: amount,
					discount: code.discount,
					usedBy: email,
				};
				return res.status(200).json(dataRes);
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Promocode expired',
				});
			}
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Promocode usage limit reached',
			});
		}
	} else {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid promocode',
		});
	}
};

export const checkPromoCodeLocal = async (
	data
) => {
	const { email, amount, promocode } = data;
	if (!email || !amount || !promocode) {
		throw new Error({
			status: 'error',
			message:
				'email, amount and promocode are required',
		});
	}
	return new Promise(async (resolve, reject) => {
		const code = await promocodes.findOne({
			code: promocode,
		});

		if (!code) {
			reject({
				status: 'error',
				message: 'Invalid promocode',
			});
		}

		let timestamp = epochCurrent('ms');

		if (code.for == email) {
			if (!code.isUsed) {
				if (code.expiry > timestamp) {
					if (amount < code.discount) {
						const dataRes = {
							status: 'ok',
							message: 'Promocode applied successfully',
							promocode: code.code,
							amount: amount,
							discountamount: code.discount - amount,
							usedBy: email,
						};
						resolve(dataRes);
					}
					if (amount == code.discount) {
						const dataRes = {
							status: 'ok',
							message: 'Promocode applied successfully',
							promocode: code.code,
							amount: amount,
							discountamount: 1,
							usedBy: email,
						};
						resolve(dataRes);
					}
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discountamount: code.discount,
						usedBy: email,
					};
					resolve(dataRes);
				} else {
					reject({
						status: 'error',
						message: 'Promocode expired',
					});
				}
			} else {
				reject({
					status: 'error',
					message: 'Promocode already used',
				});
			}
		} else if (code.for == 'all') {
			if (code.useCount < code.maxUses) {
				if (code.expiry > timestamp) {
					if (amount < code.discount) {
						const dataRes = {
							status: 'ok',
							message: 'Promocode applied successfully',
							promocode: code.code,
							amount: amount,
							discountamount: code.discount - amount,
							usedBy: email,
						};
						resolve(dataRes);
					}
					if (amount == code.discount) {
						const dataRes = {
							status: 'ok',
							message: 'Promocode applied successfully',
							promocode: code.code,
							amount: amount,
							discountamount: 1,
							usedBy: email,
						};
						resolve(dataRes);
					}
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discountamount: code.discount,
						usedBy: email,
					};
					resolve(dataRes);
				} else {
					reject({
						status: 'error',
						message: 'Promocode expired',
					});
				}
			} else {
				reject({
					status: 'error',
					message: 'Promocode usage limit reached',
				});
			}
		}
	});
};

export const applyPromoCode = async (
	req,
	res
) => {
	const { email, amount, promocode } = req.body;
	if (!email || !amount || !promocode) {
		return res.status(400).json({
			status: 'error',
			message:
				'email, amount and promocode are required',
		});
	}

	const code = await promocodes.findOne({
		code: promocode,
	});

	if (!code) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid promocode',
		});
	}

	let timestamp = epochCurrent('ms');

	if (code.for == email) {
		if (!code.isUsed) {
			if (code.expiry > timestamp) {
				if (amount < code.discount) {
					code.isUsed = true;
					await code.save();
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: code.discount - amount,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				if (amount == code.discount) {
					code.isUsed = true;
					await code.save();
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: 1,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				code.isUsed = true;
				await code.save();
				const dataRes = {
					status: 'ok',
					message: 'Promocode applied successfully',
					promocode: code.code,
					amount: amount,
					discount: code.discount,
					usedBy: email,
				};
				return res.status(200).json(dataRes);
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Promocode expired',
				});
			}
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Promocode already used',
			});
		}
	} else if (code.for == 'all') {
		if (code.useCount < code.maxUses) {
			if (code.expiry > timestamp) {
				if (amount < code.discount) {
					code.useCount = code.useCount + 1;
					await code.save();
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: code.discount - amount,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				if (amount == code.discount) {
					code.useCount = code.useCount + 1;
					await code.save();
					const dataRes = {
						status: 'ok',
						message: 'Promocode applied successfully',
						promocode: code.code,
						amount: amount,
						discount: 1,
						usedBy: email,
					};
					return res.status(200).json(dataRes);
				}
				code.useCount = code.useCount + 1;
				await code.save();
				const dataRes = {
					status: 'ok',
					message: 'Promocode applied successfully',
					promocode: code.code,
					amount: amount,
					discount: code.discount,
					usedBy: email,
				};
				return res.status(200).json(dataRes);
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Promocode expired',
				});
			}
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'Promocode usage limit reached',
			});
		}
	}
};

export const addPromocode = async (req, res) => {
	const {
		code,
		discount,
		expiry,
		email,
		maxUses,
	} = req.body;
	if (
		!code ||
		!discount ||
		!expiry ||
		!email ||
		!maxUses
	) {
		return res.status(400).json({
			status: 'error',
			message:
				'code, discount, expiry, for, maxAmount and maxUses are required',
		});
	}

	const promocode = await promocodes.create({
		code,
		discount,
		for: email,
		isUsed: false,
		maxUses,
		useCount: 0,
		timestamp: epochCurrent('ms'),
		expiry,
	});

	if (promocode) {
		return res.status(200).json({
			status: 'ok',
			message: 'Promocode added successfully',
			promocode,
		});
	} else {
		return res.status(500).json({
			status: 'error',
			message:
				'Something went wrong in adding promocode',
		});
	}
};

export const addUsername = async (req, res) => {
	const { email, username } = req.body;
	if (!email || !username) {
		return res.status(400).json({
			status: 'error',
			message: 'email and username are required',
		});
	}

	const user = await User.findOne({ email });
	if (!user) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid Email',
		});
	}

	if (
		user.plan.maxUsernames <=
		user.plan.extensionUsernames.length
	) {
		return res.status(400).json({
			status: 'error',
			message: 'Usernames limit reached!',
		});
	}

	if (user.plan.isExtensionEnabled) {
		for (
			let i = 0;
			i < user.plan.extensionUsernames.length;
			i++
		) {
			if (
				user.plan.extensionUsernames[i] == username
			) {
				return res.status(400).json({
					status: 'error',
					message: 'Username already added',
				});
			}
		}
		user.plan.extensionUsernames.push(username);
		user.markModified('plan');
		await user.save();
		return res.status(200).json({
			status: 'ok',
			message: 'Username added successfully',
			username,
		});
	} else {
		return res.status(400).json({
			status: 'error',
			message: 'Feature not enabled',
		});
	}
};

export const removeUsername = async (
	req,
	res
) => {
	const { email, username } = req.body;
	if (!email || !username) {
		return res.status(400).json({
			status: 'error',
			message: 'email and username are required',
		});
	}

	const user = await User.findOne({ email });
	if (!user) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid Email',
		});
	}

	if (user.plan.isExtensionEnabled) {
		if (user.plan.extensionUsernames.length == 0) {
			return res.status(400).json({
				status: 'error',
				message: 'No usernames found',
			});
		}

		if (user.plan.extensionUsernames.length == 1) {
			return res.status(400).json({
				status: 'error',
				message: 'Cannot remove the last username',
			});
		}

		for (
			let i = 0;
			i < user.plan.extensionUsernames.length;
			i++
		) {
			if (
				user.plan.extensionUsernames[i] == username
			) {
				user.plan.extensionUsernames.splice(i, 1);
				user.markModified('plan');
				await user.save();
				return res.status(200).json({
					status: 'ok',
					message: 'Username removed successfully',
					username,
				});
			}
		}
		return res.status(400).json({
			status: 'error',
			message: 'Username not found',
		});
	} else {
		return res.status(400).json({
			status: 'error',
			message: 'Feature not enabled',
		});
	}
};

export const getAvlReels = async (req, res) => {
	const { email } = req.body;
	const data = {};
	if (!email) {
		return res.status(400).json({
			status: 'error',
			message: 'email is required',
		});
	}

	const user = await User.findOne({ email });
	if (!user) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid Email',
		});
	}

	data.isTrackingAllowed =
		user.limits.isReelTrackingEnabled;
	data.trackedReels = user.limits.dailyReelCount;
	data.monthlyLimit = user.limits.maxReelsPerMonth;
	data.dailyLimit = user.limits.maxReelsPerDay;

	return res.status(200).json({
		status: 'ok',
		message: 'Reels fetched successfully',
		info: data,
	});
};
