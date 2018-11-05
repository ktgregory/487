import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';

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
  noMessages = false;
  public messageForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private chat: ChatProvider, public formBuilder: FormBuilder,
    private afs: AngularFirestore) {

      // Retreive navigation parameters from Messages page and
      // set messageForm variable equal to message input. 
      this.threadID = this.navParams.get('threadID');
      this.userID = this.navParams.get('userID');
      this.otherUserID = this.navParams.get('senderID');
      this.senderName = this.navParams.get('senderName');
      this.profileImage = this.navParams.get('senderImage');
      this.eventName = this.navParams.get('eventName');
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
  }


  // Listens for new messages.
  async newMessageListener()
  {
    let messageQuery = await this.afs.firestore.collection('chats')
    .doc(this.threadID).collection('messages');
    await messageQuery.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
        this.messages.push(this.formatNewMessage(change.doc.data()));
        if(this.noMessages==true) this.noMessages = false;
      });
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


  // Formats each message based on if it was sent or received
  // and adds a timestring attribute, so the time the message
  // was sent can be displayed to the user. 
  formatNewMessage(message)
  {
    if(message.senderID == this.userID) 
      message.position="speech-bubble-right";
    else 
      message.position="speech-bubble-left";
    let date = new Date();
    date.setSeconds(message.timestamp.seconds);
    if (date.getMinutes()<10) 
      message.timestring = date.getHours()+ ":0" + date.getMinutes();
    else 
        message.timestring = date.getHours() + ":" + date.getMinutes();
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

  // Pops the Chatroom page from the navigation stack, 
  // returning the user to the Messages page.
  goBack()
  {
    this.navCtrl.pop();
  }

}
