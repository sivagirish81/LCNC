import { GoogleGenerativeAI } from '@google/generative-ai';

// Add logging to check if API key is loaded
console.log('Gemini API Key present:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function getGeminiResponse(message: string) {
  try {
    console.log('Attempting to get Gemini response for:', message);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    // Create a chat session
    const chat = model.startChat({
      history: [], // We'll keep it simple for now
    });

    // Generate response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    console.log('Got Gemini response:', response.text());
    return response.text();
  } catch (error) {
    console.error('Error getting Gemini response:', error);
    throw error;
  }
} 