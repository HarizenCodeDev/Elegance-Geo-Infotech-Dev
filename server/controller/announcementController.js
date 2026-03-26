import db from "../config/database.js";

const canPublish = (role) =>
  ["root", "admin", "manager", "hr", "teamlead"].includes(role);

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, audienceRoles = ["all"], audienceDepartments = [] } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
      });
    }

    if (!canPublish(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create announcements",
      });
    }

    const [announcement] = await db("announcements")
      .insert({
        title: title.trim(),
        message: message.trim(),
        audience_roles: audienceRoles.length ? audienceRoles : ["all"],
        audience_departments: audienceDepartments,
        created_by: req.user._id,
      })
      .returning("*");

    // Get creator info
    const creator = await db("users")
      .where("id", req.user._id)
      .first();

    res.status(201).json({
      success: true,
      announcement: {
        _id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        audienceRoles: announcement.audience_roles,
        audienceDepartments: announcement.audience_departments,
        createdBy: {
          _id: creator.id,
          name: creator.name,
          role: creator.role,
        },
        createdAt: announcement.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listAnnouncements = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userDepartment = req.user.department;

    // Build filter based on user's role and department
    const announcements = await db("announcements")
      .leftJoin("users", "announcements.created_by", "users.id")
      .select(
        "announcements.id",
        "announcements.title",
        "announcements.message",
        "announcements.audience_roles",
        "announcements.audience_departments",
        "announcements.created_at",
        "users.id as creator_id",
        "users.name as creator_name",
        "users.role as creator_role"
      )
      .where((builder) => {
        builder
          .whereRaw("'all' = ANY(announcements.audience_roles)")
          .orWhereRaw("? = ANY(announcements.audience_roles)", [userRole]);
        if (userDepartment) {
          builder.orWhereRaw("? = ANY(announcements.audience_departments)", [userDepartment]);
        }
      })
      .orderBy("announcements.created_at", "desc")
      .limit(100);

    res.json({
      success: true,
      announcements: announcements.map((a) => ({
        _id: a.id,
        title: a.title,
        message: a.message,
        audienceRoles: a.audience_roles,
        audienceDepartments: a.audience_departments,
        createdBy: {
          _id: a.creator_id,
          name: a.creator_name,
          role: a.creator_role,
        },
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await db("announcements").where("id", id).first();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: "Announcement not found",
      });
    }

    // Only creator or root can delete
    if (announcement.created_by !== req.user._id && req.user.role !== "root") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this announcement",
      });
    }

    await db("announcements").where("id", id).del();

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { createAnnouncement, listAnnouncements, deleteAnnouncement };
