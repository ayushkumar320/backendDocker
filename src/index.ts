import userRouter from "./routes/user.js";
import express from "express";
import cors from "cors";
import postRouter from "./routes/post.js";
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
