import jwt from 'jsonwebtoken';

export default function getUserId(jwtCookie) {
    if (!jwtCookie) {
        return false;
    }

    try {
        const decodedToken = jwt.verify(jwtCookie, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        return userId
    } catch (error) {
        console.error('Error decoding or verifying JWT token:', error);
        return false
    }
}