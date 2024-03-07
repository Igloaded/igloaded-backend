import axios from 'axios';
import User from '../../Models/userModel.js';
import { vars } from '../../secrets.js';

const username = '';
const password = '';

const { rapidApiKey, rapidApiHost } = vars;

let data = {
	views: 0,
	plays: 0,
	likes: 0,
	shortCode: '',
	uploadTime: '',
	uploadedBy: '',
	thumbnailUrl: '',
};

let updatedData = {
	views: 0,
	plays: 0,
	likes: 0,
	uploadedBy: '',
	shortCode: '',
	uploadTime: '',
	checkedAt: '',
	thumbnailUrl: '',
};

const removeCORS = async (url) => {
	const options = {
		method: 'GET',
		url: 'https://instagram-scraper-2022.p.rapidapi.com/ig/noCORS/',
		params: {
			url_media: url,
		},
		headers: {
			'X-RapidAPI-Key': rapidApiKey,
			'X-RapidAPI-Host': rapidApiHost,
		},
	};

	try {
		const response = await axios.request(options);
		if (response.data.image?.shrt) {
			return response.data.image?.shrt;
		} else if (response.data.video?.shrt) {
			return response.data.video?.shrt;
		}
	} catch (error) {
		console.error(error);
	}
};

const getReelData = async (shortcode) => {
	const options = {
		method: 'GET',
		url: 'https://instagram-scraper-2022.p.rapidapi.com/ig/post_info/',
		params: {
			shortcode: shortcode,
		},
		headers: {
			'X-RapidAPI-Key': rapidApiKey,
			'X-RapidAPI-Host': rapidApiHost,
		},
	};

	try {
		const response = await axios.request(options);
		console.log(response.data);
		if (response) {
			updatedData.views =
				response.data.video_view_count;
			updatedData.plays =
				response.data.video_play_count;
			updatedData.likes =
				response.data.edge_media_preview_like?.count;
			updatedData.shortCode =
				response.data.shortcode;
			updatedData.uploadTime =
				response.data.taken_at_timestamp;
			updatedData.caption =
				response.data.edge_media_to_caption.edges[0].node.text;
			updatedData.thumbnail = await removeCORS(
				response.data.display_url
			);
			updatedData.uploadedBy = `@${response.data.owner.username}`;
			if (!response.data.comments_disabled) {
				updatedData.comments =
					response.data.edge_media_to_comment.count;
			} else {
				updatedData.comments = 0;
			}
			updatedData.checkedAt = Date.now();
			console.log(updatedData);
			return updatedData;
		}
	} catch (error) {
		console.error(error);
	}
};

const getAllData = () => {
	// Get all posts from Instagram
	// For each post, get the views and likes
	// Write the data to the spreadsheet
};

const initData = async (url) => {
	const options = {
		method: 'GET',
		url: 'https://all-in-one-api.p.rapidapi.com/instagram/media/info',
		params: {
			media_url: url,
		},
		headers: {
			'X-RapidAPI-Key': rapidApiKey,
			'X-RapidAPI-Host': rapidApiHost,
		},
	};

	try {
		const response = await axios.request(options);
		return data;
	} catch (error) {
		console.error(error);
	}
};

app.get('/info', async (req, res) => {
	const shortcode = req.query.shortcode;
	const {
		views,
		likes,
		plays,
		shortCode,
		uploadTime,
		uploadedBy,
		caption,
		comments,
		thumbnail,
	} = await getReelData(shortcode);
	res.status(200).json({
		status: 'ok',
		views,
		likes,
		plays,
		shortCode,
		uploadTime,
		uploadedBy,
		caption,
		comments,
		thumbnail,
	});
});

app.get('/checkdata', async (req, res) => {
	const shortcode = req.query.shortcode;
	const {
		views,
		likes,
		plays,
		shortCode,
		timeStamp,
		checkedAt,
		uploadedBy,
		caption,
	} = await getReelData(shortcode);
	res.status(200).json({
		status: 'ok',
		views,
		likes,
		plays,
		shortCode,
		checkedAt,
		timeStamp,
		uploadedBy,
		caption,
	});
});

app.listen(3000, () => {
	console.log('Server is running on port 3000');
});
