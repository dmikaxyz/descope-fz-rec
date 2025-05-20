import dbController from './dbController.js'
import cors from 'cors'
import express from 'express'
import "dotenv/config"

const app = express()
const PORT = 3000
const corsOptions = {
    origin: "http://localhost:3001",
    optionSuccessStatus: 200,
    credentials: true 
  };

app.use(express.json())
app.use(cors(corsOptions))

app.get("/api/entries", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer")) {
    return res.json({ status: "error", message: "unauthorized" });
  } else {
    const token = authHeader.split(" ")[1];
    res.json(await dbController.getAllEntriesByToken(token));
  }
});
app.post("/register", async (req, res) => {
  const response = await dbController.addUser(req.body.email, req.body.password);
  if (response) res.json(response);
});
app.post("/login", async (req, res) => {
  const response = await dbController.validateUser(
    req.body.email,
    req.body.password
  );
  if (response) res.json(response);
});
app.post("/api/addEntry", async (req, res) => {
  const { token, ...entryData } = req.body;
  if (!token) {
    res.json({ status: "error", message: "Login required" });
  }
  try {
    const newEntry = await dbController.addUserEntry(token, entryData);
    res.json({ status: "success", data: newEntry });
  } catch (error) {
    res.json({ status: "error", message: "Database issue" });
  }
});
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });