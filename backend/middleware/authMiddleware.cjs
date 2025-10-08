const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // user_id, email, role, student_id, teacher_id
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token", err });
  }
}

// allow admin or required role
function checkRole(requiredRole) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "No role" });
    if (role === "admin" || role === requiredRole) return next();
    return res.status(403).json({ error: "Unauthorized" });
  };
}

module.exports = { verifyToken, checkRole };