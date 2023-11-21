const chatInput = document.querySelector("#chat-input"),
  sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container"),
  themeButton = document.querySelector("#theme-btn"),
  deleteButton = document.querySelector("#delete-btn");

let userText = null,
  loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("themeColor");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode")
      ? "dark_mode"
      : "light_mode";
    const defaultText =
      '<div class="default-text">\n<h1>Bardie</h1>\n<p>Start a conversation and explore the power of AI.<br>Your chat history will be displayed here.</p>\n<br><a href="/developer">API for Developers</a> </div>';
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  },
  createChatElement = (_0x20c705, _0x8e5a7f) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", _0x8e5a7f);
    chatDiv.innerHTML = _0x20c705;
    return chatDiv;
  },
  getChatResponse = async (_0x524118) => {
    const apiUrl = "/backend/conversation";
    const requestData = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ask: userText }),
    };

    const responseParagraph = document.createElement("p");
    try {
      const apiResponse = await fetch(apiUrl, requestData);

      if (!apiResponse.ok) {
        throw new Error("Error from AI model API");
      }

      let { result: ai } = await apiResponse.json();
      const responseText = ai.contentWithHtml
        .replace(/\*\*/gi, "")
        .replace(/\*\s/gi, "");
      responseParagraph.textContent = responseText;
    } catch (error) {
      responseParagraph.classList.add("error");
      responseParagraph.textContent =
        "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    _0x524118.querySelector(".typing-animation").remove();
    _0x524118.querySelector(".chat-details").appendChild(responseParagraph);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Revert the chat-input to normal opacity
    chatInput.style.opacity = "1";
  },
  copyResponse = (_0x1b9ba4) => {
    const copiedText = _0x1b9ba4.parentElement.querySelector("p").textContent;
    navigator.clipboard.writeText(copiedText);
    _0x1b9ba4.textContent = "done";
    setTimeout(() => (_0x1b9ba4.textContent = "content_copy"), 1000);
  },
  showTypingAnimation = async () => {
    // Darken the chat-input
    chatInput.style.opacity = "0.5";

    const typingAnimationDiv = `
      <div class="chat-content">
        <div class="chat-details">
          <img src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif" alt="chatbot-img">
          <div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
          </div>
        </div>
        <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
      </div>`;
    const typingElement = createChatElement(typingAnimationDiv, "incoming");
    chatContainer.appendChild(typingElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    await getChatResponse(typingElement);
  },
  handleOutgoingChat = async () => {
    userText = chatInput.value.trim();

    if (!userText) {
      // Use SweetAlert to show an alert for empty input
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a message before sending!",
      });
      return;
    }

    // Disable input and button during asynchronous operation
    chatInput.disabled = true;
    sendButton.disabled = true;

    try {
      chatInput.value = "";
      chatInput.style.height = initialInputHeight + "px";
      const outgoingChatDiv = `
        <div class="chat-content">
          <div class="chat-details">
            <img src="https://www.gravatar.com/avatar" alt="user-img">
            <p>${userText}</p>
          </div>
        </div>`;
      const outgoingElement = createChatElement(outgoingChatDiv, "outgoing");
      chatContainer.querySelector(".default-text")?.remove();
      chatContainer.appendChild(outgoingElement);
      chatContainer.scrollTo(0, chatContainer.scrollHeight);

      await showTypingAnimation(); // Wait for the typing animation to complete
    } finally {
      // Enable input and button regardless of success or failure
      chatInput.disabled = false;
      sendButton.disabled = false;
    }
  };

const handleDeleteChat = () => {
  const allChats = localStorage.getItem("all-chats");
  if (allChats && allChats.trim() !== "") {
    // Menggunakan SweetAlert untuk konfirmasi sebelum menghapus riwayat pesan
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete all chat history!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleting Chat History...",
          icon: "info",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          localStorage.removeItem("all-chats");
          loadDataFromLocalstorage();
          Swal.fire(
            "Deleted!",
            "Your chat history has been deleted.",
            "success",
          );
        });
      }
    });
  } else {
    Swal.fire({
      icon: "info",
      title: "Info",
      text: "No chat history to delete!",
    });
  }
};

deleteButton.addEventListener("click", handleDeleteChat);

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("themeColor", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  chatInput.style.height = initialInputHeight + "px";
  chatInput.style.height = chatInput.scrollHeight + "px";
});

chatInput.addEventListener("keydown", (_0x174fe5) => {
  if (
    _0x174fe5.key === "Enter" &&
    !_0x174fe5.shiftKey &&
    window.innerWidth > 800
  ) {
    _0x174fe5.preventDefault();
    handleOutgoingChat();
  }
});

loadDataFromLocalstorage();

sendButton.addEventListener("click", handleOutgoingChat);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/assets/js/service-worker.js")
    .then((registration) => {
      console.log("Service Worker registered");
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}
