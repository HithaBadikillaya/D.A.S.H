import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/healthcheck", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
