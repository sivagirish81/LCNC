import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function getGeminiResponse(message: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create a chat session
    const chat = model.startChat({
      history: [], // We'll keep it simple for now
    });

    // Generate response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    throw error;
  }
} 