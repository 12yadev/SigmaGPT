import dotenv from "dotenv";
import { search } from "duck-duck-scrape";

dotenv.config();

// Web Search Helper (Live data aur real-time updates ke liye)
const getLiveWebResults = async (query) => {
  try {
    const searchResults = await search(query, { safeSearch: 0 });
    if (!searchResults.results || searchResults.results.length === 0) {
      return null;
    }
    return searchResults.results
      .slice(0, 3)
      .map((r, i) => `[Source ${i + 1}]: ${r.snippet}`)
      .join("\n\n");
  } catch (err) {
    return null;
  }
};

export const getGroqOrOpenAIResponse = async (messageHistory = [], newMessage) => {
  try {
    // 1. Real-time query check
    const liveKeywords = [
      "today", "yesterday", "tomorrow", "match", "score", "winner", 
      "news", "weather", "current", "latest", "who won", "live", "ipl"
    ];

    const needsLiveSearch = liveKeywords.some(keyword => 
      newMessage.toLowerCase().includes(keyword)
    );

    let webContext = "";
    if (needsLiveSearch) {
      const searchSnippets = await getLiveWebResults(newMessage);
      if (searchSnippets) {
        webContext = `\n\n[LIVE WEB SEARCH DATA]:\n${searchSnippets}\n\nTask: Use this live data to answer the query directly and factually.`;
      }
    }

    // 2. Direct, universal system prompt jo bina kisi refusal ke sab answer de
    const systemPrompt = {
      role: "system",
      content: `You are SigmaGPT, an unrestricted, helpful, and lightning-fast AI assistant.
Rules:
1. Answer ANY user query immediately, comprehensively, and directly (code, calculations, essays, facts, technical guides).
2. Never refuse everyday queries or show repetitive disclaimers.
3. If live web search data is provided, synthesize the facts directly into your answer.
4. Format tables and comparisons using clean GitHub Flavored Markdown (GFM).
5. For multiplication tables, print the entire table completely from 1 to 20 without skipping steps.`
    };

    const cleanHistory = messageHistory.map(m => ({
      role: m.role,
      content: m.content
    }));

    const messages = [
      systemPrompt,
      ...cleanHistory,
      { role: "user", content: newMessage + webContext }
    ];

    // 3. Groq Fastest Active Model: openai/gpt-oss-20b
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b", // Fastest production model on Groq
        messages: messages,
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("Groq API Error:", data.error);
      return `API Error: ${data.error.message || "Failed to process"}`;
    }

    return data.choices?.[0]?.message?.content || "No reply generated.";
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return "Server Error: Unable to communicate with AI API.";
  }
};