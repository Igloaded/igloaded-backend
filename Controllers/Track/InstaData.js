import axios from 'axios';
import { vars } from '../../secrets.js';
import {
	RemoveCors,
	deleteThumbnail,
	removeExcelFile,
} from '../RemoveCors/Cloudinaryfunc.js';
import { InstaScript } from './InstaScraper.js';
import TrackReel from '../../Models/trackReelModel.js';
import User from '../../Models/userModel.js';
import { epochCurrent } from '../../Reusables/getTimestamp.js';
import { isImageAvailable } from '../RemoveCors/Cloudinaryfunc.js';
import { fetchReelData } from './Commonfile.js';

export const getReelMetadata = async (
	shortcode
) => {
	const options = {
		method: 'GET',
		url: `https://apiprofi.com/api/post_info/?shortcode=${shortcode}`,
		headers: {
			Authorization: `Bearer ${vars.apiprofiToken}`,
		},
	};
	try {
		const response = await axios.request(options);
		console.log(response.data);
		return response.data;
	} catch (error) {
		if (
			error.response.data.message ==
			'This object was not found'
		) {
			return {
				status: 400,
				message: 'No reel found',
			};
		} else if (
			error.response.data.message == 'Page not found'
		) {
			return {
				status: 400,
				message: 'No reel found',
			};
		} else {
			console.log(error);
			return {
				status: 400,
				message: error,
			};
		}
	}
};

const getStoryData = async (username) => {
	const url = `https://www.instagram.com/stories/${username}/`;
	const data = await InstaScript(url);
	if (!data.error) {
		return data;
	} else {
		return {
			status: 'error',
			message: data.error,
		};
	}
};

const getProfileMetadata = async (shortcode) => {
	const options = {
		method: 'GET',
		url: `https://apiprofi.com/api/info_username/?user=${shortcode}`,
		headers: {
			Authorization: `Bearer ${vars.apiprofiToken}`,
		},
	};

	try {
		const response = await axios.request(options);
		console.log(response.data.user);
		return response.data.user;
	} catch (error) {
		console.error(error);
		return error;
	}
};

export const getReelData = async (req, res) => {
	const { shortcode } = req.query;
	const queryurl = `https://www.instagram.com/p/${shortcode}`;
	try {
		const urlData = [];
		const reelData =
			await getReelMetadata(shortcode);
		if (reelData.message == 'Page not found') {
			return res.status(400).json({
				status: 400,
				message: 'No reel found',
			});
		}
		if (reelData.status == 400) {
			return res.status(400).json({
				status: 400,
				message: 'No reel found',
			});
		}
		const urls = await InstaScript(queryurl);
		urlData.push(urls);
		let flag = false;
		var {
			taken_at_timestamp,
			__typename,
			edge_media_to_caption,
			edge_media_to_comment,
			owner,
			edge_media_preview_like,
		} = reelData;
		console.log(reelData);
		var like_count = edge_media_preview_like.count;
		var comment_count = edge_media_to_comment.count;
		var captionText =
			edge_media_to_caption?.edges[0]?.node?.text;
		var { full_name, username, profile_pic_url } =
			owner;

		let profilePic;
		if (profile_pic_url != undefined) {
			try {
				let result = await isImageAvailable(username);
				console.log(result);
				if (result.status == 'ok') {
					profilePic = result.url;
				} else {
					throw new Error('Image not available');
				}
			} catch (error) {
				console.log(error);
				if (error.status === 'error') {
					try {
						let result = await RemoveCors(
							profile_pic_url,
							username
						);
						profilePic = result.secure_url;
					} catch (error) {
						console.error(error);
					}
				}
			}
		}
		let PostData = [];
		let info = {
			type: '',
			shortcode: '',
			video: '',
			thumbnail: '',
			isVideo: false,
			video_play_count: 0,
			video_view_count: 0,
			tagged_users: [],
		};

		if (reelData.__typename != 'GraphSidecar') {
			var {
				video_view_count,
				video_play_count,
				taken_at_timestamp,
				edge_media_preview_like,
				edge_media_to_comment,
				__typename,
				edge_media_to_caption,
				owner,
				edge_media_to_tagged_user,
			} = reelData;

			var captionText =
				edge_media_to_caption?.edges[0]?.node?.text;
			var { full_name, username, is_verified } =
				owner;

			let taggedUser = [];

			if (
				edge_media_to_tagged_user.edges.length > 0
			) {
				taggedUser =
					edge_media_to_tagged_user.edges.map(
						(item) => {
							return item.node.user.username;
						}
					);
			}

			if (__typename == 'GraphImage') {
				info.type = 'GraphImage';
				info.isVideo = false;
				info.video = null;
				info.thumbnail = urlData[0][0].thumbnail;
				info.shortcode = shortcode;
				info.video_play_count = null;
				info.video_view_count = null;
				info.tagged_users = taggedUser;
			}

			if (__typename == 'GraphVideo') {
				info.type = 'GraphVideo';
				info.isVideo = true;
				info.video = urlData[0][0].video;
				info.thumbnail = urlData[0][0].thumbnail;
				info.shortcode = shortcode;
				info.video_play_count = video_play_count;
				info.video_view_count = video_view_count;
				info.tagged_users = taggedUser;
			}
			PostData.push(info);
		} else {
			flag = true;
			// for (
			// 	let i = 0;
			// 	i <
			// 	reelData.data.graphql.shortcode_media
			// 		.edge_sidecar_to_children.edges.length;
			// 	i++
			// ) {
			// 	var {
			// 		video_view_count,
			// 		video_play_count,
			// 		__typename,
			// 		shortcode,
			// 		is_video,
			// 	} =
			// 		reelData.data.graphql.shortcode_media
			// 			.edge_sidecar_to_children.edges[i].node;

			// 	if (__typename == 'GraphVideo') {
			// 		info.type = 'GraphVideo';
			// 		info.isVideo = is_video;
			// 		info.video = urlData[i].download_link;
			// 		info.thumbnail = urlData[i].thumbnail_link;
			// 		info.shortcode = shortcode;
			// 		info.video_play_count = video_play_count;
			// 		info.video_view_count = video_view_count;
			// 	} else {
			// 		info.type = 'GraphImage';
			// 		info.isVideo = is_video;
			// 		info.video = null;
			// 		info.thumbnail = urlData[i].thumbnail_link;
			// 		info.shortcode = shortcode;
			// 		info.video_play_count = null;
			// 		info.video_view_count = null;
			// 	}
			// 	PostData.push(info);
			// }
		}
		if (flag) {
			return res.status(200).json({
				status: 200,
				success: false,
				message:
					"Couldn't fetch data of Carousel Post",
				data: {},
			});
		}
		res.status(200).json({
			status: 200,
			success: true,
			message: 'Data fetched successfully',
			data: {
				profilePic: profilePic,
				taken_at: taken_at_timestamp,
				code: shortcode,
				type: __typename,
				like_count,
				comment_count,
				full_name,
				is_verified,
				username,
				captionText,
				PostData,
			},
		});
	} catch (error) {
		res.status(400).json({
			status: 400,
			error: error,
		});
		console.log(error);
		console.log('Error');
	}
};

export const getProfileData = async (
	req,
	res
) => {
	const { username } = req.query;
	if (!username) {
		res.status(400).json({
			status: 400,
			message: 'No username provided',
		});
	}
	const response =
		await getProfileMetadata(username);

	if (!response) {
		return res.status(400).json({
			status: 400,
			message: 'No user found',
		});
	}

	if (response.message == 'Page not found') {
		return res.status(400).json({
			status: 400,
			message: 'No user found',
		});
	}

	if (response.message == 'Page not found') {
		return res.status(400).json({
			status: 400,
			message: 'No user found',
		});
	}

	if (
		response.error_code ==
		'IgExactUserNotFoundError'
	) {
		return res.status(400).json({
			status: 400,
			message: 'No user found',
		});
	}

	if (response.error_code == 'ERR_BAD_RESPONSE') {
		return res.status(400).json({
			status: 400,
			message: 'No user found',
		});
	}

	let {
		biography,
		full_name,
		pk,
		is_verified,
		is_private,
		follower_count,
		following_count,
		media_count,
		bio_links,
		profile_pic_url,
	} = response;

	let profile_pic;
	for (let i = 0; i < bio_links.length; i++) {
		bio_links[i].id = i;
	}

	if (profile_pic_url != undefined) {
		try {
			let result = await isImageAvailable(username);
			if (result.status == 'ok') {
				profile_pic = result.url;
			} else {
				throw new Error('Image not available');
			}
		} catch (error) {
			if (error.status === 'error') {
				try {
					let result = await RemoveCors(
						profile_pic_url,
						username
					);
					profile_pic = result.secure_url;
				} catch (error) {
					console.error(error);
				}
			}
		}
	}

	res.status(200).json({
		status: 200,
		data: {
			full_name,
			username,
			pk,
			biography,
			is_verified,
			is_private,
			follower_count,
			following_count,
			media_count,
			bio_links,
			profile_pic,
		},
	});
};

export const getStory = async (req, res) => {
	const { username } = req.query;
	if (!username) {
		return res.status(400).json({
			status: 400,
			message: 'No username provided',
		});
	}
	const response =
		await getProfileMetadata(username);
	if (!response) {
		return res.status(400).json({
			status: 400,
			message: 'No user found',
		});
	}
	if (
		response.error_code ==
		'IgExactUserNotFoundError'
	) {
		return res.status(400).json({
			status: 400,
			message: 'No user found',
		});
	}

	const {
		full_name,
		is_verified,
		profile_pic_url,
	} = response;

	if (response.is_private) {
		return res.status(400).json({
			status: 400,
			message: 'User is private',
		});
	}
	const storyData = await getStoryData(username);

	if (storyData.error) {
		return res.status(400).json({
			status: 400,
			message: storyData.error,
		});
	}

	let dataArray = [];
	let dataObject = {};

	let profile_pic;

	if (profile_pic_url != undefined) {
		try {
			let result = await isImageAvailable(username);
			if (result.status == 'ok') {
				profile_pic = result.url;
			} else {
				throw new Error('Image not available');
			}
		} catch (error) {
			if (error.status === 'error') {
				try {
					let result = await RemoveCors(
						profile_pic_url,
						username
					);
					profile_pic = result.secure_url;
				} catch (error) {
					console.error(error);
				}
			}
		}
	}

	for (let i = 0; i < storyData.length; i++) {
		dataObject = {
			id: i,
			thumbnail: storyData[i].thumbnail,
			video: storyData[i].video,
		};
		dataArray.push(dataObject);
	}

	res.status(200).json({
		data: {
			username,
			profile_pic,
			full_name,
			is_verified,
			story: dataArray,
		},
	});
};

export const removeReel = async (req, res) => {
	const { uniqueId, email } = req.body;
	const token = req.userId;

	if (!uniqueId || !email) {
		return res.status(400).json({
			status: 400,
			message: 'Please recheck request body fields',
		});
	}

	let userData = await User.findById(token);
	if (userData && userData.email != email) {
		return res.status(400).json({
			status: 400,
			message: 'Token and email account not matched',
		});
	}

	if (userData) {
		const reel = await TrackReel.find({
			userEmail: email,
			id: uniqueId,
		});

		console.log(reel);

		if (reel.length == 0) {
			return res.status(400).json({
				status: 400,
				message: 'Batch not found',
			});
		}

		deleteThumbnail(reel[0].thumbnail)
			.then((res) => {
				if (res.status == 200) {
					console.log(
						`${reel[0].title} Thumbnail Deleted`
					);
				}
			})
			.catch((err) => {
				console.log(
					`${reel[0].title} - Error deleting this thumbnail`
				);
			});

		removeExcelFile(reel[0].fileUrl)
			.then((res) => {
				if (res.status == 200) {
					console.log(
						`${reel[0].title} Excel File Deleted`
					);
				}
			})
			.catch((err) => {
				console.log(
					`${reel[0].title} - Error deleting this excel file`
				);
				console.log(err);
			});

		TrackReel.deleteOne({
			userEmail: email,
			id: uniqueId,
		})
			.then((data) => {
				return res.status(200).json({
					status: 200,
					message: 'Batch removed successfully',
				});
			})
			.catch((error) => {
				console.error(error);
				return res.status(400).json({
					status: 400,
					message: 'Error removing Batch',
				});
			});
	}
};

export const trackreels = async (req, res) => {
	const { email, title } = req.body;
	const { filename, originalname } = req.file;

	if (!filename || !email) {
		return res.status(400).json({
			status: 400,
			message: 'Please recheck request body fields',
		});
	}

	const currentTime = epochCurrent('ms');

	TrackReel.create({
		id: currentTime,
		userEmail: email,
		title: title,
		thumbnail:
			'https://res.cloudinary.com/dgbqsbo7g/image/upload/v1711522015/StaticAssests/loading_i8aaxn.gif',
		totalIterations: 0,
		iterationsCompleted: 0,
		dateCreated: currentTime,
		status: 'pending',
		debugLog: 'null',
		fileUrl: 'null',
	})
		.then((data) => {
			console.log(
				`File ${originalname} uploaded successfully`
			);
			setImmediate(() => {
				fetchReelData(filename, email, currentTime)
					.then((data) => {
						console.log(
							'Data fetched successfully:',
							data
						);
					})
					.catch((error) => {
						console.error(
							'Error fetching data:',
							error
						);
					});
			});
		})
		.catch((error) => {
			console.error(
				`Error uploading reel ${originalname}: ${error}`
			);
		});

	res.status(200).json({
		status: 200,
		message: `Fetching Scheduled Successfully for ${originalname}`,
	});
};
