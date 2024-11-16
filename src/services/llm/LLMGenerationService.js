import axios from 'axios';
import dotenv from 'dotenv';
import { systemPrompt, sampleUserPrompt } from './prompts/LLMConfig.js';

// Load environment variables from .env file
dotenv.config();

// OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;

class LLMGenerationService {
  constructor(prompt) {
    // Convert prompt to a string, if needed
    this.prompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);

    // Ensure prompt is a string
    if (typeof this.prompt !== 'string') {
      throw new Error('Prompt must be a string.');
    }

    // Ensure API key is set
    if (!apiKey) {
      throw new Error('API key is missing. Please set OPENAI_API_KEY in your .env file.');
    }
  }

  async callChatGPT() {
    const url = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    const data = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${systemPrompt} ${sampleUserPrompt}` },
        { role: 'user', content: this.prompt },
      ],
    };

    try {
      const response = await axios.post(url, data, { headers });
      let markdownContent = response.data.choices[0].message.content;
      markdownContent = markdownContent.replace(/```markdown\s([\s\S]*?)```/g, '$1');

      return markdownContent;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  handleError(error) {
    if (error.response) {
      throw new Error(`Error calling ChatGPT API: ${JSON.stringify(error.response.data)}`);
    } else {
      throw new Error(error.message);
    }
  }
}

export default LLMGenerationService;
