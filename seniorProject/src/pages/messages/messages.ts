import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { AuthProvider } from '../../providers/auth/auth';
import { ChatroomPage } from '../chatroom/chatroom';
import { UserProvider } from '../../providers/user/user';
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
    private authData: AuthProvider, private userInfo: UserProvider,
    private afs: AngularFirestore, public alertCtrl: AlertController,
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
    senderName:string, senderImage:string, eventName:string, messagePreview:string)
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
        'preview': messagePreview
       });
       chat.unread=false;
       if(chat.greaterID == this.userID)
        this.afs.collection('chats').doc(threadID).update({unreadByGreaterCount:0});
       else
        this.afs.collection('chats').doc(threadID).update({unreadByLesserCount:0});
    }
  }


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
    let deleted;
    if(chat.lesserID==this.userID && chat.deletedByLesser==true)
    {
      this.removeChat(chat);
      deleted= true;
    }
     else if(chat.greaterID == this.userID && chat.deletedByGreater==true)
     {
      this.removeChat(chat);
      deleted= true;
     }
      
    if(this.chats.length==0)
      this.noChats=true;
    return deleted;
  }


  async deleteSelectedChatsWarning()
  {
    let confirm = this.alertCtrl.create({
      title: 'Delete chats?',
      message: 
      'This action cannot be undone, and you will no longer receive messages from any chat that you delete.',
      buttons: [
      {
        text: 'Yes, delete.',
        handler: () => {
          this.deleteSelectedChats();
        }
      },
      {
        text: 'Nevermind.',
      }
      ]
    });
    confirm.present()
  }

  async deleteSelectedChats()
  {
    // Updates in the database if a user has marked a chat to delete.
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

  deleteChat(chat)
  {
    // Deletes an individual chat with the swipe right deletion method.
    if(this.userID == chat.greaterID)
      this.afs.collection('chats').doc(chat.threadID).update({deletedByGreater:true});
    else
      this.afs.collection('chats').doc(chat.threadID).update({deletedByLesser:true});  
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
        let chat;
        if (change.type === "added") 
        {
          chat = await this.getChatSender(change.doc.data(),false)
          this.chats.push(chat);
          if(this.noChats==true) this.noChats=false;
          this.chats.sort(this.chat.compareTimestampsChats);
          if(!(this.deletedByThisUser(change.doc.data())))
            this.listenForUserUpdates(chat);
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

        let chat;
        if (change.type === "added") 
        {
          chat = await this.getChatSender(change.doc.data(),false)
          this.chats.push(chat);
          this.chats.sort(this.chat.compareTimestampsChats);
          if(this.noChats==true) this.noChats=false;
          if(!(this.deletedByThisUser(change.doc.data())))
            this.listenForUserUpdates(chat);
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

 async listenForUserUpdates(chat)
 {
   // Updates the user's name or profile image if they change their information
   // after the page is first loaded. 
  let userQuery = await this.afs.firestore.collection('users')
  .where("uid","==",chat.senderID);
  await userQuery.onSnapshot((snapshot) => { 
    snapshot.docChanges().forEach(async change => {
      chat.senderName=change.doc.data().name;
      chat.senderImage=change.doc.data().profileimage;
    });
  });
 }

  removeChat(element)
  {
    // Used to remove a chat if the user deletes it. 
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
    // Updates the chat information based on updates 
    // in the database. 
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
