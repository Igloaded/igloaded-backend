import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import xlsx from 'xlsx';
import { getReelMetadata } from './InstaData.js';
import {
	epochCurrent,
	epochToDate,
	epochToDateLocale,
} from '../../Reusables/getTimestamp.js';
import User from '../../Models/userModel.js';
import TrackReel from '../../Models/trackReelModel.js';
import {
	RemoveCors,
	uploadExcel,
} from '../RemoveCors/Cloudinaryfunc.js';
import { sendReelCompleteMail } from '../SendEmail/sendEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const validateUrl = (URL) => {
	if (URL != '') {
		var regex =
			/(?:https?:\/\/)?(?:www.)?instagram.com\/?([a-zA-Z0-9\.\_\-]+)?\/([p]+)?([reel]+)?([tv]+)?([stories]+)?\/([a-zA-Z0-9\-\_\.]+)\/?([0-9]+)?/gm;
		const str = URL;
		let m;
		while ((m = regex.exec(str)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			if (m[2] == 'p' && m[1] == undefined) {
				return m[6];
			} else if (
				(m[3] == 'reel' || m[3] == 'reels') &&
				m[1] == undefined
			) {
				return m[6];
			} else {
				console.log('Invalid URL (2)');
				return null;
			}
		}
	} else {
		console.log('Invalid URL (1)');
	}
};

export const fetchReelData = async (
	filename,
	email,
	uniqueId
) => {
	try {
		const filePath = path.join(
			__dirname,
			'..',
			'..',
			'Uploads',
			filename
		);

		if (!fs.existsSync(filePath)) {
			console.error(
				`File does not exist: ${filePath}`
			);
			return;
		}

		const data = fs.readFileSync(filePath, 'utf8');
		const urls = data.split('\n');

		const updateReel = await TrackReel.findOne({
			id: uniqueId,
		});
		updateReel.totalIterations = urls.length;
		await updateReel.save();

		const user = await User.findOne({
			email: email,
		});

		user.activity.reels =
			user.activity.reels + urls.length;
		user.limits.dailyReelCount =
			user.limits.dailyReelCount + urls.length;
		await user.save();

		const workbook = xlsx.utils.book_new();
		const worksheetData = [
			[
				'Username',
				'Upload Date',
				'Post Url',
				'Views',
				'Plays',
				'Likes',
				'Comment',
				'Date Checked',
			],
		];

		let isThumbnailSaved = false;

		for (const url of urls) {
			const shortcode = validateUrl(url);

			let views,
				plays,
				likes,
				comments,
				username,
				dateUploaded,
				uploadDate,
				dateChecked;

			if (shortcode == null) {
				console.log('Invalid URL');
				return;
			}

			await new Promise((resolve) =>
				setTimeout(resolve, 1000)
			);

			const response =
				await getReelMetadata(shortcode);

			if (
				response.message == 'Page not found' ||
				response.message ==
					'This object was not found' ||
				response.message ==
					'This media has been deleted' ||
				response.message == 'No reel found'
			) {
				username = 'failed';
				dateUploaded = 'failed';
				uploadDate = 'failed';
				views = 0;
				likes = 0;
				plays = 0;
				comments = 0;
				dateChecked = epochToDateLocale(
					epochCurrent('ms'),
					'ms'
				);
				worksheetData.push([
					username,
					uploadDate,
					url,
					views,
					plays,
					likes,
					comments,
					dateChecked,
				]);
			} else {
				if (!isThumbnailSaved) {
					const updateThumbnail =
						await TrackReel.findOne({
							id: uniqueId,
						});
					RemoveCors(
						response.display_url,
						`${uniqueId}-${shortcode}`
					)
						.then(async (result) => {
							updateThumbnail.thumbnail =
								result.secure_url;
							await updateThumbnail.save();
						})
						.catch((error) => {
							console.error(
								`Failed to process file: ${error}`
							);
						});
					isThumbnailSaved = true;
				}
				username = response.owner.username;
				dateUploaded = response.taken_at_timestamp;
				uploadDate = epochToDate(dateUploaded, 's');
				views = response.video_view_count;
				likes =
					response.edge_media_preview_like?.count ||
					'Hidden';
				plays = response.video_play_count;
				comments =
					response.edge_media_to_comment?.count ||
					'Hidden';
				dateChecked = epochToDateLocale(
					epochCurrent('ms'),
					'ms'
				);
				worksheetData.push([
					username,
					uploadDate,
					url,
					views,
					plays,
					likes,
					comments,
					dateChecked,
				]);
			}
			const updateReel = await TrackReel.findOne({
				id: uniqueId,
			});
			updateReel.iterationsCompleted =
				updateReel.iterationsCompleted + 1;
			await updateReel.save();
		}
		const worksheet = xlsx.utils.aoa_to_sheet(
			worksheetData
		);
		xlsx.utils.book_append_sheet(
			workbook,
			worksheet,
			'Sheet 1'
		);
		xlsx.writeFile(
			workbook,
			path.join(
				__dirname,
				'..',
				'..',
				'Xlxs',
				`${uniqueId}.xlsx`
			)
		);

		const addXlsx = path.join(
			__dirname,
			'..',
			'..',
			'Xlxs',
			`${uniqueId}.xlsx`
		);

		uploadExcel(addXlsx)
			.then(async (result) => {
				const addXlsxUrl = await TrackReel.findOne({
					id: uniqueId,
				});
				addXlsxUrl.fileUrl = result.secure_url;
				addXlsxUrl.status = 'completed';
				await addXlsxUrl.save();
				fs.unlinkSync(filePath);
				fs.unlinkSync(addXlsx);
				console.log(
					'Excel File processed successfully'
				);

				sendReelCompleteMail({
					email,
					title: uniqueId,
					spreadSheetLink: result.secure_url,
				})
					.then((response) => {
						console.log(
							'Batch Completed Mail sent to user'
						);
					})
					.catch((error) => {
						console.error(
							`Failed to send completed mail: ${error}`
						);
					});
			})
			.catch((error) => {
				console.error(
					`Failed to upload excel file to cloudinary: ${error}`
				);
			});
	} catch (error) {
		console.error(
			`Failed to process file: ${error}`
		);
	}
};
