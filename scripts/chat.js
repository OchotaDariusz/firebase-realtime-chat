class Chatroom {
    constructor(room, username){
        this.room = room;
        this.username = username;
        this.chats = db.collection('chats');
        this.unsub;
    }
    async addChat(message){
        const now = new Date();
        const chat = {
            message,
            username: this.username,
            room: this.room,
            created_at: firebase.firestore.Timestamp.fromDate(now)
        };
        const response = await this.chats.add(chat);
        return response;
    }
    getChats(callback){
        this.unsub = this.chats
            .where('room', '==', this.room)
            .orderBy('created_at')
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if(change.type === 'added'){
                        callback(change.doc.data());
                        this.clearChat();
                    }
                });
            });
    }
    updateName(username){
        this.username = username;
        localStorage.setItem('username', username);
    }
    updateRoom(room){
        this.room = room;
        console.log('room updated');
        if(this.unsub){
            this.unsub();
        }
    }
    clearChat(){
        this.chats
            .where('room', '==', this.room)
            .orderBy('created_at')
            .get()
            .then(snapshot => {
                if(snapshot.docs.length > 5){
                    let idToRemove = snapshot.docs[0].id;
                    this.removeChat(idToRemove);
                    this.clearChat();
                    chatUI.clear();
                    this.getChats(chat => chatUI.render(chat));
                }
            })
            .catch(err => console.log(err.message));
    }
    removeChat(messageID){
        this.chats.doc(messageID).delete().then(() => {
            console.log('message', messageID, 'removed');
        }).catch(err => console.log(err.message));
    }
}
