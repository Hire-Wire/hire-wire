import axios from 'axios';
import dotenv from 'dotenv';
import { systemPrompt } from './prompts/llmprompt.js';

// Load environment variables from .env file
dotenv.config();

// OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;

class LLMGenerationService {
  constructor(prompt) {
    console.log('[INFO] Initializing LLMGenerationService...');
    // Convert prompt to a string, if needed
    this.prompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
    console.log(`[DEBUG] Prompt initialized: ${this.prompt}`);

    // Ensure prompt is a string
    if (typeof this.prompt !== 'string') {
      console.error('[ERROR] Prompt must be a string.');
      throw new Error('Prompt must be a string.');
    }

    // Ensure API key is set
    if (!apiKey) {
      console.error('[ERROR] API key is missing. Please set OPENAI_API_KEY in your .env file.');
      throw new Error('API key is missing. Please set OPENAI_API_KEY in your .env file.');
    }

    console.log('[INFO] LLMGenerationService initialized successfully.');
  }

  async callChatGPT() {
    console.log('[INFO] Preparing to call ChatGPT API...');
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

    console.log('[DEBUG] Final request data:', data);

    try {
      console.log('[INFO] Sending request to ChatGPT API...');
      const response = await axios.post(url, data, { headers });
      console.log('[INFO] Received response from ChatGPT API.');

      if (!response.data.choices || !response.data.choices[0]) {
        console.error('[ERROR] Unexpected response structure:', response.data);
        throw new Error('Unexpected response from OpenAI API');
      }

      let markdownContent = response.data.choices[0].message.content;
      console.log('[INFO] Extracting content from response...');
      markdownContent = markdownContent.replace(/```markdown\s([\s\S]*?)```/g, '$1');
      console.log('[DEBUG] Extracted markdown content:', markdownContent);

      console.log('[INFO] Successfully processed response from ChatGPT API.');
      return markdownContent;
    } catch (error) {
      console.error('[ERROR] Error occurred while calling ChatGPT API:', error.message);
      this.#handleError(error);
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  #handleError(error) {
    console.error('[ERROR] Handling error in ChatGPT API call...');
    if (error.response) {
      console.error('[ERROR] API Response Error:', JSON.stringify(error.response.data));
      throw new Error(`Error calling ChatGPT API: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error('[ERROR] General Error:', error.message);
      throw new Error(error.message);
    }
  }
}

export default LLMGenerationService;
