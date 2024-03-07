import {
	IgApiClient,
	IgLoginRequiredError,
	IgUserHasLoggedOutError,
} from 'instagram-private-api';

import { RemoveCors } from '../RemoveCors/Cloudinaryfunc.js';
import User from '../../Models/userModel.js';
import { isScanningAllowed } from '../Users/userUtils.js';
import { addTransaction } from '../Billing/Transaction.js';
import { epochCurrent } from '../../Reusables/getTimestamp.js';

const ig = new IgApiClient();

const sessions = {};

const usersLastActivity = new Map();

const checkSession = (username) => {
	return !!sessions[username];
};

const getSession = (username) => {
	return sessions[username];
};

const setSession = (username, session) => {
	sessions[username] = session;
};

const clearSession = (username) => {
	sessions[username] = null;
};

export const loginUser = async (req, res) => {
	const token = req.userId;
	const user = await User.findById(token);
	if (!user) {
		return res.status(401).json({
			status: 401,
			message: 'User not found',
		});
	}

	const { username, password, backupCode } =
		req.body;
	const isScanAllowed =
		await isScanningAllowed(token);

	if (!isScanAllowed.success) {
		return res.status(401).json({
			status: 401,
			message: isScanAllowed.message,
		});
	}

	if (checkSession(username)) {
		res.status(200).json({
			status: 200,
			message: 'Already Logged in',
			sessionExists: checkSession(username),
			username: username,
		});
	} else {
		try {
			ig.state.generateDevice(username);
			const loggedInUser = await ig.account.login(
				username,
				password,
				backupCode
			);
			const session = await ig.state.serialize();
			setSession(username, session);

			if (session) {
				updateLastActivity(username);
				res.json({
					status: 200,
					message: 'Logged in successfully',
					user: loggedInUser,
				});
			} else {
				res.status(400).json({
					status: 400,
					message: 'Error logging in',
					info: 'Error occurred while saving user',
				});
			}
		} catch (error) {
			res.status(400).json({
				status: 400,
				message: 'Error logging in',
				error: error.toString(),
			});
		}
	}
};

export const checkLogin = async (req, res) => {
	if (checkSession(username)) {
		try {
			const name =
				await ig.user.usernameinfo(username);
			res.status(200).json({
				status: 200,
				message: 'Logged in',
				sessionExists: checkSession(username),
				name: name.username,
			});
		} catch (error) {
			clearSession(username);
			const { statusCode } = error.response;
			res.status(statusCode).json({
				status: statusCode,
				sessionExists: checkSession(username),
				error: error.toString(),
			});
		}
	} else {
		res.status(401).json({
			status: 401,
			message: 'Not logged in',
			sessionExists: checkSession(username),
		});
	}
};

export const checkRequest = async (req, res) => {
	const { username } = req.body;
	const token = req.userId;
	const user = await User.findById(token);
	const isScanAllowed =
		await isScanningAllowed(token);

	if (!isScanAllowed.success) {
		return res.status(401).json({
			status: 401,
			message: isScanAllowed.message,
		});
	}
	if (
		isScanAllowed.success &&
		isScanAllowed.credits < 100
	) {
		return res.status(401).json({
			status: 401,
			message: 'Insufficient credits!',
			messageDetail:
				'Insufficient credits (less than 100)',
		});
	}
	if (checkSession(username)) {
		try {
			const session = getSession(username);
			await ig.state.deserialize(session);

			const userData =
				await ig.user.usernameinfo(username);

			let {
				full_name,
				is_verified,
				profile_pic_url,
				follower_count,
				following_count,
				media_count,
				is_private,
			} = userData;

			await RemoveCors(profile_pic_url)
				.then((res) => {
					profile_pic_url = res.secure_url;
				})
				.catch((err) => {
					console.log(err);
				});

			const pendingFollowRequestsFeed =
				ig.feed.pendingFriendships();
			const pendingFollowRequests =
				await pendingFollowRequestsFeed.items();

			user.limits.dailyScanCount += 1;
			user.activity.scans += 1;
			user.markModified('activity');
			user.markModified('limits');
			const resp = await user.save();

			const epochTime = epochCurrent('ms');

			let dataObject = {
				notifyUser: false,
				email: user.email,
				amount: 100,
				title: 'Instagram Request Check',
				description:
					'Instagram Request Check for @' + username,
				transactionType: 'debit',
				transactionData: {
					tax: 0,
					discount: 0,
					total: 100,
					price: 100,
					credits: 100,
					gatewayCharges: 0,
				},
				orderId: epochTime,
			};

			let flag = 0;

			await addTransaction(dataObject)
				.then((resp) => {
					if (resp.status == 'ok') {
						flag = 1;
					}
				})
				.catch((err) => {
					console.log(err);
				});

			if (resp && flag == 1) {
				res.status(200).json({
					status: 200,
					data: {
						username,
						full_name,
						is_verified,
						profile_pic_url,
						follower_count,
						following_count,
						media_count,
						is_private,
						request_count: pendingFollowRequests.length,
						request_list: pendingFollowRequests,
					},
				});
			} else {
				res.status(400).json({
					status: 400,
					message: 'Error checking request',
					info: 'Error occurred (Check Request Route)',
				});
			}
		} catch (error) {
			if (
				error instanceof IgLoginRequiredError ||
				error instanceof IgUserHasLoggedOutError
			) {
				clearSession(username);
				res.status(401).json({
					status: 401,
					message: 'Login Required in Ig',
					error: "You're not logged in!",
				});
			} else {
				res.status(401).json({
					message: 'Error encountered!',
					error: error.toString(),
				});
			}
		}
	} else {
		res.status(401).json({
			status: 401,
			message: 'Login Required in Ig',
			error: "You're not logged in!",
		});
	}
};

export const logout = async (req, res) => {
	const { username } = req.body;
	if (checkSession(username)) {
		try {
			clearSession(username);
			await ig.account.logout();
			if (!checkSession(username)) {
				usersLastActivity.delete(username);
				res.status(200).json({
					status: 200,
					message: 'Logged Out',
					success: true,
					sessionExists: checkSession(username),
				});
			} else {
				res.status(400).json({
					success: false,
					message: 'Error logging out',
				});
			}
		} catch (error) {
			const { statusCode } = error.response;
			res.status(statusCode).json({
				status: statusCode,
				success: false,
				message: 'Error logging out',
				error: error.toString(),
			});
		}
	} else {
		res.status(401).json({
			status: 401,
			success: false,
			message: "You're not logged in!",
		});
	}
};

export const logoutLocal = async (username) => {
	return new Promise(async (resolve, reject) => {
		if (checkSession(username)) {
			try {
				clearSession(username);
				await ig.account.logout();
				if (!checkSession(username)) {
					resolve({
						status: 200,
						message: 'Logged Out',
						success: true,
						sessionExists: checkSession(username),
					});
				} else {
					reject({
						success: false,
						message: 'Error logging out',
					});
				}
			} catch (error) {
				const { statusCode } = error.response;
				reject({
					status: statusCode,
					success: false,
					message: 'Error logging out',
					error: error.toString(),
				});
			}
		} else {
			reject({
				status: 401,
				success: false,
				message: "You're not logged in!",
			});
		}
	});
};

function updateLastActivity(username) {
	usersLastActivity.set(username, Date.now());
}

async function checkForInactivity() {
	console.log('Checking for inactivity');
	const now = Date.now();
	console.log(usersLastActivity);
	if (usersLastActivity.size > 1) {
		usersLastActivity.forEach(
			async (lastActivity, username) => {
				if (now - lastActivity > 3 * 60 * 1000) {
					// 3 mins time period
					await logoutLocal(username)
						.then((resp) => {
							console.log(resp);
							if (resp.status == 200) {
								console.log(
									`${username} Logged out due to inactivity`
								);
							}
						})
						.catch((err) => {
							console.log(err);
						});
					usersLastActivity.delete(username);
				}
			}
		);
	}
}

setInterval(checkForInactivity, 5 * 60 * 1000);
