import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  verifyEmailHandler,
  resendVerificationHandler,
  getMeHandler,
  changePasswordHandler,
  createUserByAdminHandler,
  adminResetPasswordHandler,
  listAdminUsersHandler,
  listRolesHandler,
  updateUserRolesByAdminHandler,
  updateUserStatusByAdminHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "../controllers/auth.controller";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../../../middleware/rate-limit.middleware";
import { requireAuth, requireRole } from "../../../middleware/auth.middleware";

const router = Router();

// ==================== PUBLIC ROUTES ====================
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh-token", refreshLimiter, refresh);
router.post("/logout", logout);

// ── Password reset (public — no auth required) ──────────────────
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

// ==================== EMAIL VERIFICATION ====================
router.get("/verify-email/:token", verifyEmailHandler);
router.post("/resend-verification", resendVerificationHandler);

// ==================== PROTECTED ROUTES (All authenticated users) ====================
router.get("/me", requireAuth, getMeHandler);
router.post("/change-password", requireAuth, changePasswordHandler);

// ==================== ADMIN ROUTES (Using permissions) ====================

// Create user - requires 'users:create' permission
router.post(
  "/admin/create-user",
  requireAuth,
  requireRole(["admin", "vice_doyen"]),
  createUserByAdminHandler
);

// Reset password - requires 'users:edit' permission
router.post(
  "/admin/reset-password/:userId",
  requireAuth,
  requireRole(["admin", "vice_doyen"]),
  adminResetPasswordHandler
);

router.get(
  "/admin/users",
  requireAuth,
  requireRole(["admin", "vice_doyen"]),
  listAdminUsersHandler
);

router.get(
  "/admin/roles",
  requireAuth,
  requireRole(["admin", "vice_doyen"]),
  listRolesHandler
);

router.put(
  "/admin/users/:userId/roles",
  requireAuth,
  requireRole(["admin", "vice_doyen"]),
  updateUserRolesByAdminHandler
);

router.put(
  "/admin/users/:userId/status",
  requireAuth,
  requireRole(["admin", "vice_doyen"]),
  updateUserStatusByAdminHandler
);

export default router;
