import { Router } from "express";

const viewRouter = Router();
viewRouter.get("/", (req, res) => {
  res.json({ message: "Welcome to view page" });
});
export default viewRouter;
