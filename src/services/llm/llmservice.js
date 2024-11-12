import axios from 'axios';
import dotenv from 'dotenv';
import { systemPrompt, sampleUserPrompt } from './prompts/llmprompt.js';

// Load environment variables from .env file
dotenv.config();

// OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key Loaded:', apiKey ? 'Yes' : 'No');

class LlmService {
  static async callChatGPT(prompt) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };

    const data = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt + sampleUserPrompt },
        { role: 'user', content: prompt },
      ],
    };

    try {
      const response = await axios.post(url, data, { headers });
      let markdownContent = response.data.choices[0].message.content;
      markdownContent = markdownContent.replace(/```markdown\s([\s\S]*?)```/g, '$1');

      return markdownContent;
    } catch (error) {
      console.error(
        'Error calling ChatGPT API:',
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      );
      throw error;
    }
  }
}

export default LlmService;
