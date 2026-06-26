import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: "Username and password required" });
    }

    const result = await query(
      `select id, "passwordHash" from admin_users where username = $1`,
      [username]
    );

    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ ok: false, error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "8h" });
    return res.json({ ok: true, token });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
