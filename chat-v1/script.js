const chatForm = document.getElementById("chatForm");
const promptInput = document.getElementById("prompt");
const chatBox = document.getElementById("chatBox");

function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.textContent = text;

    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prompt = promptInput.value.trim();
    if (!prompt) return;

    addMessage(prompt, "user");
    promptInput.value = "";

    addMessage("Thinking...", "ai");

    try {
        const response = await fetch("chat.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        // Remove "Thinking..."
        chatBox.lastChild.remove();

        addMessage(data.response || "No response received.", "ai");

    } catch (error) {
        chatBox.lastChild.remove();
        addMessage("⚠️ Error connecting to server.", "ai");
    }
});
