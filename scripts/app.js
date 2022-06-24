import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import {
    getFirestore, collection, doc, onSnapshot, getDocs, addDoc, deleteDoc,
    query, where, orderBy
} from "https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js";

const config = {
    apiKey: "AIzaSyCDslrkGhG_ceQtbBOnnA9Q3Ouz-kaHjqA",
    authDomain: "real-time-chatroom-6cd19.firebaseapp.com",
    projectId: "real-time-chatroom-6cd19",
    storageBucket: "real-time-chatroom-6cd19.appspot.com",
    messagingSenderId: "237264525690",
    appId: "1:237264525690:web:3aaaafef2af4d426ae5ec3"
};

initializeApp(config);

const db = getFirestore();

class Chatroom {
    constructor(room, username) {
        this.room = room;
        this.username = username;
        this.chats = collection(db, 'chats');
        this.unsub;
    }
    async addChat(message) {
        const chat = {
            message,
            username: this.username,
            room: this.room,
            created_at: new Date()
        };
        return await addDoc(this.chats, chat);
    }
    getChats(callback) {
        const queryResults = query(
            this.chats,
            where('room', '==', this.room),
            orderBy('created_at')
        );
        this.unsub = onSnapshot(queryResults, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    callback(change.doc.data());
                    this.clearChat();
                }
            });
        })
    }
    updateName(username) {
        this.username = username;
        localStorage.setItem('username', username);
    }
    updateRoom(room) {
        this.room = room;
        console.log('room updated');
        if (this.unsub) {
            this.unsub();
        }
    }
    clearChat() {
        const queryResults = query(
            this.chats,
            where('room', '==', this.room),
            orderBy('created_at')
        );
        getDocs(queryResults)
            .then(snapshot => {
                if (snapshot.docs.length > 5) {
                    let idToRemove = snapshot.docs[0].id;
                    this.removeChat(idToRemove);
                    this.clearChat();
                    chatUI.clear();
                    this.getChats(chat => chatUI.render(chat));
                }
            })
            .catch(err => console.log(err.message));
    }
    removeChat(messageID) {
        const docRef = doc(db, 'chats', messageID);
        deleteDoc(docRef)
            .then(() => {
                console.log('message', messageID, 'removed');
            })
            .catch(err => console.log(err.message));
    }
}

class ChatUI {
    constructor(list) {
        this.list = list;
    }
    clear() {
        this.list.innerHTML = '';
    }
    render(data) {
        const when = dateFns.distanceInWordsToNow(
            data.created_at.toDate(),
            { addSuffix: true }
        );
        const html = `
            <li class="list-group-item">
                <span class="username">${data.username}</span>
                <span class="message">${data.message}</span>
                <div class="time">${when}</div>
            </li>
        `;

        this.list.innerHTML += html;
    }
}

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
            chatUI.clear();
            chatroom.getChats(chat => chatUI.render(chat));
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
        chatroom.getChats((chat) => {
            chatUI.render(chat)
        }, chatUI.clear);
    }
});

const username = localStorage.username ? localStorage.username : 'Anonymous';

const chatUI = new ChatUI(chatList);
const chatroom = new Chatroom('general', username);

chatroom.getChats(chat => {
    chatUI.render(chat)
}, chatUI.clear);

const minute = 60000;
setInterval(() => {
    chatUI.clear();
    chatroom.getChats(chat => {
        chatUI.render(chat)
    }, chatUI.clear);
}, minute);
