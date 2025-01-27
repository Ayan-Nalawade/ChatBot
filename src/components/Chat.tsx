import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, Loader2, LogOut } from "lucide-react";
import ollama from "ollama";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  images?: string[];
}

interface ChatProps {
  onLogout: () => void;
}

export function Chat({ onLogout }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    let hiddenContent: string | null = null;
    let imageBase64: string | undefined;

    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        // If it's an image, convert to Base64
        try {
          imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(",")[1]); // Extract Base64 content
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });

          userMessage.images = [imageBase64];
        } catch (error) {
          console.error("Error processing image:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, there was an error processing your image. Please try again.",
            },
          ]);
          setSelectedFile(null);
          return;
        }
      } else {
        // If it's not an image, read its content silently
        try {
          hiddenContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsText(selectedFile);
          });

          userMessage.content += `\n\n[Hidden File Content]:\n${hiddenContent}`;
        } catch (error) {
          console.error("Error reading file content:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Sorry, there was an error processing your file. Please try again.",
            },
          ]);
          setSelectedFile(null);
          return;
        }
      }
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const response = await ollama.chat({
        model: "llama3.2-vision:11b",
        messages: [
          {
            role: "user",
            content: userMessage.content,
            ...(imageBase64 && { images: [imageBase64] }),
          },
        ],
      });

      if (!response || !response.message) {
        throw new Error("Invalid response from Ollama");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message.content,
        },
      ]);
    } catch (error) {
      console.error("Ollama API Error:", error);
      let errorMessage = "Sorry, I encountered an error processing your request.";

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "Unable to connect to Ollama. Please make sure Ollama is running and try again.";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <motion.div
        className="flex justify-end p-4 border-b border-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </motion.button>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <motion.div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {message.images &&
                  message.images.map((image, i) => (
                    <motion.img
                      key={i}
                      src={`data:image/png;base64,${image}`}
                      alt="User uploaded"
                      className="max-w-full h-auto rounded-lg mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    />
                  ))}
                <ReactMarkdown className="prose prose-invert">
                  {message.content}
                </ReactMarkdown>
              </motion.div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endOfMessagesRef} />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept="*/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ImageIcon className="w-6 h-6" />
          </motion.button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </div>
        {selectedFile && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-gray-400">Selected file: {selectedFile.name}</p>
          </motion.div>
        )}
      </motion.form>
    </div>
  );
}
