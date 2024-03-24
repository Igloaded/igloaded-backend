import mailgun from 'mailgun-js';
import { vars } from '../../secrets.js';
import {
	epochCurrent,
	epochToDate,
} from '../../Reusables/getTimestamp.js';
import bcrypt from 'bcryptjs';

const apiKey = vars.apiMailgun;
const DOMAIN = 'mail.igloaded.com';

const mg = mailgun({
	apiKey: apiKey,
	domain: DOMAIN,
});

export const sendMail = (req, res) => {
	const { email } = req.body;
	const otp = Math.random().toString().slice(-4);
	const encryptedOtp = bcrypt.hashSync(otp, 10);
	const timeSent = epochCurrent('ms');
	const data = {
		from: 'IGLoaded <postmaster@mail.igloaded.com>',
		to: email,
		subject: 'OTP From IGLOADED',
		template: 'OTP Template',
		'h:X-Mailgun-Variables': JSON.stringify({
			OTP: otp,
		}),
	};

	mg.messages().send(data, function (error, body) {
		if (error) {
			return res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in sending mail',
				error,
			});
		}
		res.status(200).json({
			status: 'ok',
			message: 'OTP sent successfully',
			otpvalue: encryptedOtp,
			timestamp: timeSent,
			body,
		});
	});
};

export const sendMailTest = (req, res) => {
	const { email } = req.body;
	const otp = Math.random().toString().slice(-4);
	const encryptedOtp = bcrypt.hashSync(otp, 10);
	const timeSent = epochCurrent('ms');
	const data = {
		from: 'IGLoaded <postmaster@mail.igloaded.com>',
		to: email,
		subject: 'OTP From IGLOADED',
		template: 'OTP Template',
		'h:X-Mailgun-Variables': JSON.stringify({
			OTP: otp,
		}),
	};

	mg.messages().send(data, function (error, body) {
		if (error) {
			return res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in sending mail',
				error,
			});
		}
		res.status(200).json({
			status: 'ok',
			otpvalue: encryptedOtp,
			timestamp: timeSent,
			message: 'OTP sent successfully',
			body,
		});
	});
};

export const sendContactEmail = (req, res) => {
	const { email, subject, message, datetime } =
		req.body;
	if (
		!email ||
		!subject ||
		!message ||
		!datetime
	) {
		return res.status(400).json({
			status: 'error',
			message: 'All fields are required',
		});
	}
	const data = {
		from: 'IGLoaded <postmaster@mail.igloaded.com>',
		to: 'contact@igloaded.com',
		subject: 'New Contact request from IGLOADED',
		template: 'Contact Notification',
		'h:X-Mailgun-Variables': JSON.stringify({
			email: email,
			subject: subject,
			message: message,
			datetime: datetime,
		}),
	};

	mg.messages().send(data, function (error, body) {
		if (error) {
			return res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in sending mail',
				error,
			});
		}
		res.status(200).json({
			status: 'ok',
			message: 'Contact form submitted successfully',
			body,
		});
	});
};

export const sendHelpEmail = async (req, res) => {
	const {
		email,
		subject,
		message,
		datetime,
		type,
	} = req.body;
	console.log(req);
	if (
		!email ||
		!subject ||
		!message ||
		!datetime ||
		!type
	) {
		return res.status(400).json({
			status: 'error',
			message: 'All fields are required',
		});
	}
	const dateTime = epochToDate(datetime, 'ms');
	console.log(req.body);
	const data = {
		from: 'IGLoaded <postmaster@mail.igloaded.com>',
		to: 'singhaditya1826@gmail.com',
		subject:
			'New Help Form submitted from IGLOADED',
		template: 'help form',
		'h:X-Mailgun-Variables': JSON.stringify({
			datetime: dateTime,
			email: email,
			message: message,
			title: subject,
			type: type,
		}),
	};

	mg.messages().send(data, function (error, body) {
		if (error) {
			return res.status(500).json({
				status: 'error',
				message:
					'Something went wrong in sending mail',
				error,
			});
		}
		res.status(200).json({
			status: 'ok',
			message: 'Contact form submitted successfully',
			body,
		});
	});
};

export const sendWelcomeMail = (
	email,
	firstName
) => {
	return new Promise((resolve, reject) => {
		if (!email || !firstName) {
			reject({
				status: 400,
				message: 'All fields are required',
			});
		}
		const data = {
			from:
				'IGLoaded <postmaster@mail.igloaded.com>',
			to: email,
			subject: 'Welcome To IGLoaded!',
			template: 'welcome',
			'h:X-Mailgun-Variables': JSON.stringify({
				email: email,
				firstName: firstName,
			}),
		};

		mg
			.messages()
			.send(data, function (error, body) {
				if (error) {
					console.log(error);
					reject({
						status: 'error',
						message:
							'Something went wrong in sending mail',
						error,
					});
				}
				console.log(body);
				resolve({
					status: 200,
					message: 'Welcome mail sent successfully',
					body,
				});
			});
	});
};

export const passwordChangedMail = (
	email,
	firstName
) => {
	return new Promise((resolve, reject) => {
		if (!email || !firstName) {
			reject({
				status: 400,
				message: 'All fields are required',
			});
		}

		const data = {
			from:
				'IGLoaded <postmaster@mail.igloaded.com>',
			to: email,
			subject: 'Account Password Changed!',
			template: 'password changed notification',
		};

		mg
			.messages()
			.send(data, function (error, body) {
				if (error) {
					console.log(error);
					reject({
						status: 'error',
						message:
							'Something went wrong in sending mail',
						error,
					});
				}
				console.log(body);
				resolve({
					status: 200,
					message: 'Welcome mail sent successfully',
					body,
				});
			});
	});
};

export const billingInvoice = (Billdata) => {
	return new Promise((resolve, reject) => {
		const data = {
			from:
				'IGLoaded <postmaster@mail.igloaded.com>',
			to: Billdata.customerEmail,
			subject: 'New Transaction Processed',
			template: 'billing invoice',
			attachment: Billdata.billBuffer,
			'h:X-Mailgun-Variables': JSON.stringify({
				amount: Billdata.total,
				date: Billdata.date,
				description: Billdata.purchaseDescription,
				name: Billdata.customerName,
				title: Billdata.purchaseTitle,
			}),
		};

		mg
			.messages()
			.send(data, function (error, body) {
				if (error) {
					console.log(error);
					reject({
						status: 'error',
						message:
							'Something went wrong in sending mail',
						error,
					});
				}
				console.log(body);
				resolve({
					status: 200,
					message:
						'Billing Receipt mail sent successfully',
					body,
				});
			});
	});
};

export const sendReelCompleteMail = (
	reelData
) => {
	const { email, title, spreadSheetLink } =
		reelData;

	const data = {
		from: 'IGLoaded <postmaster@mail.igloaded.com>',
		to: email,
		subject: 'Batch Tracking Completed',
		template: 'reel completed notification',
		'h:X-Mailgun-Variables': JSON.stringify({
			reelThumbnail: null,
			reelTitle: title,
			spreadsheetUrl: spreadSheetLink,
		}),
	};
	return new Promise((resolve, reject) => {
		mg
			.messages()
			.send(data, function (error, body) {
				if (error) {
					reject({
						status: 400,
						message:
							'Something went wrong in sending mail',
						error,
					});
				}
				resolve({
					status: 200,
					message:
						'Reel completed mail sent successfully',
					body,
				});
			});
	});
};
