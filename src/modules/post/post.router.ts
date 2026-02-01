import express from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";
const router = express.Router();

router.post("/", auth(UserRole.USER), postController.createPost);
router.get("/", postController.getAllPosts);

export const postRouter = router;