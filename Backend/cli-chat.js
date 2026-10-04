import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const API_BASE = "http://localhost:8080/api";
const currentThreadId = "cli-session-" + Date.now();

const rl = readline.createInterface({ input, output });

async function sendPrompt(userText) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      threadId: currentThreadId,
      message: userText,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.details || payload.error || "Server request failed");
  }
  return payload.reply;
}

async function startChat() {
  console.log("=========================================");
  console.log(` SigmaGPT CLI Shell | Thread: ${currentThreadId}`);
  console.log(" Type your prompt and press Enter.");
  console.log(" Type 'exit' to quit.");
  console.log("=========================================\n");

  while (true) {
    const question = await rl.question("You > ");

    if (question.trim().toLowerCase() === "exit") {
      console.log("\nEnding conversation session...");
      break;
    }

    if (!question.trim()) continue;

    try {
      const reply = await sendPrompt(question.trim());
      console.log(`\nAI  > ${reply}\n`);
    } catch (err) {
      console.error(`\nError: ${err.message}\n`);
    }
  }

  rl.close();
}

startChat();