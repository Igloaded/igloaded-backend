import User from '../../Models/userModel.js';
import {
	epochCurrent,
	addToEpoch,
	epochToDate,
	modifyAddToEpoch,
} from '../../Reusables/getTimestamp.js';

export const resetDailyLimits = async (id) => {
	const userToReset = await User.findById(id);
	if (!userToReset) {
		throw new Error('User not found');
	}
	const newResetEpoch = addToEpoch(1);
	userToReset.limits.lastScanReset = newResetEpoch; // I've changed this where from now It won't be resetting dailyCount Attr.
	userToReset.limits.lastReelReset = newResetEpoch;
	userToReset.markModified('limits');
	const resp = await userToReset.save();
	if (resp) {
		return {
			success: true,
			message: 'Daily limits reset successfully',
		};
	}
};

export const resetPlan = async (id) => {
	const userToReset = await User.findById(id);
	if (!userToReset) {
		throw new Error('User not found');
	}
	const newResetEpoch = addToEpoch(1);
	userToReset.plan = {
		planName: 'Free',
		planPurchaseDate: null,
		planExpiry: null,
		planPrice: 0,
		isExtensionEnabled: false,
		extensionUsernames: [],
		maxUsernames: 1,
		creditsPerScan: 10,
	};
	userToReset.markModified('plan');
	userToReset.markModified('limits');
	const newRes = await userToReset.save();

	const resp = await User.updateOne(
		{ _id: userToReset._id },
		{
			$set: {
				'plan.planName': 'Free',
				'plan.planPurchaseDate': null,
				'plan.planExpiry': null,
				'plan.planPrice': 0,
				'plan.isExtensionEnabled': false,
				'plan.extensionUsernames': [],
				'limits.isReelTrackingEnabled': false,
				'limits.maxReelsPerDay': 0,
				'limits.maxReelsPerMonth': 0,
				'limits.lastReelReset': newResetEpoch,
				'limits.isSearchingEnabled': true,
				'limits.maxSearchPerDay': 100,
				'limits.maxSearchPerMonth': 100,
				'limits.dailySearchCount': 0,
				'limits.lastSearchReset': newResetEpoch,
				'limits.isRequestScanningEnabled': true,
				'limits.maxScanPerDay': 3,
				'limits.maxScanPerMonth': 3,
				'limits.lastScanReset': newResetEpoch,
			},
		}
	);

	return new Promise((resolve, reject) => {
		if (!newRes || !resp) {
			reject({
				success: false,
				message: 'Plan reset failed',
			});
		} else {
			resolve({
				succcess: true,
				message: 'Plan reset successfully',
			});
		}
	});
};

export const isPlanExpired = async (id) => {
	const user = await User.findById(id);
	if (!user) {
		throw new Error('User not found');
	}
	const currentEpoch = epochCurrent('ms');
	const planExpiry = user.plan.planExpiry;

	if (planExpiry === null) {
		return false;
	}
	if (planExpiry <= currentEpoch) {
		return true;
	}
	return false;
};

export const setPlan = async (
	email,
	planDetails
) => {
	const user = await User.findOne({
		email: email,
	});
	if (!user) {
		throw new Error('User not found');
	}
	const {
		planPrice,
		isExtensionEnabled,
		planName,
		extensionUsernames,
		planPurchaseDate,
	} = planDetails;

	const currentEpoch = planPurchaseDate;
	const planExpiry = modifyAddToEpoch(
		currentEpoch,
		30
	);

	if (planName == 'Professional') {
		const resp = await User.updateOne(
			{ email: email },
			{
				$set: {
					'plan.planName': planName,
					'plan.planPurchaseDate': currentEpoch,
					'plan.planExpiry': planExpiry,
					'plan.planPrice': planPrice,
					'plan.isExtensionEnabled':
						isExtensionEnabled,
					'plan.extensionUsernames':
						extensionUsernames,
					'plan.maxUsernames': 1,
					'plan.creditsPerScan': 2,
					'limits.isReelTrackingEnabled': true,
					'limits.maxReelsPerDay': 45000,
					'limits.maxReelsPerMonth': 45000,
					'limits.lastReelReset': currentEpoch,
					'limits.isSearchingEnabled': true,
					'limits.maxSearchPerDay': 1000,
					'limits.maxSearchPerMonth': 1000,
					'limits.dailySearchCount': 0,
					'limits.lastSearchReset': currentEpoch,
					'limits.isRequestScanningEnabled': true,
					'limits.maxScanPerDay': 199,
					'limits.maxScanPerMonth': 199,
					'limits.dailyScanCount': 0,
					'limits.lastScanReset': currentEpoch,
				},
			}
		);
		if (!resp) {
			throw new Error('Plan update failed');
		} else {
			return {
				success: true,
				message: 'Plan updated successfully',
			};
		}
	}
	if (planName == 'Individual') {
		const resp = await User.updateOne(
			{ email: email },
			{
				$set: {
					'plan.planName': planName,
					'plan.planPurchaseDate': currentEpoch,
					'plan.planExpiry': planExpiry,
					'plan.planPrice': planPrice,
					'plan.isExtensionEnabled': false,
					'plan.extensionUsernames': [],
					'plan.maxUsernames': 0,
					'plan.creditsPerScan': 5,
					'limits.isReelTrackingEnabled': true,
					'limits.maxReelsPerDay': 10000,
					'limits.maxReelsPerMonth': 10000,
					'limits.lastReelReset': currentEpoch,
					'limits.isSearchingEnabled': true,
					'limits.maxSearchPerDay': 450,
					'limits.maxSearchPerMonth': 450,
					'limits.dailySearchCount': 0,
					'limits.lastSearchReset': currentEpoch,
					'limits.isRequestScanningEnabled': true,
					'limits.maxScanPerDay': 50,
					'limits.maxScanPerMonth': 50,
					'limits.dailyScanCount': 0,
					'limits.lastScanReset': currentEpoch,
				},
			}
		);
		if (!resp) {
			throw new Error('Plan update failed');
		} else {
			return {
				success: true,
				message: 'Plan updated successfully',
			};
		}
	} else if (planName == 'Free') {
		const resp = await User.updateOne(
			{ email: email },
			{
				$set: {
					'plan.planName': planName,
					'plan.planPurchaseDate': null,
					'plan.planExpiry': null,
					'plan.planPrice': 0,
					'plan.creditsPerScan': 10,
					'plan.isExtensionEnabled': false,
					'plan.extensionUsernames': [],
					'plan.maxUsernames': 0,
					'limits.isReelTrackingEnabled': false,
					'limits.maxReelsPerDay': 0,
					'limits.maxReelsPerMonth': 0,
					'limits.lastReelReset': currentEpoch,
					'limits.isSearchingEnabled': true,
					'limits.maxSearchPerDay': 100,
					'limits.maxSearchPerMonth': 100,
					'limits.dailySearchCount': 0,
					'limits.lastSearchReset': currentEpoch,
					'limits.isRequestScanningEnabled': true,
					'limits.maxScanPerDay': 3,
					'limits.maxScanPerMonth': 3,
					'limits.dailyScanCount': 0,
					'limits.lastScanReset': currentEpoch,
				},
			}
		);
		if (!resp) {
			throw new Error('Plan update failed');
		} else {
			return {
				success: true,
				message: 'Plan updated successfully',
			};
		}
	}
};

export const isResetRequired = async (id) => {
	const user = await User.findById(id);
	if (!user) {
		throw new Error('User not found');
	}
	const currentEpoch = epochCurrent('ms');
	const lastScanReset = user.limits.lastScanReset;
	const lastReelReset = user.limits.lastReelReset;

	if (
		currentEpoch > lastScanReset ||
		currentEpoch > lastReelReset
	) {
		console.log('Reset required');
		return {
			success: true,
			message: 'Reset required',
		};
	}
	return {
		success: false,
		message: 'Reset not required',
	};
};

export const performLimitReset = async (
	req,
	res,
	next
) => {
	const id = req.userId;
	const resetStatus = await isResetRequired(id);
	if (resetStatus.success) {
		const resp = await resetDailyLimits(id);
		if (resp) {
			console.log('Limits reset successfully');
		}
	}
	next();
};

export const perFormPlanReset = async (
	req,
	res,
	next
) => {
	const token = req.userId;
	const is_Plan_Expired =
		await isPlanExpired(token);
	if (is_Plan_Expired) {
		const resp = await resetPlan(token);
		if (resp.success) {
			console.log('Plan reset successfully');
		}
	}
	next();
};

export const isScanningAllowed = async (id) => {
	const user = await User.findById(id);
	if (!user) {
		throw new Error('User not found');
	}
	if (!user.limits.isRequestScanningEnabled) {
		return {
			success: false,
			message: 'Scanning is disabled',
		};
	}
	return {
		success: true,
		message: 'Scan allowed',
		credits: user.credits,
		planName: user.plan.planName,
	};

	// const dailyScanCount =
	// 	user.limits.dailyScanCount;
	// const maxScanPerDay = user.limits.maxScanPerDay;
	// const maxScanPerMonth =
	// 	user.limits.maxScanPerMonth;
	// if (
	// 	dailyScanCount >= maxScanPerDay &&
	// 	maxScanPerDay != maxScanPerMonth
	// ) {
	// 	return {
	// 		success: false,
	// 		message: 'Daily scan limit exceeded',
	// 	};
	// }

	// if (
	// 	dailyScanCount >= maxScanPerDay &&
	// 	maxScanPerDay == maxScanPerMonth
	// ) {
	// 	return {
	// 		success: false,
	// 		message: 'Monthly scan limit exceeded',
	// 	};
	// }
};
