// INCOMPLETE.

import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';


@Injectable()
export class ChatProvider {

  constructor(private afs: AngularFirestore){}

  async startThread(ID1:string, ID2: string, eventName:string)
  {

    // Creates the thread ID by adding the two user ID's together
    // and the first five characters of the event name.
    // Whichever idea is the greater of the two is added first.
    // The first five characters of the event name are used because
    // it's possible for two users to have multiple different chats 
    // about different events. 
    let greaterID, lesserID;
    let threadID = this.makeThreadID(ID1, ID2, eventName);
    if(ID1 > ID2)
    {
      greaterID = ID1; 
      lesserID = ID2;
    }
    else
    {
      greaterID = ID2;
      lesserID = ID1;
    }
    
    await this.afs.collection('chats').doc(threadID).set(
      {
          threadID: threadID,
          greaterID: greaterID,
          lesserID: lesserID,
          deletedByGreater: false,
          deletedByLesser: false,
          topic: eventName,
          unreadByLesserCount: 1,
          unreadByGreaterCount: 1,
          messagePreview: "New chat!",
          date: new Date() // last update is the current time. 
                            // Will be updated as new messges
                            // are sent. 
      }
    );
    return; 
  }

  makeThreadID(ID1:string, ID2:string, eventName:string)
  {
    // Makes thread ID based on values of the two users' IDs.
    let threadID;
    if(ID1 > ID2)
    {
      threadID = ID1 + ID2 + eventName[5];
    }
    else
    {
      threadID = ID2 + ID1 + eventName[5];
    }
    return threadID;
  }

  sendMessage(text:string, senderID:string, receiverID:string, 
    eventName:string)
  {
    // Creates a new message in the database under the corresponding
    // chat (thread) document, and updates the lastUpdate attribute of
    // the chat. 
    let threadID = this.makeThreadID(senderID, receiverID, eventName);
    let messageID = this.afs.createId();
    let currentTime = new Date();
    this.afs.collection('chats').doc(threadID).collection('messages')
    .doc(messageID).set(
      {
        messageText: text,
        senderID: senderID,
        receiverID: receiverID,
        date: currentTime,
        messageID: messageID
      }
    );
    if(text.length > 23)
      text = text.substring(0,20) + "...";
    if(receiverID<senderID)
    {
      let count;
      this.afs.collection('chats').doc(threadID).get().subscribe(doc=>
      {
        count = doc.data().unreadByLesserCount;
        count++;
        this.afs.collection('chats').doc(threadID).update(
          {
            date: currentTime,
            messagePreview: text,
            unreadByLesserCount:count
          }
        );
      });
    }
    else
    {
      let count;
      this.afs.collection('chats').doc(threadID).get().subscribe(doc=>
      {
        count = doc.data().unreadByGreaterCount;
        count++;
        this.afs.collection('chats').doc(threadID).update(
          {
            date: currentTime,
            messagePreview: text,
            unreadByGreaterCount:count
          }
        );
      });

    }

  }

  deleteThread(threadID:string)
  {
    // Removes a chat by its ID from the database. 
    this.afs.collection('chats').doc(threadID).delete();
  }
  
  compareTimestamps(ob1, ob2)
  {
    // Comparison used to sort messages.
   return ob1.date.seconds - ob2.date.seconds;
  }
    
  compareTimestampsChats(ob1, ob2)
  {
    // Comparison used to sort chats. 
   return ob2.date.seconds - ob1.date.seconds;
  }


  async getMessagesByThreadID(threadID:string)
  {
    // Returns the sorted messages according to the passed ID.
    let messages = [];
    let messageQuery = await this.afs.firestore.collection('chats')
    .doc(threadID).collection('messages');
    await messageQuery.get().then(( querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          await messages.push(doc.data());
      });
    });
    return messages.sort(this.compareTimestamps);
  }

  // async getMessageUpdatesByThreadID(threadID:string)
  // {
  //   let messages = [];
  //   let messageQuery = await this.afs.firestore.collection('chats')
  //   .doc(threadID).collection('messages');
  //   await messageQuery.onSnapshot((querySnapshot) => {
  //       querySnapshot.forEach((doc) => {
  //         messages.push(doc.data());
  //     });
  //   });
  //   return await messages;
  // }
}

//SOURCE: https://firebase.google.com/docs/firestore/data-model#subcollections