# ChatBot UI

ChatBot UI is a lightweight interface that utilizes **Ollama** to run a local AI model on your system. It also supports vision-based models for image uploads. This guide will help you set up and get started.

---

## 🚀 Getting Started

### Prerequisites

1. **Install Ollama**  
   Download and install Ollama from their [official website](https://ollama.com/download).  
   
   Make sure it's properly configured and running on your system.

2. **Install a Local Model**  
   Ensure you have at least one model installed locally that can run on your system using Ollama.  
   You can browse and manage models via the Ollama interface.

---

## 🛠 Customization

### Vision Model for Image Uploads

If you want to add support for image uploads:  

1. Add a vision model to the `Chat.tsx` file:  

src/components/Chat.tsx
2. Update the file with the necessary configuration for the vision model.

---

## 📂 Project Structure

```plaintext
src/
├── components/
│   └── Chat.tsx   # Main chat component
├── assets/        # Optional: Add image assets here
...

🧰 Troubleshooting
Ollama not detected?
Make sure Ollama is installed and running in the background. Check the installation guide on Ollama's website.[https://ollama.com/download]

Model errors?
Confirm that you’ve installed a compatible local model through Ollama.

✨ Features
Runs Locally
ChatBot UI leverages your system's local resources for running AI models. No external API is required.

Customizable
Extend functionality easily by adding vision or other advanced models.

Simple & Lightweight
Designed with simplicity in mind, this UI is ideal for quick deployment and experimentation.

💡 Contributions
Have an idea or found an issue? Feel free to open a pull request or an issue on this repository. Contributions are always welcome!

📜 License
This project is licensed under the MIT License.

This version is structured, concise, and uses proper headings, bullet points, and formatting to enhance readability for GitHub users. Let me know if you'd like further edits or additions!
