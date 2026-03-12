import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  verifyEmail,
  resendVerification,
  getUserById,
  changePassword,
  createUserByAdmin,
  adminResetPassword,
  listRolesForAdmin,
  listUsersForAdmin,
  updateUserRolesByAdmin,
  updateUserStatusByAdmin,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../auth.service";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../../../config/auth";
import { AuthRequest } from "../../../middleware/auth.middleware";

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, accessTokenCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
      message: "Registration successful. Please check your email for verification.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "REGISTRATION_FAILED",
        message: error.message,
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, result.accessToken, accessTokenCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

    return res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        requiresPasswordChange: result.requiresPasswordChange,
      },
      message: "Login successful",
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: "LOGIN_FAILED",
        message: error.message,
      },
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "REFRESH_TOKEN_MISSING",
          message: "No refresh token provided",
        },
      });
    }

    const { accessToken, refreshToken } = await refreshTokens(token);

    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessTokenCookieOptions);
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);

    return res.json({
      success: true,
      data: { accessToken },
      message: "Tokens refreshed successfully",
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: "REFRESH_FAILED",
        message: error.message,
      },
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (token) {
      await logoutUser(token);
    }

    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

    return res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "LOGOUT_FAILED",
        message: error.message,
      },
    });
  }
};

export const verifyEmailHandler = async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token);
    await verifyEmail(token);

    return res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VERIFICATION_FAILED",
        message: error.message,
      },
    });
  }
};

export const resendVerificationHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_EMAIL",
          message: "Email is required",
        },
      });
    }
    await resendVerification(email);

    return res.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "RESEND_FAILED",
        message: error.message,
      },
    });
  }
};

export const getMeHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      });
    }

    const user = await getUserById(req.user.id);

    return res.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: "GET_ME_FAILED",
        message: error.message,
      },
    });
  }
};

export const changePasswordHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Current password and new password are required",
        },
      });
    }

    await changePassword(req.user.id, currentPassword, newPassword);

    // Clear tokens so user must re-login with new password
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

    return res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "PASSWORD_CHANGE_FAILED",
        message: error.message,
      },
    });
  }
};

export const createUserByAdminHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      });
    }

    const { email, nom, prenom, roleName, roleNames, sexe, telephone } = req.body;

    const normalizedRoleNames = Array.isArray(roleNames)
      ? roleNames
      : (roleName ? [roleName] : []);

    if (!email || !nom || !prenom || normalizedRoleNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Email, nom, prenom, and at least one role are required",
        },
      });
    }

    const result = await createUserByAdmin({
      email,
      nom,
      prenom,
      roleNames: normalizedRoleNames,
      sexe,
      telephone,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
        tempPassword: result.tempPassword,
      },
      message: "User created successfully with temporary password",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "CREATE_USER_FAILED",
        message: error.message,
      },
    });
  }
};

export const adminResetPasswordHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      });
    }

    const userId = Number(req.params.userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_USER_ID",
          message: "Valid user ID is required",
        },
      });
    }

    const tempPassword = await adminResetPassword(req.user.id, userId);

    return res.json({
      success: true,
      data: { tempPassword },
      message: "Password reset successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "RESET_PASSWORD_FAILED",
        message: error.message,
      },
    });
  }
};

export const listAdminUsersHandler = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await listUsersForAdmin();

    return res.json({
      success: true,
      data: { users },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "LIST_USERS_FAILED",
        message: error.message,
      },
    });
  }
};

export const listRolesHandler = async (_req: AuthRequest, res: Response) => {
  try {
    const roles = await listRolesForAdmin();

    return res.json({
      success: true,
      data: { roles },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "LIST_ROLES_FAILED",
        message: error.message,
      },
    });
  }
};

export const updateUserRolesByAdminHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      });
    }

    const userId = Number(req.params.userId);
    const { roleNames } = req.body;

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_USER_ID",
          message: "Valid user ID is required",
        },
      });
    }

    if (!Array.isArray(roleNames) || roleNames.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_ROLES",
          message: "roleNames must be a non-empty array",
        },
      });
    }

    const user = await updateUserRolesByAdmin(req.user.id, userId, roleNames);

    return res.json({
      success: true,
      data: { user },
      message: "User roles updated successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_ROLES_FAILED",
        message: error.message,
      },
    });
  }
};

export const updateUserStatusByAdminHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        },
      });
    }

    const userId = Number(req.params.userId);
    const { status } = req.body;

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_USER_ID",
          message: "Valid user ID is required",
        },
      });
    }

    if (!status || !["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_STATUS",
          message: "status must be one of: active, inactive, suspended",
        },
      });
    }

    const user = await updateUserStatusByAdmin(req.user.id, userId, status);

    return res.json({
      success: true,
      data: { user },
      message: "User status updated successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_STATUS_FAILED",
        message: error.message,
      },
    });
  }
};

// ── Forgot password ─────────────────────────────────────────────

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        error: { code: "MISSING_EMAIL", message: "Email is required" },
      });
    }

    const rawToken = await requestPasswordReset(email);

    // Always respond with 200 to prevent user enumeration.
    // In development / intranet mode the token is returned in the response
    // so the frontend can build the reset link without email delivery.
    return res.json({
      success: true,
      message: "If this email is registered, a reset link has been generated.",
      ...(process.env.NODE_ENV !== "production" && rawToken
        ? { data: { resetToken: rawToken } }
        : {}),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: "FORGOT_PASSWORD_FAILED", message: error.message },
    });
  }
};

// ── Reset password ──────────────────────────────────────────────

export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Token and new password are required",
        },
      });
    }

    await resetPasswordWithToken(token, newPassword);

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error: any) {
    const status = error.message?.includes("Invalid or expired") ? 400 : 500;
    return res.status(status).json({
      success: false,
      error: { code: "RESET_PASSWORD_FAILED", message: error.message },
    });
  }
};
