import { Router } from "express";
import { handleBusinessContact } from "../controllers/contact.controller";

const contactRouter = Router();

contactRouter.post("/business", handleBusinessContact);

export default contactRouter;
