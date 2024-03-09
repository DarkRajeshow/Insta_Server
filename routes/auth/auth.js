import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { hashPassword, comparePasswords } from './bcrypt.js';
import { stringify } from 'uuid';

export async function registerUser(req, res, next) {
    const { email, password, username, name, gender } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        user = new User({
            email,
            password: hashedPassword,
            username,
            name,
            gender
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Determine if the environment is development or production
        const isProduction = process.env.NODE_ENV === 'production';

        const cookieOptions = {
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            domain: process.env.CLIENT_URL,
        };

        res.cookie('jwt', token, cookieOptions);

        res.json({ success: true, status: 'User registered and logged in successfully', user });
    } catch (error) {
        console.error('Error registering user:', error);
        res.json({ success: false, status: 'Internal Server Error' });
    }
}

export async function loginUser(req, res, next) {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ success: false, status: 'Invalid username or password' });
        }

        const passwordMatch = await comparePasswords(password, user.password);

        if (!passwordMatch) {
            return res.json({ success: false, status: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

          // Determine if the environment is development or production
        const isProduction = process.env.NODE_ENV === 'production';

        const cookieOptions = {
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.cookie('jwt', token, cookieOptions);
        res.json({ success: true, status: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.json({ success: false, status: 'Internal Server Error' });
    }
}

export async function logoutUser(req, res, next) {
    res.clearCookie('jwt');
    delete req.userId;
    res.json({ success: true, status: 'Logged out successfully.' });
}

export function isAuthenticated(req, res, next) {
    try {
        const jwtCookie = req.cookies.jwt;
        if (!jwtCookie) {
            req.isAuthenticated = () => false; // No JWT cookie present
        } else {
            const decodedToken = jwt.verify(jwtCookie, process.env.JWT_SECRET);
            req.userId = decodedToken.userId;
            req.isAuthenticated = () => true; // JWT cookie present and valid
        }
    } catch (error) {
        console.error('Error decoding or verifying JWT token:', error);
        req.isAuthenticated = () => false; // Error decoding or verifying JWT token
    }
    next();
}


export function isLoggedIn(req, res, next) {
    try {
        const isAuthenticated = req.isAuthenticated();
        if (isAuthenticated) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, status: "Login to continue." });
        }
    } catch (error) {
        return res.json({ success: false, status: "Internal server error" });
    }
}

export function getUserId(req, res) {
    const jwtCookie = req.cookies.jwt;
    if (!jwtCookie) {
        return res.json({ success: false, status: "Login to continue." });
    }

    try {
        const decodedToken = jwt.verify(jwtCookie, process.env.JWT_SECRET);

        const userId = decodedToken.userId;

        res.json({ success: true, userId });
    } catch (error) {
        console.error('Error decoding or verifying JWT token:', error);
        res.json({ success: false, status: 'Internal Server Error' });
    }
}