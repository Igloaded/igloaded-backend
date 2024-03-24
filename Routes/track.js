import express from 'express';
import multer from 'multer';

import {
	loginUser,
	logout,
	checkLogin,
	checkRequest,
} from '../Controllers/Track/InstaAuthentication.js';

import { limitTrackRequest } from '../Middlewares/Ratelimit.js';

import {
	getReelData,
	getProfileData,
	getStory,
	removeReel,
	trackreels,
} from '../Controllers/Track/InstaData.js';

import {
	checkSearchLimit,
	checkBlocked,
} from '../Middlewares/Users.js';

import { RemoveCors } from '../Controllers/RemoveCors/Cloudinaryfunc.js';

import {
	performLimitReset,
	perFormPlanReset,
} from '../Controllers/Users/userUtils.js';

import {
	RemoveImages,
	deleteSingleImage,
} from '../Controllers/Cronjobs/RemoveImages.js';
import { epochCurrent } from '../Reusables/getTimestamp.js';

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'Uploads/');
	},
	filename: (req, file, cb) => {
		cb(
			null,
			file.fieldname +
				'' +
				epochCurrent('ms') +
				'' +
				file.originalname
		);
	},
});

const upload = multer({
	storage: storage,
}).single('txtfile');

router.delete('/remove/allimages', RemoveImages);
router.delete('/remove/image', deleteSingleImage);

router.use(checkBlocked);
router.use(limitTrackRequest);
router.get('/removecors', RemoveCors);

router.use(perFormPlanReset);
router.use(performLimitReset);

router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/checklogin', checkLogin);
router.post('/checkrequest', checkRequest);
// router.post('/tracknewreel', scheduleNewReel);
router.post(
	'/reels/trackall',
	upload,
	trackreels
);
router.use(limitTrackRequest);
router.get(
	'/getreeldata',
	checkSearchLimit,
	getReelData
);
router.get(
	'/getstory',
	checkSearchLimit,
	getStory
);
router.get(
	'/getprofiledata',
	checkSearchLimit,
	getProfileData
);

export default router;
