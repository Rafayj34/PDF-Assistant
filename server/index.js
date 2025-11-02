import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY,
});
const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
});
const app = express();
app.use(cors());

app.listen(8000, () => console.log("server started"));
app.get("/", (req, res) => {
  return res.json({ status: "All good" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  await queue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({ message: "uploaded" });
});

app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey:
      process.env.OPENAI_API_KEY,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: `http://localhost:6333 `,
      collectionName: "pdf-docs",
    }
  );

  const ret = vectorStore.asRetriever({
    k: 2,
  });
  const result = await ret.invoke(userQuery);

  const systemPrompt = `
  You are a helpful AI assitant who answers user query based on the available context from the pdf files.
  Context:
  ${JSON.stringify(result)}
  `;

  const chatResult = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuery },
    ],
  });

  return res.json({
    messages: chatResult.choices[0].message.content,
    docs: result,
  });
});
