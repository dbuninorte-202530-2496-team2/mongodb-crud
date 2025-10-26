export function errorHandler(err, req, res, next) {
	if (err.status === 500 || !err.status)
		console.error(err)

	if (err.code === 11000)
		err.status = 400

	res.status(err.status || 500).json({
		status: err.status || 500,
		message: err.message || 'Internal Server Error',
		code: err.code
	});
}
