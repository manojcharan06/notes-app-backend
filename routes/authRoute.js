const express = require('express')
const router = express.Router()
const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens')
const RefreshToken = require('../models/RefreshToken')
const protect = require('../middleware/auth')

router.post('/auth/signup', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already in use"
            })
        }

        const newUser = await User.create({ name, email, password });

        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = await generateRefreshToken(newUser._id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            success: true,
            accessToken,
            user: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        next(error);
    }
});

router.post('/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            })
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = await generateRefreshToken(user._id);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log('NODE_ENV is:', process.env.NODE_ENV);
        res.status(200).json({
            success: true,
            accessToken,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        next(error);
    }
})

router.post('/auth/refresh', async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({
            message: 'No refresh token'
        });

        const stored = await RefreshToken.findOne({ token });
        if (!stored) return res.status(403).json({
            message: 'Invalid refresh token'
        });

        if (stored.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id: stored._id });
            return res.status(403).json({
                message: 'Refresh token expired'
            })
        }

        const newAccessToken = generateAccessToken(stored.user);
        res.status(200).json({
            accessToken: newAccessToken
        });
    } catch (error) {
        next(error);
    }
})

router.post('/auth/logout', async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            await RefreshToken.deleteOne({token});
        }
        res.clearCookie('refreshToken');
        res.status(200).json({
            success: true,
            message: 'Logged Out'
        });
    } catch (error) {
        next(error);
    }
})

router.get('/auth/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
})

module.exports = router;