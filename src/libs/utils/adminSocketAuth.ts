import jwt from "jsonwebtoken";

const ADMIN_SOCKET_SECRET = process.env.SESSION_SECRET || "admin-socket-secret";

export interface AdminSocketPayload {
  adminId: string;
  adminNick: string;
  isAdmin: true;
}

// Generate a short-lived token for admin socket connections
export const generateAdminSocketToken = (
  adminId: string,
  adminNick: string
): string => {
  const payload: AdminSocketPayload = {
    adminId,
    adminNick,
    isAdmin: true,
  };

  return jwt.sign(payload, ADMIN_SOCKET_SECRET, { expiresIn: "24h" });
};

// Verify admin socket token
export const verifyAdminSocketToken = (
  token: string
): AdminSocketPayload | null => {
  try {
    const decoded = jwt.verify(token, ADMIN_SOCKET_SECRET) as AdminSocketPayload;
    if (decoded.isAdmin) {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
};
