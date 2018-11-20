import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { AuthProvider } from '../../providers/auth/auth';
import { ChatroomPage } from '../chatroom/chatroom';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { AngularFirestore } from 'angularfire2/firestore';
import { TimeDateCalculationsProvider } from '../../providers/time-date-calculations/time-date-calculations';


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
    private afs: AngularFirestore,
    private timeInfo: TimeDateCalculationsProvider) {
  }

  async ngOnInit()
  {
    this.userID = this.authData.getUserID();
    await this.getChatsByUserID(this.userID);
    if (this.chats.length == 0) this.noChats = true;
  }


  async ionViewWillEnter()
  {
    //this.refreshChats(this.userID);
  }

  async getChatSender(chat, deleteBool)
  {
    // Adds the other user's name to the chat to be displayed 
    // to the current user. 
    if (chat.greaterID == this.userID) 
    {
      chat.senderID = chat.lesserID;
      chat.unread = (chat.unreadByGreaterCount>0);
    }
    else 
    {
      chat.senderID = chat.greaterID;
      chat.unread = (chat.unreadByLesserCount>0);
    }
    chat.senderName = await this.userInfo.getUserNameByID(chat.senderID);
    chat.senderImage = await this.userInfo.getUserImageByID(chat.senderID);
    chat.delete = deleteBool;
    chat.dateString = this.timeInfo.getTimeString(chat);
    return chat;
  }


  goToChat(chat, threadID:string, senderID:string, userID:string, 
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
       chat.unread=false;
       if(this.userID<senderID)
        this.afs.collection('chats').doc(threadID).update({unreadByLesserCount:0});
       else
        this.afs.collection('chats').doc(threadID).update({unreadByGreaterCount:0});
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

  deletedByThisUser(chat)
  {
    if(chat.lesserID==this.userID && chat.deletedByLesser==true)
      this.removeChat(chat);
    if(chat.greaterID == this.userID && chat.deletedByGreater==true)
      this.removeChat(chat);
    if(this.chats.length==0)
      this.noChats=true;
  }

  // Incomplete. 
  async deleteSelectedChats()
  {
    this.chats.forEach(async chat=>
    {
        if(chat.delete == true)
        {
          if(this.userID == chat.greaterID)
            await this.afs.collection('chats').doc(chat.threadID).update({deletedByGreater:true});
          else
            await this.afs.collection('chats').doc(chat.threadID).update({deletedByLesser:true});  
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
          this.deletedByThisUser(change.doc.data());
        }

        if (change.type === "removed") 
        {
          this.removeChat(change.doc.data());
          if (this.chats.length==0) this.noChats = true;
          this.chats.sort(this.chat.compareTimestampsChats);
        }  

        if (change.type === "modified")
        {
          if(this.userID==change.doc.data().lesserID)
          {
            if(change.doc.data().deletedByLesser)
              this.removeChat(change.doc.data());
            else
              this.updateChatInfo(change.doc.data());
          }
          if(this.userID==change.doc.data().greaterID)
          {
            if(change.doc.data().deletedByGreater)
              this.removeChat(change.doc.data());
            else
              this.updateChatInfo(change.doc.data()); 
          }
          if(this.chats.length==0)
            this.noChats=true;
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
          this.deletedByThisUser(change.doc.data());
        }
        if (change.type === "removed") 
        {
          this.removeChat(change.doc.data());
          if (this.chats.length==0) this.noChats = true;
        }  

        if (change.type === "modified")
        {
          if(this.userID==change.doc.data().lesserID)
          {
            if(change.doc.data().deletedByLesser)
            {
              this.removeChat(change.doc.data());
              if(change.doc.data().deletedByGreater)
              {

                await this.afs.firestore.collection('chats').doc(change.doc.data().threadID)
                .collection('messages').get().then((snapshot)=>
                {
                  snapshot.forEach((doc)=>
                  {
                    this.afs.collection('chats').doc(change.doc.data().threadID)
                    .collection('messages').doc(doc.data().messageID).delete();
                  });
                });
                this.afs.collection('chats').doc(change.doc.data().threadID).delete();
              }
            }
            else
              this.updateChatInfo(change.doc.data());
          }
          if(this.userID==change.doc.data().greaterID)
          {
            if(change.doc.data().deletedByGreater)
            {
              this.removeChat(change.doc.data());
              if(change.doc.data().deletedByLesser)
              {
                this.afs.collection('chats').doc(change.doc.data().threadID).delete();
              }
            }      
            else
              this.updateChatInfo(change.doc.data());
          }
          if(this.chats.length==0)
            this.noChats=true; 
        }
      });
    });
  }

  // async getChatUpdateByThreadID(threadID:string, date)
  // {
   
  //  // Listener that checks each chat for new messages
  //  // if a new message is received, update the relevant chat.
  //  // (will need a similar function in notification center)
  //   // Called every time a chat is add to the chats array.
  //   // let messageQuery = await this.afs.firestore.collection('chats')
  //   // .doc(threadID).collection('messages');

  //   // await messageQuery.onSnapshot((snapshot) => { 
  //   //   snapshot.docChanges().forEach(async change => {
  //   //       await this.updateChat(threadID, change.doc.data());
  //   //   });
  //   // });
  // }

  // async updateChat(threadID:string, docData)
  // {
  //   this.chats.forEach(chat=>
  //   {
  //     if(chat.threadID == threadID)
  //     {
  //       chat.dateString = this.timeInfo.getTimeString(docData);
  //       chat.messagePreview = docData.messageText.substring(0,9) + "...";
  //       if(this.userID==chat.lesserID)
  //         chat.unread=(chat.unreadByLesserCount>0);
  //       else
  //         chat.unread=(chat.unreadByGreaterCount>0);
  //       }
  //   });

  //   this.chats.sort(this.chat.compareTimestampsChats);
  //   // reload chats message preview and timestamp
  // }

  // async updateChatWithChatDoc(docData)
  // {
  //   this.chats.forEach(chat=>
  //   {
  //     if(chat.threadID == docData.threadID)
  //     {
  //       chat.dateString = this.timeInfo.getTimeString(docData);
  //       chat.messagePreview = docData.messagePreview;
  //       if(this.userID==chat.lesserID)
  //         chat.unread=(chat.unreadByLesserCount>0);
  //       else
  //         chat.unread=(chat.unreadByGreaterCount>0);
  //       this.chats.sort(this.chat.compareTimestampsChats);
  //     }
  //   });
  //   // reload chats message preview and timestamp
  // }

  // async refreshChats(userID:string)
  // {
  //   let chatQuery = await this.afs.firestore.collection('chats')
  //   .where("greaterID","==",userID);
  //   await chatQuery.onSnapshot((snapshot) => { 
  //     snapshot.docChanges().forEach(async change => {

  //       this.updateChatWithChatDoc(change.doc.data());
  //        // this.chats.push(await this.getChatSender(change.doc.data(),false));
        
  //     });
  //   });


  //   chatQuery = await this.afs.firestore.collection('chats')
  //   .where("lesserID","==",userID);
  //   await chatQuery.onSnapshot((snapshot) => { 
  //     snapshot.docChanges().forEach(async change => {
  //       this.updateChatWithChatDoc(change.doc.data());
  //     });
  //   });
  // }

  removeChat(element)
  {
    for(let i=0; i < this.chats.length; i++)
    {
      if (this.chats[i].threadID==element.threadID)
      {
        this.chats.splice(i,1);
      }
    }
  }

  async updateChatInfo(updatedChat)
  {
    for(let i=0; i<this.chats.length; i++)
    {
      if(this.chats[i].threadID==updatedChat.threadID)
      {
        this.chats[i]=(await this.getChatSender(updatedChat,false));
        this.chats.sort(this.chat.compareTimestampsChats);
      }
    }
  }
}
