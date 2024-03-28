const isAdmin = async (req, res, next) => {
	try {
		req.userId = null;
		req.isAdmin = false;
		const { token } = req.headers;
		if (token) {
			const { id } = jwt.verify(
				token,
				vars.jwtSecret
			);
			req.userId = id;
			const userData = await User.findById(id);
			if (userData) {
				req.isAdmin = userData.isAdmin;
			}
		} else {
			res.status(401).json({
				status: 'error',
				message: 'Missing Token',
				actionRequired: 'login',
			});
			return;
		}
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			console.log('The token has expired');
			res.status(401).json({
				status: 'error',
				message: 'The token has expired',
				actionRequired: 'login',
			});
		} else {
			console.log(error.message);
		}
	}
};
