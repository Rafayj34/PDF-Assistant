import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "langchain";

const worker = new Worker(
    'file-upload-queue',
    async (job) => {
        console.log('job',job.data);
        const data = JSON.parse(job.data);

        
    },
    {
        concurrency: 100,
        connection: {
            host: 'localhost',
            port: '6379'
        }
    }
 )
