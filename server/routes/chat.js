import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getMessages, sendMessage, createGroup, listGroups, deleteGroup } from "../controller/chatController.js";
import { validate, sanitizeInput } from "../middleware/validator.js";

const router = express.Router();

const sendMessageSchema = {
  contactId: { required: true },
  text: { required: true, minLength: 1, maxLength: 5000 },
};

const createGroupSchema = {
  name: { required: true, minLength: 2, maxLength: 50 },
};

router.use(authMiddleware);

// Group routes
router.get("/groups", listGroups);
router.post("/groups", sanitizeInput, validate(createGroupSchema), createGroup);
router.delete("/groups/:id", deleteGroup);

// Message routes
router.get("/", getMessages);
router.post("/", sanitizeInput, validate(sendMessageSchema), sendMessage);

export default router;
