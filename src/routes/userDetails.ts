
import express, { Request, Response } from "express";

const router = express.Router();


// Render the User Details page
router.get("/userDetails", (req: Request, res: Response) => {
  res.render("userDetails"); // corresponds to views/userDetails.ejs
});



export default router; // ✅ Default export fixes the error
