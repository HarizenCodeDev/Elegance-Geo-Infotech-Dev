import db from "../config/database.js";

const canWrite = (role) => ["root", "admin", "manager"].includes(role);

const createOrUpdateAttendance = async (req, res, next) => {
  try {
    const { userId, date, status, action } = req.body;

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Employees can check themselves in/out; privileged roles can update anyone
    const self = userId === req.user._id;
    if (!self && !canWrite(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    // Verify user exists
    const user = await db("users").where("id", userId).first();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    let update = {};
    let record;

    if (action === "checkin") {
      update = {
        status: "Present",
        check_in_at: new Date(),
        updated_at: db.fn.now(),
      };
    } else if (action === "checkout") {
      update = {
        check_out_at: new Date(),
        updated_at: db.fn.now(),
      };
    } else if (["Present", "Absent"].includes(status)) {
      update = {
        status,
        updated_at: db.fn.now(),
      };
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid status or action",
      });
    }

    // Upsert attendance record
    const existing = await db("attendance")
      .where("user_id", userId)
      .whereRaw("DATE(date) = ?", [dateObj])
      .first();

    if (existing) {
      [record] = await db("attendance")
        .where("id", existing.id)
        .update(update)
        .returning("*");
    } else {
      [record] = await db("attendance")
        .insert({
          user_id: userId,
          date: dateObj,
          status: update.status || "Present",
          check_in_at: update.check_in_at || null,
          check_out_at: update.check_out_at || null,
        })
        .returning("*");
    }

    res.json({
      success: true,
      record: {
        _id: record.id,
        userId: record.user_id,
        date: record.date,
        status: record.status,
        checkInAt: record.check_in_at,
        checkOutAt: record.check_out_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listAttendance = async (req, res, next) => {
  try {
    const { date, from, to, userId } = req.query;
    let query = db("attendance")
      .join("users", "attendance.user_id", "users.id")
      .select(
        "attendance.id",
        "attendance.user_id",
        "attendance.date",
        "attendance.status",
        "attendance.check_in_at",
        "attendance.check_out_at",
        "users.name as user_name",
        "users.employee_id",
        "users.department",
        "users.role"
      )
      .orderBy("attendance.date", "desc")
      .limit(500);

    if (date) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      query = query.whereRaw("DATE(attendance.date) = ?", [dateObj]);
    }

    if (from && to) {
      query = query.whereBetween("attendance.date", [new Date(from), new Date(to)]);
    }

    if (userId) {
      query = query.where("attendance.user_id", userId);
    }

    const records = await query;

    res.json({
      success: true,
      records: records.map((r) => ({
        _id: r.id,
        user: {
          _id: r.user_id,
          name: r.user_name,
          employeeId: r.employee_id,
          department: r.department,
          role: r.role,
        },
        date: r.date,
        status: r.status,
        checkInAt: r.check_in_at,
        checkOutAt: r.check_out_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export { createOrUpdateAttendance, listAttendance };
