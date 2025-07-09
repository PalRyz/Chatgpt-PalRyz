import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import multer from "multer";
import pdfParse from "pdf-parse";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ dest: 'uploads/' });

const dbFile = path.join(__dirname, 'db.json');
const usersFile = path.join(__dirname, 'users.json');
const read = async (f) => await fs.readJSON(f).catch(() => ({}));
const write = async (f, d) => await fs.writeJSON(f, d);

app.post("/api/login", async (req, res) => {
  const { user, pass } = req.body;
  const users = await read(usersFile);
  if (users[user] && users[user].password === pass) {
    return res.json({ success: true, role: users[user].role });
  }
  res.status(403).json({ error: 'Login gagal' });
});

app.post("/api/chat", async (req, res) => {
  const { message, user, model } = req.body;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: model || "gpt-4", messages: [{ role: "user", content: message }] })
  });
  const data = await response.json();
  const reply = data.choices[0].message.content;
  const history = await read(dbFile);
  if (!history[user]) history[user] = [];
  history[user].push({ message, reply });
  await write(dbFile, history);
  res.json({ reply });
});

app.get("/api/history", async (req, res) => {
  const { user } = req.query;
  const history = await read(dbFile);
  res.json({ history: history[user] || [] });
});

app.get("/api/users", async (req, res) => {
  const data = await read(usersFile);
  res.json(data);
});

app.post("/api/pdf", upload.single('pdf'), async (req, res) => {
  const buffer = await fs.readFile(req.file.path);
  const text = (await pdfParse(buffer)).text;
  await fs.unlink(req.file.path);
  res.json({ text });
});

app.post("/api/image", async (req, res) => {
  const { prompt } = req.body;
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ prompt, n: 1, size: "512x512" })
  });
  const data = await response.json();
  res.json({ url: data.data[0].url });
});

app.listen(3000, () => console.log("✅ Server ready at http://localhost:3000"));
