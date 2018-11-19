import { Component } from '@angular/core';
import { NotificationsPage } from '../notifications/notifications';
import { MessagesPage } from '../messages/messages';
import { ProfilePage } from '../profile/profile';
import { HomePage } from '../home/home';
import { AngularFirestore } from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';
import { EventInfoProvider } from '../../providers/event-info/event-info';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  // Sets each tab's root to the corresponding pag.
  tab1Root = HomePage;
  tab2Root = MessagesPage;
  tab3Root = NotificationsPage;
  tab4Root = ProfilePage;

  userID;

  newRequestCount=0;
  newApprovedPostCount=0;
  newMessagesCount=0;

  onMessagesTab = false;
  onRequestsTab = false;
  onProfileTab = false;

  chats=[];

  constructor(private afs: AngularFirestore, private auth: AuthProvider) {}


  async ngOnInit()
  {
    this.userID = await this.auth.getUserID();
    this.newMessageListener();
    this.newRequestListener();
    this.newApprovedPostListener();
  }

  homeSelected()
  {
    this.onMessagesTab = false;
    this.onRequestsTab = false;
    this.onProfileTab = false;
  }

  messagesSelected()
  {
    this.onMessagesTab = true;
    this.onRequestsTab = false;
    this.onProfileTab = false;
  }

  requestCenterSelected()
  {
    this.onMessagesTab = false;
    this.onRequestsTab = true;
    this.onProfileTab = false;
  }

  profileSelected()
  {
    this.onMessagesTab = false;
    this.onRequestsTab = false;
    this.onProfileTab = true;
  }

  
  async newRequestListener()
  {
    let requestQuery = await this.afs.firestore.collection('requests')
    .where('receiverID','==',this.userID);
    await requestQuery.onSnapshot((snapshot)=>
    {
      snapshot.docChanges().forEach(async change=>
      {
        let request = change.doc.data();
        if (change.type==="added")
        {
          if ((request.viewed == false) && (request.status=="pending"))
          {
            this.newRequestCount++;
          }
        }
        if (change.type === "modified")
        {
          if ((request.viewed == true) && (request.status=="pending"))
          {
            this.newRequestCount--;
          }
        }
        if (change.type === "removed")
        {

        }
      });
    });

    let requestQuery2 = await this.afs.firestore.collection('requests')
    .where('senderID','==',this.userID);
    await requestQuery2.onSnapshot((snapshot)=>
    {
      snapshot.docChanges().forEach(async change=>
      {
        let request = change.doc.data();
        if (change.type==="added")
        {
          if ((request.viewedBySender == false) && (request.status=="accepted"))
          {
            this.newRequestCount++;
          }
        }
        if (change.type === "modified")
        {
          if ((request.viewedBySender == false) && (request.status=="accepted"))
          {
            this.newRequestCount++;
          }
          if ((request.viewedBySender == true) && (request.status=="accepted"))
          {
            this.newRequestCount--;
          }
        }
        if (change.type === "removed")
        {

        }
      });
    });
  }

  async newApprovedPostListener()
  {

    
    
  }



  async newMessageListener()
  {
    // Queries chats, which must be done twice
    // because the user's ID may be either the "lesser"
    // or the "greater" ID. It may be possible to combine
    // these queries.
    let chatQuery = await this.afs.firestore.collection('chats')
    .where("greaterID","==",this.userID);
    await chatQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {

        let chat = change.doc.data();
        if (change.type === "added") 
        {
          if ((chat.greaterID == this.userID) && (chat.deletedByGreater==false))
          {
            this.chats.push(chat);
            this.newMessagesCount+= chat.unreadByGreaterCount;
          } 
            
          if ((chat.lesserID == this.userID) && (chat.deletedByLesser==false))
          {
            this.chats.push(chat);
            this.newMessagesCount+= chat.unreadByLesserCount;
          } 
        }


        if (change.type === "modified")
        {
          if ((chat.greaterID == this.userID) && (chat.deletedByGreater==false))
          {
            this.changeCountGreater(chat);
          } 
            
          if ((chat.lesserID == this.userID) && (chat.deletedByLesser==false))
          {
            this.changeCountLesser(chat);
          } 
        }
      });
    });

    chatQuery = await this.afs.firestore.collection('chats')
    .where("lesserID","==",this.userID);
    await chatQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {

        let chat = change.doc.data();
        if (change.type === "added") 
        {
          if ((chat.greaterID == this.userID) && (chat.deletedByGreater==false))
          {
            this.chats.push(chat);
            this.newMessagesCount+= chat.unreadByGreaterCount;
          } 
            
          if ((chat.lesserID == this.userID) && (chat.deletedByLesser==false))
          {
            this.chats.push(chat);
            this.newMessagesCount+= chat.unreadByLesserCount;
          } 
        }


        if (change.type === "modified")
        {
          if ((chat.greaterID == this.userID) && (chat.deletedByGreater==false))
          {
            this.changeCountGreater(chat);
          } 
            
          if ((chat.lesserID == this.userID) && (chat.deletedByLesser==false))
          {
            this.changeCountLesser(chat);
          } 
        }
      });
    });
  }

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

  changeCountGreater(updatedChat)
  {
    this.chats.forEach(chat=>
    {
      if(chat.threadID==updatedChat.threadID)
      {
        let current = chat.unreadByGreaterCount;
        let newCount = updatedChat.unreadByGreaterCount;
        if (current<newCount)
          this.newMessagesCount+=(newCount-current);
        else
          this.newMessagesCount-=current;
        chat.unreadByGreaterCount = newCount;
      }
    });
  }

  changeCountLesser(updatedChat)
  {
    this.chats.forEach(chat=>
    {
      if(chat.threadID==updatedChat.threadID)
      {
        let current = chat.unreadByLesserCount;
        let newCount = updatedChat.unreadByLesserCount;
        if (current<newCount)
          this.newMessagesCount+=(newCount-current);
        else
          this.newMessagesCount-=current;
        chat.unreadByLesserCount = newCount;
      }
    });
  }
}
