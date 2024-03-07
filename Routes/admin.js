import express from 'express';
import {
	isAdmin,
	formatRequest,
	checkBlocked,
} from '../Middlewares/Users.js';
import * as adminController from '../Controllers/Admin/admin.js';
import User from '../Models/userModel.js';

const router = express.Router();

router.use(formatRequest);

// Admin Login
router.post('/login', adminController.adminLogin);

router.use(checkBlocked);
router.use(isAdmin);

// Server Check

router.get('/', (req, res) => {
	res.json({
		status: 'ok',
		message: 'Admin Route Accessible',
	});
});

// Stats Routes

router.get(
	'/get-stats',
	adminController.getStatistics
);

router.post(
	'/transactions/all',
	adminController.getAllTransactions
);

// User Routes

router.get(
	'/get-user/:email',
	adminController.getUser
);

router.post(
	'/get-all-users',
	adminController.getUsers
);

router.get(
	'/get-user-suggestions/:keyword',
	adminController.getUserSuggestion
);

router.post(
	'/modify-user',
	adminController.modifyUser
);

router.post(
	'/transaction/add',
	adminController.addUserTransaction
);

// PromoCode Routes

router.post(
	'/add-promocode',
	adminController.addPromocode
);

router.delete(
	'/delete-promocode',
	adminController.deletePromocode
);

router.post(
	'/get-promocodes',
	adminController.getPromocodes
);

//Admin Config Routes

router.get(
	'/get-server-data',
	adminController.adminConfigData
);

router.post(
	'/set-server-data',
	adminController.changeServerPlanDetails
);

router.post(
	'/transaction/get/all',
	adminController.getAllTransactions
);

router.delete(
	'/transaction/delete',
	adminController.deleteTransaction
);

export default router;
