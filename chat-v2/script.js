// DOM Elements
const chatForm = document.getElementById("chatForm");
const promptInput = document.getElementById("prompt");
const chatBox = document.getElementById("chatBox");
const messageCount = document.querySelector('.message-count');

// Focus on input field on load
window.addEventListener('load', () => {
    promptInput.focus();
});

// Add message function
function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (sender === "ai") {
        bubble.innerHTML = `
            <div class="message-content">
                <span class="typing"></span>
            </div>
            <span class="message-time">${timestamp}</span>
        `;
        
        messageDiv.appendChild(bubble);
        chatBox.appendChild(messageDiv);
        
        // Typewriter effect
        typeWriter(bubble.querySelector('.typing'), text);
    } else {
        bubble.innerHTML = `
            <div class="message-content">${text}</div>
            <span class="message-time">${timestamp}</span>
        `;
        
        messageDiv.appendChild(bubble);
        chatBox.appendChild(messageDiv);
    }
    
    // Update message count
    updateMessageCount();
    
    // Scroll to bottom
    scrollToBottom();
}

// Typewriter effect
function typeWriter(element, text) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, 20); // Typing speed
        }
    }
    
    type();
}

// Update message count
function updateMessageCount() {
    const messages = document.querySelectorAll('.message').length;
    if (messageCount) {
        messageCount.textContent = messages;
    }
}

// Scroll to bottom
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Form submission
chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    console.log("Submitting:", prompt); // Debug log

    // Add user message
    addMessage(prompt, "user");
    
    // Clear input
    promptInput.value = "";
    
    // Focus back on input
    promptInput.focus();

    // Add thinking message
    const thinkingDiv = document.createElement("div");
    thinkingDiv.classList.add("message", "ai");
    thinkingDiv.innerHTML = `
        <div class="bubble">
            <div class="thinking">
                <div class="thinking-dots">
                    <span></span><span></span><span></span>
                </div>
                Thinking...
            </div>
        </div>
    `;
    chatBox.appendChild(thinkingDiv);
    
    scrollToBottom();

    try {
        const response = await fetch("chat.php", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        console.log("Response status:", response.status); // Debug log

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response data:", data); // Debug log

        // Remove thinking message
        thinkingDiv.remove();

        // Add AI response
        addMessage(data.response || "No response received.", "ai");

    } catch (error) {
        console.error("Error:", error);
        
        // Remove thinking message
        thinkingDiv.remove();
        
        // Add error message
        const errorDiv = document.createElement("div");
        errorDiv.classList.add("message", "ai");
        errorDiv.innerHTML = `
            <div class="bubble">
                <i class="fas fa-exclamation-triangle"></i>
                Connection error. Please try again.
            </div>
        `;
        chatBox.appendChild(errorDiv);
        
        scrollToBottom();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter to send
    if (e.ctrlKey && e.key === 'Enter') {
        chatForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
        promptInput.value = '';
        promptInput.focus();
    }
});

// Update latency every few seconds
function updateLatency() {
    const latencyElement = document.querySelector('.latency');
    if (latencyElement) {
        const latency = Math.floor(Math.random() * 20) + 10; // Simulated 10-30ms
        latencyElement.textContent = `${latency}ms`;
    }
}

// Initialize
updateLatency();
setInterval(updateLatency, 5000);
updateMessageCount();

// Make sure input is always focusable
promptInput.addEventListener('blur', () => {
    setTimeout(() => {
        if (document.activeElement !== promptInput) {
            promptInput.focus();
        }
    }, 100);
});

// Debug: Log when page loads
console.log("Chat interface loaded");
console.log("Form element:", chatForm);
console.log("Input element:", promptInput);