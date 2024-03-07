import { v2 as cloudinary } from 'cloudinary';
import { vars } from '../../secrets.js';
import { basename, extname } from 'path';

cloudinary.config({
	cloud_name: vars.cloudName,
	api_key: vars.apiKeyCloudinary,
	api_secret: vars.apiSecretCloudinary,
	secure: true,
});

export const RemoveImages = async (req, res) => {
	try {
		return await cloudinary.api.delete_resources_by_prefix(
			'IgloadedImages',
			function (error, result) {
				if (error) {
					console.log(error);
					return res.status(401).json({
						message: 'Something went wrong',
						error: error,
					});
				}
				return res.status(200).json({
					message: 'Images removed',
					deleteCount: Object.keys(result.deleted)
						.length,
				});
			}
		);
	} catch (error) {
		console.log(error);
		return res.status(401).json({
			message: 'Something went wrong',
			error: error,
		});
	}
};

export const deleteSingleImage = async (
	req,
	res
) => {
	const { imageUrl } = req.body;
	if (!imageUrl) {
		return res.status(401).json({
			message: 'Something went wrong',
			error: 'No image url provided',
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
			.destroy(`IgloadedImages/${publicId}`, {
				resource_type: 'image',
			})
			.then((result) => {
				console.log(result);
				return res.status(200).json({
					message: 'Image removed',
					result: result,
				});
			})
			.catch((error) => {
				console.log(error);
				return res.status(401).json({
					message: 'Something went wrong',
					error: error,
				});
			});
	} catch (error) {
		console.log(error);
		return res.status(401).json({
			message: 'Something went wrong',
			error: error,
		});
	}
};
