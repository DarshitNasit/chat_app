const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const socket = io();

// Get username and room from form
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const user = {
  username: username,
  room: room,
};

// Join chat room
socket.emit("joinRoom", user);

socket.on("message", (messageObj) => {
  insert_message(messageObj);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("roomUsers", ({ room, users }) => {
  displayRoom(room);
  displayUsers(users);
});

// Click on send button
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Extracting message
  const message = event.target.elements.msg.value;

  // Send message to server
  socket.emit("chat-message", { username, room, message });

  // Clearing chat input and focusing there
  event.target.elements.msg.value = "";
  event.target.elements.msg.focus();
});

const insert_message = (messageObj) => {
  const new_div = document.createElement("div");
  new_div.classList.add("message");
  new_div.innerHTML = `
    <p class="meta">
    ${messageObj.username} <span>${messageObj.time}</span>
    </p>
    <p class='text'>
      ${messageObj.message}
    </p>
  `;
  chatMessages.appendChild(new_div);
};

const displayRoom = (room) => {
  roomName.innerText = room;
};

const displayUsers = (users) => {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
};
