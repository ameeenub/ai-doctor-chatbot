document.addEventListener("DOMContentLoaded", function () {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  // Configuration
  const DEEPSEEK_API_KEY = "sk-a190f20acd4e4290a05a212a458c6f25"; // REPLACE WITH YOUR ACTUAL API KEY
  const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

  // Check for saved theme preference
  const currentTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateDarkModeButton(currentTheme);

  // Initial greeting with typewriter effect
  typewriterMessage("Hello! I'm Dr. AI. How can I help you today?", "bot");

  // Dark mode toggle
  darkModeToggle.addEventListener("click", toggleDarkMode);

  // Send message when button is clicked
  sendBtn.addEventListener("click", sendMessage);

  // Send message when Enter is pressed
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Conversation history
  let conversationHistory = [
    {
      role: "system",
      content:
        "You are an AI medical assistant. Provide helpful medical information but always remind users to consult with real doctors for serious concerns. Be concise but compassionate. Use simple language and provide information in a structured way.",
    },
  ];

  async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addUserMessage(message);
      userInput.value = "";

      // Add user message to history
      conversationHistory.push({
        role: "user",
        content: message,
      });

      // Show typing indicator
      const typingIndicator = addTypingIndicator();

      try {
        const botResponse = await getAIResponse(message);

        // Remove typing indicator
        chatBox.removeChild(typingIndicator);

        // Display response with typewriter effect
        await typewriterMessage(botResponse, "bot");

        // Add AI response to history
        conversationHistory.push({
          role: "assistant",
          content: botResponse,
        });
      } catch (error) {
        console.error("API Error:", error);
        chatBox.removeChild(typingIndicator);
        addBotMessage(
          "Sorry, I'm having trouble connecting to the medical knowledge base. Please try again later."
        );
      }
    }
  }

  function addUserMessage(text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "user-message");
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function addBotMessage(text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "bot-message");
    messageDiv.innerHTML = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function addTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message");
    typingDiv.id = "typing-indicator";

    const typingContent = document.createElement("div");
    typingContent.classList.add("typing");

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.classList.add("typing-dot");
      typingContent.appendChild(dot);
    }

    typingDiv.appendChild(typingContent);
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
  }

  async function typewriterMessage(text, sender) {
    return new Promise((resolve) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", sender + "-message");
      chatBox.appendChild(messageDiv);

      let i = 0;
      const speed = 20; // typing speed in milliseconds
      const cursorSpan = document.createElement("span");
      cursorSpan.classList.add("typewriter-cursor");
      messageDiv.appendChild(cursorSpan);

      function typeWriter() {
        if (i < text.length) {
          // Replace cursor with next character
          messageDiv.removeChild(cursorSpan);
          messageDiv.innerHTML += text.charAt(i);
          messageDiv.appendChild(cursorSpan);
          i++;
          setTimeout(typeWriter, speed);
        } else {
          // Remove cursor when done
          messageDiv.removeChild(cursorSpan);
          resolve();
        }
        chatBox.scrollTop = chatBox.scrollHeight;
      }

      typeWriter();
    });
  }

  async function getAIResponse(userMessage) {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateDarkModeButton(newTheme);
  }

  function updateDarkModeButton(theme) {
    const icon = darkModeToggle.querySelector("i");
    if (theme === "dark") {
      icon.classList.replace("fa-moon", "fa-sun");
    } else {
      icon.classList.replace("fa-sun", "fa-moon");
    }
  }
});
