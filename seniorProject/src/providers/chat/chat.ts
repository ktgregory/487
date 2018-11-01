import { Injectable } from '@angular/core';
import { AuthProvider } from '../auth/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { convertUrlToDehydratedSegments } from 'ionic-angular/umd/navigation/url-serializer';

//https://firebase.google.com/docs/firestore/data-model#subcollections

@Injectable()
export class ChatProvider {

  constructor(private authData: AuthProvider, private afs: AngularFirestore) {
    
  }

  startThread(ID1:string, ID2: string)
  {
    let threadID, greaterID, lesserID;
    if(ID1 > ID2)
    {
      greaterID = ID1; 
      lesserID = ID2;
      threadID = ID1 + ID2;
    }
    else
    {
      greaterID = ID2;
      lesserID = ID1;
      threadID = ID2 + ID1;
    }
    
    this.afs.collection('chats').doc(threadID).set(
      {
          threadID: threadID,
          greaterID: greaterID,
          lesserID: lesserID,
          deletedByGreater: false,
          deletedByLesser: false
      }
    );
  }

  // a thread should have an id, a greaterID, a lesserID, deletedByGreater, deletedByLesser 

  makeThreadID(ID1:string, ID2:string)
  {
    let threadID;
    if(ID1 > ID2)
    {
      threadID = ID1 + ID2;
    }
    else
    {
      threadID = ID2 + ID1;
    }
    return threadID;
  }


  sendMessage(text:string, senderID:string, receiverID:string)
  {
    let threadID = this.makeThreadID(senderID, receiverID);
    let messageID = this.afs.createId();
    this.afs.collection('chats').doc(threadID).collection('messages').doc(messageID).set(
      {
        messageText: text,
        senderID: senderID,
        receiverID: receiverID,
        timestamp: new Date(),
        messageID: messageID
      }
    );
  //  return this.afs.collection('chats').doc(threadID).collection('messages').doc(messageID);
  }

  deleteThread(threadID:string)
  {
    this.afs.collection('chats').doc(threadID).delete();
  }

  async getChatsByUserID(userID:string)
  {
    let chats = [];
    let chatQuery = await this.afs.firestore.collection('chats').where("greaterID","==",userID);
    await chatQuery.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          chats.push(doc.data());
      });
    });

    chatQuery = await this.afs.firestore.collection('chats').where("lesserID","==",userID);
    await chatQuery.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          chats.push(doc.data());
      });
    });
    return chats;
  }

  async getMessagesByThreadID(threadID:string)
  {
    let messages = [];
    let messageQuery = await this.afs.firestore.collection('chats').doc(threadID).collection('messages');
    await messageQuery.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          messages.push(doc.data());
      });
    });

    return messages;
  }

  async getMessageUpdatesByThreadID(threadID:string)
  {
    let messages = [];
    let messageQuery = await this.afs.firestore.collection('chats').doc(threadID).collection('messages');
    await messageQuery.onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          messages.push(doc.data());
          
      });
    });
    
    return await messages;

  }

}
