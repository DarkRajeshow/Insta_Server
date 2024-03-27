import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { hashPassword, comparePasswords } from './bcrypt.js';

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

        // Determine if the environment is development or production
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15d"
        });

        // Determine if the environment is development or production
        const isProduction = process.env.CLIENT_DOMAIN !== 'localhost';

        res.cookie('jwt', token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            secure: isProduction,
            httpOnly: true,
            sameSite: "strict"
        });
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

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "15d"
        });

        // Determine if the environment is development or production
        const isProduction = process.env.CLIENT_DOMAIN !== 'localhost';

        console.log({
            maxAge: 15 * 24 * 60 * 60 * 1000,
            secure: isProduction,
            httpOnly: true,
            sameSite: "strict"
        });
        
        res.cookie('jwt', token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            secure: isProduction,
            httpOnly: true,
            sameSite: "strict"
        });
        res.json({ success: true, status: 'Login successful', user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.json({ success: false, status: 'Internal Server Error' });
    }
}

export async function logoutUser(req, res, next) {
    res.clearCookie('jwt');
    res.json({ success: true, status: 'Logged out successfully.' });
}

export function isAuthenticated(req, res, next) {
    try {
        const jwtCookie = req.cookies.jwt;
        if (!jwtCookie) {
            req.isAuthenticated = () => false; // No JWT cookie present
        } else {
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

    console.log(jwtCookie);
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