import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  context: ChatMessage[];
}

const app = express();
const port = process.env.PORT || 3001;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

app.use(cors());
app.use(express.json());

// Endpoint to handle chat messages
app.post('/api/chat', async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  try {
    const { message, context = [] } = req.body;
    
    // Create a chat session
    const chat = model.startChat({
      history: context.map((msg) => ({
        role: msg.role,
        parts: msg.content,
      })),
    });

    // Generate response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 