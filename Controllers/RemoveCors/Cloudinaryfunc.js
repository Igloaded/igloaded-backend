import { v2 as cloudinary } from 'cloudinary';
import { vars } from '../../secrets.js';
import axios from 'axios';

cloudinary.config({
	cloud_name: vars.cloudName,
	api_key: vars.apiKeyCloudinary,
	api_secret: vars.apiSecretCloudinary,
	secure: true,
});

export const isImageAvailable = (filename) => {
	const urlData = `https://res.cloudinary.com/${vars.cloudName}/image/upload/v1708526880/IgloadedImages/${filename}.jpg`;
	const options = {
		method: 'GET',
		url: urlData,
	};
	return new Promise((resolve, reject) => {
		axios(options)
			.then((response) => {
				if (response.status === 200) {
					resolve({
						status: 'ok',
						message: 'Image found',
						url: urlData,
					});
				}
			})
			.catch((error) => {
				if (error.response.status === 404) {
					reject({
						status: 'error',
						message: 'Image not found',
						url: null,
					});
				}
			});
	});
};

export const RemoveCors = async (
	url,
	fileName
) => {
	try {
		const result = await cloudinary.uploader.upload(
			url,
			{
				folder: 'IgloadedImages',
				public_id: fileName,
				use_filename: true,
			}
		);

		return result;
	} catch (error) {
		console.log(error);
		return Promise.reject(error);
	}
};

export const newThumbnail = (url) => {
	try {
		return cloudinary.uploader.upload(
			url,
			{
				folder: 'ThumbnailImages',
				use_filename: false,
			},
			(error, result) => {
				if (result) {
					return result;
				} else {
					console.log(error);
					return Promise.reject(error);
				}
			}
		);
	} catch (error) {
		console.log(error);
		return Promise.reject(error);
	}
};
