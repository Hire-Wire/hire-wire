import axios from 'axios';
import dotenv from 'dotenv';
import { systemPrompt } from './config/LLMconfig.js';

// Load environment variables from .env file
dotenv.config();

// OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;

class LLMGenerationService {
  constructor(prompt) {
    this.prompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);

    if (typeof this.prompt !== 'string') {
      throw new Error('Prompt must be a string.');
    }

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
        { role: 'system', content: `${systemPrompt} ${this.prompt}` },
        { role: 'user', content: this.prompt },
      ],
    };

    try {
      const response = await axios.post(url, data, { headers });

      if (!response.data.choices || !response.data.choices[0]) {
        throw new Error('Unexpected response from OpenAI API');
      }

      let markdownContent = response.data.choices[0].message.content;
      markdownContent = markdownContent.replace(/```markdown\s([\s\S]*?)```/g, '$1');
      return markdownContent;
    } catch (error) {
      this.#handleError(error);
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  #handleError(error) {
    if (error.response) {
      throw new Error(`Error calling ChatGPT API: ${JSON.stringify(error.response.data)}`);
    } else {
      throw new Error(error.message);
    }
  }
}

export default LLMGenerationService;
