import User from '../../Models/userModel.js';
import TrackReel from '../../Models/trackReelModel.js';
import promocodes from '../../Models/promocode.js';
import Transaction from '../../Models/TransactionModel.js';
import adminCollection from '../../Models/adminConfig.js';
import { addTransaction } from '../Billing/Transaction.js';
import bcrypt from 'bcryptjs';

import { epochCurrent } from '../../Reusables/getTimestamp.js';
import { setPlan } from '../../Controllers/Users/userUtils.js';
import jwt from 'jsonwebtoken';
import { vars } from '../../secrets.js';

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

	const isPromocodeAvl = await promocodes.findOne({
		code,
	});
	if (isPromocodeAvl) {
		return res.status(400).json({
			status: 'error',
			message: 'Promocode already exists',
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

export const getPromocodes = async (req, res) => {
	const { page, limit, order } = req.body;
	if (!page || !limit || !order) {
		return res.status(400).json({
			status: 'error',
			message: 'Check Request Body',
		});
	}

	const promocodeLength = await promocodes
		.find({})
		.countDocuments();

	const promocode = await promocodes
		.find({})
		.sort({ timestamp: order })
		.skip((page - 1) * limit)
		.limit(limit);

	if (promocode.length == 0) {
		return res.status(200).json({
			status: 'ok',
			message: 'No promocode found',
			hasMore: false,
			promocode: [],
			totalPromocodes: promocodeLength,
		});
	}

	res.status(200).json({
		status: 'ok',
		message: 'Promocodes fetched successfully',
		promocode,
		hasMore: promocodeLength > page * limit,
		totalPromocodes: promocodeLength,
	});
};

export const deletePromocode = async (
	req,
	res
) => {
	const { id } = req.body;
	const deletedPromocode =
		await promocodes.findByIdAndDelete(id);
	if (deletedPromocode) {
		return res.status(200).json({
			status: 'ok',
			message: 'Promocode deleted successfully',
		});
	} else {
		return res.status(500).json({
			status: 'error',
			message: 'Something went wrong',
		});
	}
};

export const getUser = async (req, res) => {
	const email = req.params.email;
	const user = await User.findOne(
		{ email },
		{ password: 0 }
	);
	const userReel = await TrackReel.find({
		userEmail: email,
	}).countDocuments();
	if (user) {
		return res.status(200).json({
			status: 'ok',
			user: {
				...user._doc,
				onGoingReels: userReel,
			},
		});
	} else {
		return res.status(404).json({
			status: 'error',
			message: 'User not found',
		});
	}
};

export const getUsers = async (req, res) => {
	const { page, limit, order } = req.body;
	if (!page || !limit || !order) {
		return res.status(400).json({
			status: 'error',
			message: 'Check Request Body',
		});
	}

	const userLength = await User.find(
		{}
	).countDocuments();

	const users = await User.find(
		{},
		{ email: 1, name: 1, createdAt: 1 }
	)
		.sort({ createdAt: order })
		.skip((page - 1) * limit)
		.limit(limit);

	if (users.length == 0) {
		return res.status(200).json({
			status: 'ok',
			message: 'No user found',
			hasMore: false,
			users: [],
			totalUsers: userLength,
		});
	}

	res.status(200).json({
		status: 'ok',
		message: 'Users fetched successfully',
		users,
		hasMore: userLength > page * limit,
		totalUsers: userLength,
	});
};

export const getUserSuggestion = async (
	req,
	res
) => {
	const keyword = '^' + req.params.keyword;
	const users = await User.find(
		{
			email: { $regex: keyword, $options: 'i' },
		},
		{ password: 0 }
	).limit(3);
	if (users.length > 0) {
		return res.status(200).json({
			status: 'ok',
			users,
		});
	} else {
		return res.status(404).json({
			status: 'error',
			message: 'No user found',
		});
	}
};

export const modifyUser = async (req, res) => {
	const email = req.body.email;
	const { userData } = req.body;
	const user = await User.findOne({ email });
	if (user) {
		const modifiedUser =
			await User.findOneAndUpdate(
				{ email },
				{ ...userData }
			);
		if (modifiedUser) {
			return res.status(200).json({
				status: 'ok',
				message: 'User modified successfully',
			});
		} else {
			return res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in modifying user',
			});
		}
	} else {
		return res.status(404).json({
			status: 'error',
			message: 'User not found',
		});
	}
};

export const changePlan = async (req, res) => {
	const email = req.body.email;
	const user = await User.findOne({ email });
	if (user) {
		const plan = req.body.plan;
		const modifiedUser = await setPlan(email, plan);
		if (modifiedUser) {
			return res.status(200).json({
				status: 'ok',
				message: 'Plan changed successfully',
			});
		} else {
			return res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in changing plan',
			});
		}
	} else {
		return res.status(404).json({
			status: 'error',
			message: 'User not found',
		});
	}
};

export const getStatistics = async (req, res) => {
	const users = await User.find();
	const tracks = await TrackReel.find();
	const promocodesList = await promocodes.find();
	const transactions = await Transaction.find();

	const saleAmount = await Transaction.aggregate([
		{
			$match: {
				type: 'planpurchase',
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: '$amount' },
			},
		},
	]);

	const creditSaleAmount =
		await Transaction.aggregate([
			{
				$match: {
					type: 'credit',
				},
			},
			{
				$group: {
					_id: null,
					total: { $sum: '$amount' },
				},
			},
		]);

	const FreeplanUsers = await User.find({
		'plan.planName': 'Free',
	});

	const IndividualPlanUsers = await User.find({
		'plan.planName': 'Individual',
	});

	const BusinessPlanUsers = await User.find({
		'plan.planName': 'Professional',
	});

	let TodaysEarning = 0;

	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);

	const endOfDay = new Date();
	endOfDay.setHours(23, 59, 59, 999);

	const TodaysEarningObj =
		await Transaction.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startOfDay,
						$lt: endOfDay,
					},
				},
			},
			{
				$group: {
					_id: null,
					total: { $sum: '$amount' },
				},
			},
		]);

	if (TodaysEarningObj.length > 0) {
		TodaysEarning = TodaysEarningObj[0].total;
	}
	const stats = {
		users: users.length,
		tracks: tracks.length,
		promocodes: promocodesList.length,
		transactions: transactions.length,
		subsciptionSales: saleAmount[0].total,
		creditsSales: creditSaleAmount[0].total,
		freePlanUsers: FreeplanUsers.length,
		individualPlanUsers: IndividualPlanUsers.length,
		professionalPlanUsers: BusinessPlanUsers.length,
		todaysEarning: TodaysEarning,
	};

	return res.status(200).json({
		status: 'ok',
		stats,
	});
};

export const getAllTransactions = async (
	req,
	res
) => {
	const { page, limit, order } = req.body;
	if (!page || !limit || !order) {
		return res.status(400).json({
			status: 'error',
			message: 'Check Request Body',
		});
	}

	const TransactionLength = await Transaction.find(
		{}
	).countDocuments();

	const transaction = await Transaction.find({})
		.sort({ createdAt: order })
		.skip((page - 1) * limit)
		.limit(limit);

	if (transaction.length == 0) {
		return res.status(200).json({
			status: 'ok',
			message: 'No transaction found',
			hasMore: false,
			transactions: [],
			totalTransactions: TransactionLength,
		});
	}

	res.status(200).json({
		status: 'ok',
		message: 'Transactions fetched successfully',
		transactions: transaction,
		hasMore: TransactionLength > page * limit,
		totalTransactions: TransactionLength,
	});
};

export const adminConfigData = async (
	req,
	res
) => {
	const serverConfig = await adminCollection.find({
		email: 'admin@igloaded.com',
	});
	if (serverConfig) {
		return res.status(200).json({
			status: 'ok',
			serverConfig,
		});
	} else {
		return res.status(500).json({
			status: 'error',
			message: 'Something went wrong',
		});
	}
};

export const changeServerPlanDetails = async (
	req,
	res
) => {
	const { email, dataObject } = req.body;
	const serverConfig = await adminCollection.find({
		email: email,
	});
	if (serverConfig) {
		const modifiedServerConfig =
			await adminCollection.findOneAndUpdate(
				{ email },
				{ ...dataObject }
			);
		if (modifiedServerConfig) {
			return res.status(200).json({
				status: 'ok',
				message:
					'Server Config modified successfully',
			});
		} else {
			return res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in modifying server config',
			});
		}
	}
};

export const addUserTransaction = async (
	req,
	res
) => {
	const { dataObject } = req.body;
	try {
		const resp = await addTransaction(dataObject);
		if (resp.status == 'ok') {
			return res.status(200).json({
				status: 'ok',
				message: 'Transaction added successfully',
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			status: 'error',
			message: 'Something went wrong',
			error,
		});
	}
};

export const deleteTransaction = async (
	req,
	res
) => {
	const { id, email } = req.body;
	const deletedTransaction =
		await Transaction.findByIdAndDelete(id);
	if (deletedTransaction) {
		const user = await User.findOneAndUpdate(
			{ email: email },
			{ $inc: { 'activity.transactions': -1 } },
			{ new: true }
		);
		if (user) {
			return res.status(200).json({
				status: 'ok',
				message: 'Transaction deleted successfully',
			});
		} else {
			return res.status(500).json({
				status: 'error',
				message: 'Something went wrong',
			});
		}
	} else {
		return res.status(500).json({
			status: 'error',
			message: 'Something went wrong',
		});
	}
};

export const adminLogin = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({
		email: email,
	});

	if (!user) {
		return res.status(404).json({
			status: 'error',
			message: 'User not found',
		});
	}
	if (!user.isAdmin) {
		return res.status(403).json({
			status: 'error',
			message: 'Access Denied',
		});
	}

	const token = jwt.sign(
		{ id: user._id },
		vars.jwtSecret,
		{ expiresIn: '2d' }
	);

	return res.status(200).json({
		status: 'ok',
		message: 'Admin Login Approved',
		name: user.name,
		token,
	});
};
