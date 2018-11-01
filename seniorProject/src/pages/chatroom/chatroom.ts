import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
import { snapshotChanges } from 'angularfire2/database';

/**
 * Generated class for the ChatroomPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
  noMessages = false;
  public messageForm: FormGroup;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private chat: ChatProvider, public formBuilder: FormBuilder,
    private afs: AngularFirestore) {
      this.threadID = this.navParams.get('threadID');
      this.userID = this.navParams.get('userID');
      this.otherUserID = this.navParams.get('senderID');
      this.senderName = this.navParams.get('senderName');

      this.messageForm = formBuilder.group({
        messageContent: ['']
      });
    
  }

  async ngOnInit()
  {
    this.messages=[];
    await this.newMessageListener();
    if(this.messages.length==0) this.messages = this.formatNewMessages(await this.chat.getMessagesByThreadID(this.threadID));
    if( this.messages.length == 0) this.noMessages=true;
    this.messages.sort(this.compareTimestamps);
  }

  compareTimestamps(message1, message2)
  {
    return message1.timestamp.seconds - message2.timestamp.seconds;
  }

  async newMessageListener()
  {
    let messageQuery = await this.afs.firestore.collection('chats').doc(this.threadID).collection('messages');
    await messageQuery.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
        this.messages.push(this.formatNewMessage(change.doc.data()));
        if(this.noMessages==true) this.noMessages = false;
      });
    });
    
  }

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
    if(message.senderID == this.userID) message.position="right";
    else message.position="left";
    console.log(message.timestamp.seconds)
    let date = new Date();
    date.setSeconds(message.timestamp.seconds);
    if (date.getMinutes()<10) message.timestring = date.getHours()+ ":0" + date.getMinutes();
    else message.timestring = (date.getHours()+1) + ":" + date.getMinutes();
  
    return message;
  }

  async sendMessage()
  {
    await this.chat.sendMessage(this.messageForm.value.messageContent,this.userID,this.otherUserID);
    this.messageForm = this.formBuilder.group({
      messageContent: ['']
    });
  }

}
