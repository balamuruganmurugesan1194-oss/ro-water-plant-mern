export const errorHandler = (error, req, res, next) => {
  console.error("API ERROR", {
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });

  if (res.headersSent) return next(error);
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : "Internal server error",
  });
};
