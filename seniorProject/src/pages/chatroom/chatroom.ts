import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { TimeDateCalculationsProvider } from '../../providers/time-date-calculations/time-date-calculations';
import { Content } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-chatroom',
  templateUrl: 'chatroom.html',
})
export class ChatroomPage {

  messages = [];
  threadID;
  otherUserID;
  userID;
  senderName;
  profileImage;
  eventName;
  topic;
  noMessages = false;
  public messageForm: FormGroup;
  newChat:boolean;

  // This variable keeps track of whether or not the user
  // is viewing the page, so that the app can keep track 
  // of whether or not new messages are received while the 
  // user is on the page or in the background. If this page
  // is not in view, the messages are unread. Otherwise,
  // they are marked read. 
  inView:boolean;

  @ViewChild(Content) content:Content;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private chat: ChatProvider, public formBuilder: FormBuilder,
    private afs: AngularFirestore, private timeInfo: TimeDateCalculationsProvider) {

      // Retreive navigation parameters from Messages page and
      // set messageForm variable equal to message input. 
      this.threadID = this.navParams.get('threadID');
      this.userID = this.navParams.get('userID');
      this.otherUserID = this.navParams.get('senderID');
      this.senderName = this.navParams.get('senderName');
      this.profileImage = this.navParams.get('senderImage');
      this.eventName = this.navParams.get('eventName');
      this.newChat = (this.navParams.get('preview')=="New chat!");
      this.messageForm = formBuilder.group({
        messageContent: ['']
      });
    
  }


  async ngOnInit()
  {
    this.messages=[];
    await this.newMessageListener(); // Listens for new messages.
    
    // Checks that no messages have been pulled, and queries
    // previously existing messages from the database.
    if(this.messages.length==0) this.messages = 
        this.formatNewMessages(await this.chat.getMessagesByThreadID(this.threadID));
    
    if( this.messages.length == 0) this.noMessages=true;
    this.inView=true;
  }

  ionViewWillEnter()
  {
    // Updates the inView variable to true when the user
    // navigates to the page. 
    this.inView=true;
    console.log(this.inView);
  }

  ionViewDidEnter(){
    // When the page has been entered, scrolls to the bottom 
    // (i.e. to the most recent messages).
    
    if(this.content._scroll) this.content.scrollToBottom(300);
    this.inView=true;

  }

  ionViewWillLeave()
  {
    // Updates the inView variable to false when the user
    // navigates away from the page. 
    this.inView=false;
    console.log(this.inView);
  }

  // Listens for new messages.
  async newMessageListener()
  {
    let messageQuery = await this.afs.firestore.collection('chats')
    .doc(this.threadID).collection('messages');
    await messageQuery.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
          this.messages.push(this.formatNewMessage(change.doc.data()));
        
          // Scrolls to the bottom of the page if a new message is received.
          if(this.content._scroll) this.content.scrollToBottom(300);
          if(this.inView)
          {
            // Depending on if the user is the greater or lesser ID, 
            // the unread count is set to 0. 
            if(this.userID<this.otherUserID)
            {
              this.afs.collection('chats').doc(this.threadID)
              .update({unreadByLesserCount: 0});
            }
            else
            {
              this.afs.collection('chats').doc(this.threadID)
              .update({unreadByGreaterCount: 0});
            }
              
            if(this.noMessages==true) this.noMessages = false;
          }
      });
    });

    let chatQuery = await this.afs.firestore.collection('chats')
      .where("threadID","==",this.threadID);
    await chatQuery.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type==="modified" && this.inView)
          {
            if(this.userID<this.otherUserID)
            {
              this.afs.collection('chats').doc(this.threadID)
              .update({unreadByLesserCount: 0});
            }
            else
            {
              this.afs.collection('chats').doc(this.threadID)
              .update({unreadByGreaterCount: 0});
            }
          }
        })
      });
  }

  // For formatting the previously existing messages
  formatNewMessages(messages)
  {
    messages.forEach(message =>
    {
      message = this.formatNewMessage(message);
    });
    return messages;
  }


  formatNewMessage(message)
  {
  // Formats each message based on if it was sent or received
  // and adds a timestring attribute, so the time the message
  // was sent can be displayed to the user. 
    if(message.senderID == this.userID) 
      message.position="speech-bubble-right";
    else 
      message.position="speech-bubble-left";
    message.timestring = this.timeInfo.getTimeString(message);
    return message;
  }

  async sendMessage()
  {
    // Calls the sendMessage method from the Chat Provider. 
    await this.chat.sendMessage(this.messageForm.value.messageContent,
      this.userID,this.otherUserID, this.eventName);

    // Resets the message form to a blank input.
    this.messageForm = this.formBuilder.group({
      messageContent: ['']
    });
  }

  goBack()
  {
  // Pops the Chatroom page from the navigation stack, 
  // returning the user to the Messages page.
    this.navCtrl.pop();
  }

}
