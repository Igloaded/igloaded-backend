import { v2 as cloudinary } from 'cloudinary';
import { vars } from '../../secrets.js';
import axios from 'axios';
import { basename, extname } from 'path';

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

export const newThumbnail = (url, filename) => {
	try {
		return cloudinary.uploader.upload(
			url,
			{
				folder: 'ThumbnailImages',
				public_id: filename,
				use_filename: true,
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

export const uploadExcel = (url) => {
	try {
		return cloudinary.uploader.upload(
			url,
			{
				resource_type: 'raw',
				folder: 'Excels',
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

export const deleteThumbnail = async (
	imageUrl
) => {
	return new Promise((resolve, reject) => {
		if (
			!imageUrl ||
			imageUrl ==
				'https://res.cloudinary.com/dgbqsbo7g/image/upload/v1711522015/StaticAssests/loading_i8aaxn.gif'
		) {
			reject({
				status: 400,
				message: 'Something went wrong',
				error:
					'No image url provided / Default image',
			});
		}
		const url = new URL(imageUrl);
		const pathname = url.pathname;
		const publicId = basename(
			pathname,
			extname(pathname)
		);
		try {
			cloudinary.uploader
				.destroy(`ThumbnailImages/${publicId}`, {
					resource_type: 'image',
				})
				.then((result) => {
					resolve({
						status: 200,
						message: 'Image removed',
						result: result,
					});
				})
				.catch((error) => {
					reject({
						status: 400,
						message: 'Something went wrong',
						error: error,
					});
				});
		} catch (error) {
			reject({
				status: 400,
				message: 'Something went wrong',
				error: error,
			});
		}
	});
};

export const removeExcelFile = async (
	fileUrl
) => {
	return new Promise((resolve, reject) => {
		if (!fileUrl) {
			reject({
				status: 400,
				message: 'Something went wrong',
				error: 'No File url provided',
			});
		}
		const url = new URL(fileUrl);
		const pathname = url.pathname;
		const publicId = basename(
			pathname,
			extname(pathname)
		);
		try {
			cloudinary.uploader.destroy(
				`Excels/${publicId}.xlsx`,
				{ resource_type: 'raw' },
				(error, result) => {
					if (error) {
						console.log(error);
						reject({
							status: 400,
							message: 'Something went wrong',
							error: error,
						});
					} else {
						resolve({
							status: 200,
							message: 'Excel File removed',
							result: result,
						});
					}
				}
			);
		} catch (error) {
			reject({
				status: 400,
				message: 'Something went wrong',
				error: error,
			});
		}
	});
};
