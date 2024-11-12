const axios = require("axios");
const dotenv = require("dotenv");
// const readline = require("readline");

// Load environment variables from .env file
dotenv.config();

// OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
console.log("API Key Loaded:", apiKey ? "Yes" : "No");

const apiKey = process.env.OPENAI_API_KEY;

class openAILLMService {
    async callChatGPT(prompt) {
        const url = "https://api.openai.com/v1/chat/completions";

        if (!apiKey) {
            console.error("API Key is missing. Please check .env file.");
            throw new Error("API Key missing.");
        }

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        };

        const data = {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: (llmSystemPrompt || "") + (userData || "") + (resumeTemplate || "") },
                { role: "user", content: prompt },
            ],
        };

        try {
            const response = await axios.post(url, data, { headers });
            return response.data.choices[0]?.message?.content || "No response content";
        } catch (error) {
            console.error(
                "Error calling ChatGPT API:",
                error.response
                    ? JSON.stringify(error.response.data, null, 2)
                    : error.message
            );
            throw error;
        }
    }
}

module.exports = openAILLMService;

// // Create an interface for user input
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });
//
// // Prompt the user for input
// rl.question("Enter your input: ", async (prompt) => {
//     try {
//         // Added await here to ensure proper asynchronous handling
//         const response = await llmService.callChatGPT(prompt);
//         console.log("ChatGPT response:", response);
//     } catch (error) {
//         console.error("Error:", error.message);
//     } finally {
//         rl.close();
//     }
// });
