import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
} from "../controller/announcementController.js";
import { validate, sanitizeInput } from "../middleware/validator.js";

const router = express.Router();

const createAnnouncementSchema = {
  title: { required: true, minLength: 3 },
  message: { required: true, minLength: 10 },
};

router.use(authMiddleware);

router.post("/", sanitizeInput, validate(createAnnouncementSchema), createAnnouncement);

router.get("/", listAnnouncements);

router.delete("/:id", deleteAnnouncement);

export default router;
