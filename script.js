let users = JSON.parse(localStorage.getItem("users") || "{}");
let messages = JSON.parse(localStorage.getItem("messages") || "[]");
let currentUser = "";

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("messages", JSON.stringify(messages));
}

function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username.length < 3 || password.length < 6) {
        alert("Username needs 3 characters and password needs 6.");
        return;
    }

    if (users[username]) {
        alert("Username already exists!");
        return;
    }

    // Demonstration only: do not store real passwords this way.
    users[username] = password;
    saveData();

    alert("Account created successfully!");
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (users[username] !== password) {
        document.getElementById("authMessage").textContent =
            "Invalid username or password.";
        return;
    }

    currentUser = username;

    document.getElementById("auth").hidden = true;
    document.getElementById("messenger").hidden = false;
    document.getElementById("currentUser").textContent = username;

    displayMessages();
}

function logout() {
    currentUser = "";
    document.getElementById("auth").hidden = false;
    document.getElementById("messenger").hidden = true;
}

function sendMessage() {
    const recipient = document.getElementById("recipient").value.trim();
    const text = document.getElementById("message").value.trim();
    const seconds = Number(document.getElementById("lifetime").value);

    if (!users[recipient]) {
        alert("Recipient account does not exist!");
        return;
    }

    if (recipient === currentUser) {
        alert("Choose another recipient.");
        return;
    }

    if (!text) {
        alert("Please enter a message.");
        return;
    }

    const now = Date.now();

    messages.push({
        sender: currentUser,
        recipient: recipient,
        text: text,
        createdAt: now,
        expiresAt: now + seconds * 1000
    });

    saveData();

    document.getElementById("message").value = "";
    document.getElementById("sendStatus").textContent =
        "Message sent successfully!";

    displayMessages();
}

function displayMessages() {
    const inbox = document.getElementById("inbox");
    const now = Date.now();

    messages = messages.filter(m => m.expiresAt > now);
    saveData();

    inbox.innerHTML = "";

    const received = messages.filter(
        m => m.recipient === currentUser
    );

    if (received.length === 0) {
        inbox.textContent = "No active messages.";
        return;
    }

    received.forEach((m) => {
        const card = document.createElement("div");
        card.className = "message-card";

        const sender = document.createElement("strong");
        sender.textContent = "From: " + m.sender;

        const content = document.createElement("p");
        content.textContent = m.text;

        const timer = document.createElement("p");
        timer.className = "timer";

        card.append(sender, content, timer);
        inbox.appendChild(card);

        function updateTimer() {
            const remaining = Math.max(
                0, Math.ceil((m.expiresAt - Date.now()) / 1000)
            );

            timer.textContent = "Self-destruct in: " + remaining + "s";

            if (remaining <= 0) {
                messages = messages.filter(item => item !== m);
                saveData();
                card.remove();

                if (!inbox.children.length) {
                    inbox.textContent = "No active messages.";
                }
            } else {
                setTimeout(updateTimer, 250);
            }
        }

        updateTimer();
    });
}

// Remove expired messages when the page is opened or refreshed.
setInterval(() => {
    const previousLength = messages.length;
    messages = messages.filter(m => m.expiresAt > Date.now());

    if (messages.length !== previousLength) {
        saveData();
        if (currentUser) displayMessages();
    }
}, 1000);