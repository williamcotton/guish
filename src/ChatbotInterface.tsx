import React, { useState, useRef, useEffect } from "react";
import OpenAI from "openai";

interface ChatbotInterfaceProps {
  openAi: OpenAI;
  onBashCommandGenerated: (command: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface StructuredResponse {
  bash_command: string;
  response: string;
}

const ChatbotInterface: React.FC<ChatbotInterfaceProps> = ({
  openAi,
  onBashCommandGenerated,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const completion = await openAi.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that translates English instructions into bash commands. Respond with a JSON object containing 'bash_command' and 'response' fields. The 'bash_command' should be the actual command, and 'response' should be an explanation.",
          },
          ...messages,
          userMessage,
        ],
        model: "gpt-4o-mini",
      });

      const assistantResponse = completion.choices[0].message.content;
      let structuredResponse: StructuredResponse;

      try {
        structuredResponse = JSON.parse(
          assistantResponse || "{}"
        ) as StructuredResponse;
      } catch (error) {
        console.error("Error parsing JSON response:", error);
        structuredResponse = {
          bash_command: "Error: Unable to generate bash command",
          response: "Sorry, there was an error processing your request.",
        };
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: `Bash Command: ${structuredResponse.bash_command}\n\nExplanation: ${structuredResponse.response}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      onBashCommandGenerated(structuredResponse.bash_command);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-64 bg-gray-100 rounded-lg p-4 mb-4">
      <div className="flex-grow overflow-auto mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded-l-lg"
          placeholder="Enter your instruction..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatbotInterface;
