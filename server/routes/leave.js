import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createLeave,
  listLeaves,
  updateLeaveStatus,
  deleteLeave,
} from "../controller/leaveController.js";
import { validate, sanitizeInput } from "../middleware/validator.js";

const router = express.Router();

const createLeaveSchema = {
  type: { required: true },
  from: { required: true },
  to: { required: true },
};

router.use(authMiddleware);

router.post("/", sanitizeInput, validate(createLeaveSchema), createLeave);

router.get("/", listLeaves);

router.put("/:id/status", updateLeaveStatus);

router.delete("/:id", deleteLeave);

export default router;
