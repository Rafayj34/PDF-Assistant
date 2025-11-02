import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "langchain";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from "dotenv";
dotenv.config();
const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("job", job.data);
    const data = JSON.parse(job.data);

    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    const embeddings = new OpenAIEmbeddings({
      model:"text-embedding-3-small",
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
    await vectorStore.addDocuments(docs)
    console.log("Docs added to store")
   
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: "6379",
    },
  }
);
