import { Request, Response, NextFunction } from "express";

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user; // make user available to all views
    return next();
  }
  return res.redirect("/login");
};

const wantsJson = (req: Request): boolean => {
  const accept = req.headers.accept || "";
  return req.xhr || accept.includes("application/json") || accept.includes("json");
};

export const ensureAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session || !req.session.user) {
    if (wantsJson(req)) {
      return res.status(401).json({ error: "Authentication required" });
    }
    return res.redirect("/login");
  }

  if (req.session.user.role !== "admin") {
    if (wantsJson(req)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return res.redirect("/dashboard");
  }

  res.locals.user = req.session.user;
  return next();
};
