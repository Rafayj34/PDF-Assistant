# 📚 Node.js PDF Assistant

A powerful RAG (Retrieval-Augmented Generation) chatbot that allows you to upload PDF documents and ask questions about Node.js documentation. Built with Next.js, Express, Qdrant vector database, and OpenAI.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Features

- 📤 **PDF Upload**: Upload multiple Node.js documentation PDFs
- 💬 **Intelligent Chat**: Ask questions about Node.js and get accurate answers
- 🔍 **Vector Search**: Uses Qdrant for semantic search through uploaded documents
- 🤖 **AI-Powered**: Leverages OpenAI GPT-4 for generating contextual responses
- 📄 **Source Citations**: See exactly which documents and pages were used for answers
- 🎨 **Modern UI**: Beautiful, responsive chat interface with markdown rendering
- ⚡ **Async Processing**: Background job processing with BullMQ for PDF ingestion
- 🌙 **Dark Mode**: Full dark mode support

## 🏗️ Architecture

The project follows a microservices architecture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Express   │────▶│   BullMQ    │
│  (Next.js)  │     │    API      │     │   Queue     │
└─────────────┘     └─────────────┘     └─────────────┘
                            │                   │
                            ▼                   ▼
                     ┌─────────────┐     ┌─────────────┐
                     │   OpenAI    │     │   Worker    │
                     │   (GPT-4)   │     │  (BullMQ)   │
                     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                       ┌─────────────┐
                                       │   Qdrant    │
                                       │  Vector DB  │
                                       └─────────────┘
```

### How It Works

1. **PDF Upload Flow**:
   - User uploads a PDF via the web interface
   - Express server receives the file and stores it in `uploads/` directory
   - A job is added to the BullMQ queue with file metadata
   - Background worker picks up the job, processes the PDF, creates embeddings, and stores them in Qdrant

2. **Chat Flow**:
   - User asks a question about Node.js
   - Express server queries Qdrant vector store to find relevant document chunks
   - Retrieved context is sent to OpenAI GPT-4 with the user query
   - AI generates an answer based on the retrieved context
   - Response is sent back to the client with source citations

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Lucide React** - Icon library

### Backend
- **Express.js** - Web framework
- **Multer** - File upload handling
- **BullMQ** - Job queue system
- **LangChain** - LLM framework
- **OpenAI API** - GPT-4 for chat completions
- **OpenAI Embeddings** - text-embedding-3-small for vector embeddings

### Infrastructure
- **Qdrant** - Vector database for semantic search
- **Valkey** (Redis-compatible) - Message broker for BullMQ
- **Docker Compose** - Container orchestration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pdf-assistant.git
cd pdf-assistant
```

### 2. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start Infrastructure Services

Start Qdrant and Valkey using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **Qdrant** on `http://localhost:6333`
- **Valkey** (Redis) on `http://localhost:6379`

Verify services are running:

```bash
docker-compose ps
```

### 4. Install Dependencies

#### Server Dependencies

```bash
cd server
npm install
```

#### Client Dependencies

```bash
cd ../client
npm install
```

### 5. Create Uploads Directory

```bash
cd ../server
mkdir -p uploads
```

### 6. Start the Application

You'll need **three terminal windows**:

#### Terminal 1: Start the Express Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:8000`

#### Terminal 2: Start the Worker

```bash
cd server
npm run dev:worker
```

This worker processes PDF uploads in the background.

#### Terminal 3: Start the Next.js Client

```bash
cd client
npm run dev
```

The client will run on `http://localhost:3000`

### 7. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## 📁 Project Structure

```
pdf-assistant/
├── client/                    # Next.js frontend application
│   ├── app/
│   │   ├── components/
│   │   │   ├── chat.tsx       # Main chat interface component
│   │   │   ├── fileUpload.tsx # PDF upload component
│   │   │   └── MarkdownRenderer.tsx # Markdown rendering component
│   │   ├── page.tsx           # Main page with split layout
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   └── package.json
│
├── server/                     # Express.js backend
│   ├── index.js               # Express server with API endpoints
│   ├── worker.js              # BullMQ worker for processing PDFs
│   ├── uploads/                # Directory for uploaded PDFs
│   └── package.json
│
├── docker-compose.yml          # Docker services configuration
└── README.md                   # This file
```

## 🔌 API Endpoints

### `POST /upload/pdf`

Upload a PDF file for processing.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `pdf` (file)

**Response:**
```json
{
  "message": "uploaded"
}
```

**How it works:**
1. File is stored in `server/uploads/` with a unique name
2. Job is added to BullMQ queue
3. Worker processes the file asynchronously

### `GET /chat`

Ask a question about Node.js documentation.

**Request:**
- Method: `GET`
- Query Parameter: `message` (string) - Your question

**Response:**
```json
{
  "messages": "AI-generated answer with markdown formatting",
  "docs": [
    {
      "pageContent": "Extracted text from PDF...",
      "metadata": {
        "source": "path/to/file.pdf",
        "loc": {
          "pageNumber": 10
        }
      }
    }
  ]
}
```

**How it works:**
1. Query is embedded using OpenAI embeddings
2. Qdrant performs semantic search (k=2 documents)
3. Retrieved context is sent to GPT-4 with system prompt
4. Response includes answer and source documents

## ⚙️ Configuration

### Qdrant Collection

The application uses a collection named `pdf-docs` in Qdrant. This is created automatically when you first add documents.

### Worker Configuration

The worker is configured with:
- `concurrency: 100` - Can process 100 jobs simultaneously
- Processes jobs from `file-upload-queue`

### Vector Search

- Embedding model: `text-embedding-3-small`
- Retrieval: Top 2 most relevant documents (k=2)
- LLM: GPT-4.1

## 🎨 Features in Detail

### Chat Interface

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Markdown Rendering**: Supports bold text, code blocks, headers, and more
- **Source Citations**: Shows which PDF and page number each answer came from
- **Loading States**: Visual feedback during AI processing
- **Error Handling**: Graceful error messages for failed requests

### File Upload

- **Drag & Drop**: Intuitive file upload interface
- **Status Indicators**: Visual feedback for upload success/failure
- **Multiple Files**: Upload multiple PDFs to build a knowledge base
- **Background Processing**: Files are processed asynchronously

## 🔧 Development

### Server Development

```bash
cd server
npm run dev          # Start server with watch mode
npm run dev:worker   # Start worker with watch mode
```

### Client Development

```bash
cd client
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## 🐳 Docker Services

### Qdrant

Vector database for storing document embeddings.

- **URL**: `http://localhost:6333`
- **Dashboard**: `http://localhost:6333/dashboard`

### Valkey (Redis-compatible)

Message broker for BullMQ job queue.

- **Port**: `6379`
- **Protocol**: Redis-compatible

## 📝 Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |

## 🚨 Troubleshooting

### Qdrant Connection Issues

If you see connection errors:
```bash
# Check if Qdrant is running
docker-compose ps

# Restart Qdrant
docker-compose restart qdrant
```

### Valkey Connection Issues

If the worker can't connect:
```bash
# Check if Valkey is running
docker-compose ps

# Restart Valkey
docker-compose restart valkey
```

### Worker Not Processing Jobs

1. Ensure the worker is running: `npm run dev:worker`
2. Check BullMQ connection in worker.js
3. Verify Valkey is accessible on port 6379

### PDFs Not Being Indexed

1. Check worker console for errors
2. Verify OpenAI API key is set correctly
3. Check Qdrant logs: `docker-compose logs qdrant`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [LangChain](https://www.langchain.com/) - LLM framework
- [Qdrant](https://qdrant.tech/) - Vector database
- [OpenAI](https://openai.com/) - GPT models and embeddings
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 📧 Contact

For questions or support, please email on rafayj34@gmail.com

---


