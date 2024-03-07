import {
	createUser,
	getUser,
	getUsers,
	loginUser,
	forgetPassword,
	deleteUser,
	findUser,
	updateUser,
	changePassword,
	getUsage,
	getPlanDetails,
	addTransaction,
	verifyMail,
	getTransaction,
	getTrackedReels,
	checkPromoCode,
	applyPromoCode,
	addPromocode,
	addUsername,
	removeUsername,
} from '../Controllers/Users/user.js';
import {
	limiter,
	limitOTP,
	limitTrackRequest,
} from '../Middlewares/Ratelimit.js';
import { handlePaymentValidation } from '../Middlewares/Payment.middleware.js';
import {
	isAdmin,
	Auth,
	formatRequest,
	checkBlocked,
} from '../Middlewares/Users.js';
import {
	sendMail,
	sendContactEmail,
	sendHelpEmail,
} from '../Controllers/SendEmail/sendEmail.js';
import {
	performLimitReset,
	perFormPlanReset,
} from '../Controllers/Users/userUtils.js';
import { removeReel } from '../Controllers/Track/InstaData.js';
import {
	verifyPayment,
	createPayment,
} from '../Controllers/Billing/Payment.js';
import express from 'express';

const router = express.Router();

router.use(formatRequest);
router.use(limiter);

router.post('/login', loginUser);
router.post('/contact/form', sendContactEmail);
router.post('/register', createUser);
router.patch('/forgetpassword', forgetPassword);
router.get('/userExist', findUser);
router.post('/requestotp', sendMail);
router.post('/verifymail', verifyMail);

router.patch('/update', updateUser);
router.get('/getusers', isAdmin, getUsers);
router.delete(
	'/delete/:email',
	isAdmin,
	deleteUser
);

router.use(checkBlocked);
router.use(perFormPlanReset);
router.use(performLimitReset);
router.get('/getplan', getPlanDetails);
router.patch('/changepassword', changePassword);
router.patch('/username/add', addUsername);
router.patch('/username/remove', removeUsername);
router.post('/transaction', getTransaction);
router.post('/promocode/check', checkPromoCode);
router.post('/promocode/apply', applyPromoCode);
router.post('/promocode/create', addPromocode);
router.post('/getreels', getTrackedReels);
router.post('/removereel', removeReel);
router.post('/addtransaction', addTransaction);
router.post(
	'/payment/initiate',
	handlePaymentValidation,
	createPayment
);
router.post(
	'/payment/payment-verify',
	verifyPayment
);
router.post('/help/form', sendHelpEmail);
router.get('/usage', getUsage);
router.get('/getuser', getUser);

export default router;
