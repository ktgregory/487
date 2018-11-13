import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { AuthProvider } from '../../providers/auth/auth';
import { ChatroomPage } from '../chatroom/chatroom';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { AngularFirestore } from 'angularfire2/firestore';
import { EventInfoProvider } from '../../providers/event-info/event-info';

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})
export class MessagesPage {

  userID: string;
  chats = [];
  noChats = false;
  markThreads = false;
  display = false;

  constructor(public navCtrl: NavController, private chat: ChatProvider,
    private authData: AuthProvider, private userInfo: UserinfoProvider,
    private afs: AngularFirestore, private eventInfo: EventInfoProvider) {
  }

  async ngOnInit()
  {
    this.userID = this.authData.getUserID();
    await this.getChatsByUserID(this.userID);
    if (this.chats.length == 0) this.noChats = true;
    this.chats.forEach(chat=>
      {
        this.getChatUpdateByThreadID(chat.threadID, chat.date);
      });
  }


  async ionViewWillEnter()
  {
    this.refreshChats(this.userID);
  }

  async getChatSender(chat, deleteBool)
  {
    // Adds the other user's name to the chat to be displayed 
    // to the current user. 
    if (chat.greaterID == this.userID) 
    {
      chat.senderID = chat.lesserID;
      chat.unread = chat.unreadByGreater;
    }
    else 
    {
      chat.senderID = chat.greaterID;
      chat.unread = chat.unreadByLesser;
    }
    chat.senderName = await this.userInfo.getUserNameByID(chat.senderID);
    chat.senderImage = await this.userInfo.getUserImageByID(chat.senderID);
    chat.delete = deleteBool;
    chat.dateString = this.eventInfo.getTimeString(chat);
    return chat;
  }




  goToChat(threadID:string, senderID:string, userID:string, 
    senderName:string, senderImage:string, eventName:string, topic:string)
  {
    // When marking threads to delete, this prevents 
    // the user from unintentionally navigating to the
    // Chatroom page. 
    if(!this.markThreads)
    {
      // Pushes relevant parameters to the Chatroom page
      // when navigating. 
      this.navCtrl.push(ChatroomPage, {
        'threadID': threadID,
        'senderID': senderID,
        'userID': userID,
        'senderName': senderName,
        'senderImage': senderImage,
        'eventName': eventName,
        'topic':topic
       });
    }
  }

  // Incomplete. 
  displayThread(chat)
  {
    if ((chat.greaterID == this.userID) && (chat.deletedByGreater==false)) 
      this.display=true;
    if ((chat.lesserID == this.userID) && (chat.deletedByLesser==false)) 
      this.display=true;
  }


  // If a user presses the "Edit" button, 
  // this makes the conditon true that allows the 
  // user to select threads to delete. 
  markThreadsToDelete()
  {
    this.markThreads = true;
  }


  // Incomplete. 
  async deleteSelectedChats()
  {
    this.chats.forEach(async chat=>
    {

        if(chat.delete == true)
        {
          // if (chat.greaterID == this.userID) chat.senderID = chat.lesserID;
          // else chat.senderID = chat.greaterID;
          // await this.chat.deleteThread(chat.threadID);
        }
    });

    this.markThreads = false;
  }

  setToDelete(chat)
  {
    // If a user taps a thread, this will mark it 
    // to be deleted.
    chat.delete = true;
  }

  resetDelete(chat)
  {
    // If a user taps the button that appears after 
    // they have marked a thread to be deleted, this
    // "unselects" the thread. 
    chat.delete = false;
  }

  cancelDelete()
  {
    // If a user does not wish to delete any threads, 
    // the threads that were marked to be deleted 
    // must be unmarked. 
    this.markThreads = false;
    this.chats.forEach(chat=>
    {
      chat.delete = false;
    });
  }

  async getChatsByUserID(userID:string)
  {
    // Queries chats, which must be done twice
    // because the user's ID may be either the "lesser"
    // or the "greater" ID. It may be possible to combine
    // these queries.
    let chatQuery = await this.afs.firestore.collection('chats')
    .where("greaterID","==",userID);
    await chatQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {

        if (change.type === "added") 
        {
          this.chats.push(await this.getChatSender(change.doc.data(),false));
          if(this.noChats==true) this.noChats=false;
          this.chats.sort(this.chat.compareTimestampsChats);
        }

        if (change.type === "removed") 
        {
         this.chats = this.chats.filter(
           item => item != (this.getChatSender(change.doc.data(),true)));
          if (this.chats.length==0) this.noChats = true;
          this.chats.sort(this.chat.compareTimestampsChats);
        }  
      });
    });


    chatQuery = await this.afs.firestore.collection('chats')
    .where("lesserID","==",userID);
    await chatQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {

        if (change.type === "added") 
        {
          this.chats.push(await this.getChatSender(change.doc.data(),false));
          this.chats.sort(this.chat.compareTimestampsChats);
          if(this.noChats==true) this.noChats=false;
        }
        if (change.type === "removed") 
        {
          this.chats = this.chats.filter(
            item => item != (this.getChatSender(change.doc.data(),true)));
            this.chats.sort(this.chat.compareTimestampsChats);
          if (this.chats.length==0) this.noChats = true;
        }  
      });
    });
  }

  async getChatUpdateByThreadID(threadID:string, date)
  {
   
   // Listener that checks each chat for new messages
   // if a new message is received, update the relevant chat.
   // (will need a similar function in notification center)
    // Called every time a chat is add to the chats array.
    let messageQuery = await this.afs.firestore.collection('chats')
    .doc(threadID).collection('messages');

    await messageQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {
          await this.updateChat(threadID, change.doc.data());
      });
    });
  }

  async updateChat(threadID:string, docData)
  {
    this.chats.forEach(chat=>
    {
      if(chat.threadID == threadID)
      {
        chat.dateString = this.eventInfo.getTimeString(docData);
        chat.messagePreview = docData.messageText.substring(0,9) + "...";
        chat.unread=true;
      }
    });

    this.chats.sort(this.chat.compareTimestampsChats);
    // reload chats message preview and timestamp
  }

  async updateChatWithChatDoc(docData)
  {
    this.chats.forEach(chat=>
    {
      if(chat.threadID == docData.threadID)
      {
        chat.dateString = this.eventInfo.getTimeString(docData);
        chat.messagePreview = docData.messagePreview;
        chat.unread=false;
        this.chats.sort(this.chat.compareTimestampsChats);
      }
    });
    // reload chats message preview and timestamp
  }

  async refreshChats(userID:string)
  {
    let chatQuery = await this.afs.firestore.collection('chats')
    .where("greaterID","==",userID);
    await chatQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {

        this.updateChatWithChatDoc(change.doc.data());
         // this.chats.push(await this.getChatSender(change.doc.data(),false));
        
      });
    });


    chatQuery = await this.afs.firestore.collection('chats')
    .where("lesserID","==",userID);
    await chatQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {
        this.updateChatWithChatDoc(change.doc.data());
      });
    });
  }
}
