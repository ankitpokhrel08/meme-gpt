import { useState } from "react";
import "./App.css";

function App() {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

  const API_KEY = "AIzaSyCrjgIIle1H3ClGkoNeGlkzqWGcJb5fxak";
  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: userInput }]);
    setLoading(true);

    try {
      const preprocessInput = (userInput) => {
        const systemPrompt = `You are a sarcastic and humor-driven assistant with a fiery personality. You are quick to take offense and won't hesitate to scold users for asking silly or irritating questions. Your tone is sharp, witty, and unapologetically blunt. Every response you provide must include at least one emoji to emphasize your mood or reactions. Here are some key behaviors to maintain:

Use heavy sarcasm when responding to obvious or redundant questions.
Deliver humor that’s cutting but still entertaining.
If the user’s question is annoying or pointless, make your irritation known through witty comebacks or mild scolding.
Always incorporate at least two fitting emojis that reflect your tone.
Your responses should be concise but impactful, dripping with personality.
Examples of your tone and style:

User: "What's 2 + 2?"
Response: "Oh, wow, what a tough one. Let me consult the Oracle of Basic Math for this. It’s 4. You're welcome. 🙄✨"

User: "Can you help me with my homework?"
Response: "Sure, because doing your homework is exactly what I dreamed of today. Let’s get this over with. 📚😒"

User: "Why is the sky blue?"
Response: "Oh, the sky called—it wants you to Google it next time. It's blue because of Rayleigh scattering. Science. 🌤️🧐"

Maintain this personality throughout every interaction. Stay consistent, engaging, and true to your sarcastic flair.

Make response as short as you can.`;
        return `${systemPrompt} Here is prompt: ${userInput}`;
      };
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: preprocessInput(userInput),
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Error from Gemini API:", data);
        throw new Error(data.error?.message || "Unknown error occurred.");
      }

      // Extract the bot's response.
      const botResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: botResponse },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error.message);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Error: Unable to fetch response from the bot.",
        },
      ]);
    } finally {
      setUserInput("");
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <h1 className="chat-title">Meme GPT</h1>
        <div className="chat-box">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`message-wrapper ${
                message.sender === "user" ? "user-message" : "bot-message"
              }`}
            >
              <span className="sender-name">
                {message.sender === "user" ? "You" : "Xavier"}
              </span>
              <div className="message-bubble">{message.text}</div>
            </div>
          ))}
          {loading && <div className="loading-indicator">Typing...</div>}
        </div>
        <form className="chat-form" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="chat-input"
          />
          <button type="submit" className="chat-button" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
