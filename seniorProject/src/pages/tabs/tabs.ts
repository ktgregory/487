import { Component } from '@angular/core';
import { MessagesPage } from '../messages/messages';
import { ProfilePage } from '../profile/profile';
import { HomePage } from '../home/home';
import { AngularFirestore } from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';
import { RequestCenterPage } from '../request-center/request-center';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  // Sets each tab's root to the corresponding page.
  tab1Root = HomePage;
  tab2Root = MessagesPage;
  tab3Root = RequestCenterPage;
  tab4Root = ProfilePage;


  userID;
  chats=[];

  // Counters for the tab badges (numbers)
  newRequestCount;
  newApprovedPostCount;
  newMessagesCount;

  constructor(private afs: AngularFirestore, private auth: AuthProvider) {}


  async ngOnInit()
  {
    this.newRequestCount=0;
    this.newApprovedPostCount=0;
    this.newMessagesCount=0;
    this.userID = await this.auth.getUserID();
    this.newMessageListener();
    this.newRequestListener();
    this.newApprovedPostListener();
  }

  
  async newRequestListener()
  {
    // Queries for all of the requests a user has sent and received.
    // Listens for newly received requests and newly accepted requests
    // and increments the counters accordingly. 
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
      });
    });
  }

  async newApprovedPostListener()
  {
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("uid","==",this.userID);    
    await postQuery.onSnapshot((querySnapshot) => { 
       querySnapshot.docChanges().forEach(async (change) => {
  
        if(change.type === "added")
        {
          if(change.doc.data().status=="approved" && change.doc.data().approvalViewed==false)
          {
            this.newApprovedPostCount++;
          }
        }
        if (change.type === "modified")
        {
          let post = change.doc.data();
          if(post.approvalViewed==true)
            this.newApprovedPostCount--;
          else
            this.newApprovedPostCount++;
        }
      })
    });
  }

async newMessageListener()
{
    // Queries chats (and listens for changes), which must be 
    // done twice because the user's ID may be either the "lesser"
    // or the "greater" ID. It may be possible to combine
    // these queries.
    let chatQuery = await this.afs.firestore.collection('chats')
    .where("greaterID","==",this.userID);
    await chatQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {

        let chat = await change.doc.data();
        if (change.type === "added") 
        {
          if (chat.deletedByGreater==false)
          {
            this.chats.push(chat);
            this.updateMessagesCount();
          } 
        }

        else if (change.type === "modified")
        {
          if (chat.deletedByGreater==false)
          {
            this.updateChat(chat);
          } 
          else if (chat.deletedByGreater == true)
          {
            this.deleteChat(chat);
          }
        }
      });
    });

    let chatQuery2 = await this.afs.firestore.collection('chats')
    .where("lesserID","==",this.userID);
    await chatQuery2.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async change => {
        
        let chat = await change.doc.data();
        if (change.type === "added") 
        {
            
          if (chat.deletedByLesser==false)
          {
            this.chats.push(chat);
            this.updateMessagesCount();
          } 
        }

        else if (change.type === "modified")
        {
           if (chat.deletedByLesser==false)
          {
            this.updateChat(chat);
          } 
          else if (chat.deletedByLesser == true)
          {
            this.deleteChat(chat);
          }
          
        }
      });
    });
  }

  updateChat(updatedChat)
  {
    for(let i =0; i<this.chats.length; i++)
    {
      if (this.chats[i].threadID == updatedChat.threadID)
      {
        this.chats[i]=updatedChat;
        this.updateMessagesCount();
      }
    }
  }

  deleteChat(deletedChat)
  {
    for(let i =0; i<this.chats.length; i++)
      {
        if (this.chats[i].threadID == deletedChat.threadID)
        {
          this.chats.splice(i,1);
          this.updateMessagesCount();
        }
      }
  }

  updateMessagesCount()
  {
    let tempNewCount=0;
    this.chats.forEach(chat=>
      {
        if(this.userID == chat.lesserID)
          tempNewCount+= chat.unreadByLesserCount;
        else
          tempNewCount+= chat.unreadByGreaterCount;
      })
    this.newMessagesCount = tempNewCount;

    console.log(this.newMessagesCount);
  }



//   async newMessageListener()
//   {
//     // Queries chats (and listens for changes), which must be 
//     // done twice because the user's ID may be either the "lesser"
//     // or the "greater" ID. It may be possible to combine
//     // these queries.
//     let chatQuery = await this.afs.firestore.collection('chats')
//     .where("greaterID","==",this.userID);
//     await chatQuery.onSnapshot((snapshot) => { 
//       snapshot.docChanges().forEach(async change => {

//         let chat = await change.doc.data();
//         if (change.type === "added") 
//         {
//           if (chat.deletedByGreater==false)
//           {
//             this.chats.push(chat);
//             this.newMessagesCount+= chat.unreadByGreaterCount;
//           } 
//         }

//         if (change.type === "modified")
//         {
//           if ((chat.deletedByGreater==false))
//           {
//             this.changeCountGreater(chat);
//           } 
            
//           else if((chat.deletedByGreater==true))
//           {
//             this.removeChatGreater(chat);
//           }
//         }
//       });
//     });

//     let chatQuery2 = await this.afs.firestore.collection('chats')
//     .where("lesserID","==",this.userID);
//     await chatQuery.onSnapshot((snapshot) => { 
//       snapshot.docChanges().forEach(async change => {
        
//         let chat = await change.doc.data();
//         if (change.type === "added") 
//         {
            
//           if (chat.deletedByLesser==false)
//           {
//             this.chats.push(chat);
//             this.newMessagesCount+= chat.unreadByLesserCount;
//           } 
//         }

//         if (change.type === "modified")
//         {
//           if (chat.deletedByLesser==false)
//           {
//             this.changeCountLesser(chat);
//           } 
        
//           if(chat.deletedByLesser==true)
//           {
//             this.removeChatLesser(chat);
//           }
//         }
//       });
//     });
//   }

//   removeChatLesser(element)
//   {
//     // Removes a chat from the array if it is deleted.
//     // This is needed here because the user should not be notified
//     // if they receive a message from a chat they have deleted.
//     for(let i=0; i < this.chats.length; i++)
//     {
//       if (this.chats[i].threadID==element.threadID)
//       {
//         this.chats.splice(i,1);
//         if(element.deletedByLesser==true)
//         {
//           this.newMessagesCount-= element.unreadByLesserCount;
//         }
//       }
//     }
//   }


//   removeChatGreater(element)
//   {
//     // Removes a chat from the array if it is deleted.
//     // This is needed here because the user should not be notified
//     // if they receive a message from a chat they have deleted.
//     for(let i=0; i < this.chats.length; i++)
//     {
//       if (this.chats[i].threadID==element.threadID)
//       {
//         this.chats.splice(i,1);
//         if(element.deletedByGreater==true)
//         {
//           this.newMessagesCount-= element.unreadByGreaterCount;
//         }
//       }
//     }
//   }

//   changeCountGreater(updatedChat)
//   {
//     // Modifies the count on unread messages in chats
//     // where the current user has the "greater" ID. 
//     this.chats.forEach(chat=>
//     {
//       if(chat.threadID==updatedChat.threadID)
//       {
//         let current = chat.unreadByGreaterCount;
//         let newCount = updatedChat.unreadByGreaterCount;
//         if (current<newCount)
//           this.newMessagesCount+=(newCount-current);
//         else
//           this.newMessagesCount-=current;
//         chat = updatedChat;
//       }
//     });
//   }

//   changeCountLesser(updatedChat)
//   {
//     // Modifies the count on unread messages in chats
//     // where the current user has the "lesser" ID.
//     this.chats.forEach(chat=>
//     {
//       if(chat.threadID==updatedChat.threadID)
//       {
//         let current = chat.unreadByLesserCount;
//         let newCount = updatedChat.unreadByLesserCount;
//         if (current<newCount)
//           this.newMessagesCount+=(newCount-current);
//         else
//           this.newMessagesCount-=current;
//         chat = updatedChat;
//       }
//     });
//   }
// }
}