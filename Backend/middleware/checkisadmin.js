import jwt from 'jsonwebtoken';
import redis from '../redisClient.js';
import AdminData from '../models/Admin.js';

const SECRET_KEY = "anis"; // move to .env in production
const SESSION_TTL = 3600; // 1 hour in seconds

export const isadmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const deviceId = req.headers['device-id'];

  if (!token || !deviceId) {
    return res.status(401).json({ message: "Token or Device ID Missing", success: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const sessionKey = `session:${decoded.id}:${deviceId}`;
    const redisToken = await redis.get(sessionKey);

    if (!redisToken || redisToken !== token) {
      return res.status(401).json({ message: "Session Invalid or Expired", success: false });
    }

    await redis.expire(sessionKey, SESSION_TTL);

    // Fetch admin if needed
    const admin = await AdminData.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin Not Found", success: false });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};
