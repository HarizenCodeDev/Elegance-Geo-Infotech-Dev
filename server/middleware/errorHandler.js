export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message || "Validation failed",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
    });
  }

  // Database errors
  if (err.code === "23505") {
    // PostgreSQL unique violation
    return res.status(409).json({
      success: false,
      error: "Record already exists",
    });
  }

  if (err.code === "23503") {
    // PostgreSQL foreign key violation
    return res.status(400).json({
      success: false,
      error: "Invalid reference",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : message,
  });
};
