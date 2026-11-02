const { createRemoteJWKSet, jwtVerify } = require("jose");

const AUTH_URL = process.env.AUTH_BASE_URL || "http://localhost:3000";

const JWKS = createRemoteJWKSet(
  new URL(`${AUTH_URL}/api/auth/jwks`)
);

const verifyToken = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.split(" ")[1];

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: AUTH_URL,
      audience: AUTH_URL,
    });

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { verifyToken };