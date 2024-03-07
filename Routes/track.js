import express from 'express';

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
	scheduleNewReel,
	UpdateSingleReel,
	removeReel,
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
// import { UpdateAllReels } from '../Controllers/Cronjobs/UpdateAllReels.js';

const router = express.Router();

router.delete('/remove/allimages', RemoveImages);
router.delete('/remove/image', deleteSingleImage);

router.use(checkBlocked);
router.use(limitTrackRequest);
router.get('/removecors', RemoveCors);
router.post(
	'/updatesinglereel',
	UpdateSingleReel
);

router.use(perFormPlanReset);
router.use(performLimitReset);

router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/checklogin', checkLogin);
router.post('/checkrequest', checkRequest);
router.post('/tracknewreel', scheduleNewReel);
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
