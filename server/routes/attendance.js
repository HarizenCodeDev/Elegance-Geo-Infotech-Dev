import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createOrUpdateAttendance,
  listAttendance,
} from "../controller/attendanceController.js";

const router = express.Router();

router.post("/", authMiddleware, createOrUpdateAttendance);

router.get("/", authMiddleware, listAttendance);

export default router;
