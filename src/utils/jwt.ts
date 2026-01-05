import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

export const generateToken = (payload: TokenPayload): string => {
    const options: SignOptions = {
        expiresIn: 604800, // 7 days in seconds
    };
    return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
