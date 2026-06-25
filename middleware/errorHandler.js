const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Id format' });
    }

    if (err.code === 11000) {
        return res.status(400).json({ success: false, message: 'Duplicate field value' });
    }

    res.status(500).json({ success: false, message: 'Something went wrong on our end'});
};

module.exports = errorHandler;