const chatList = document.querySelector('.chat-list');
const newChatForm = document.querySelector('.new-chat');
const newNameForm = document.querySelector('.new-name');
const updateMssg = document.querySelector('.update-mssg');
const rooms = document.querySelector('.chat-rooms');

newChatForm.addEventListener('submit', event => {
    event.preventDefault();
    const message = newChatForm.message.value.trim();
    chatroom.addChat(message)
        .then(() => {
            newChatForm.reset();
        })
        .catch(err => console.log(err.message));
});

newNameForm.addEventListener('submit', event => {
    event.preventDefault();
    const newName = newNameForm.name.value.trim();
    chatroom.updateName(newName);
    newNameForm.reset();
    updateMssg.innerText = `Your name was updated to ${newName}`;
    setTimeout(() => updateMssg.innerText = '', 3000);
});

rooms.addEventListener('click', event => {
    if (event.target.tagName === "BUTTON") {
        chatUI.clear();
        chatroom.updateRoom(event.target.getAttribute('id'));
        chatroom.getChats(chat => chatUI.render(chat));
    }
});

const username = localStorage.username ? localStorage.username : 'Anonymous';

const chatUI = new ChatUI(chatList);
const chatroom = new Chatroom('general', username);

chatroom.getChats(chat => chatUI.render(chat));

const minute = 60000;
setInterval(() => {
    chatUI.clear();
    chatroom.getChats(chat => chatUI.render(chat));
}, minute);
