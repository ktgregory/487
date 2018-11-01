import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ChatProvider } from '../../providers/chat/chat';
import { AuthProvider } from '../../providers/auth/auth';
import { ChatroomPage } from '../chatroom/chatroom';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { timestamp } from 'rxjs/operators';

@Component({
  selector: 'page-messages',
  templateUrl: 'messages.html'
})
export class MessagesPage {

  userID: string;
  chats = [];
  noChats = false;

  constructor(public navCtrl: NavController, private chat: ChatProvider,
    private authData: AuthProvider, private userInfo: UserinfoProvider) {
  }

  async ngOnInit()
  {
    this.userID = this.authData.getUserID();
    this.chats = await this.chat.getChatsByUserID(this.userID);
    await this.getChatSenders();
    if (this.chats.length == 0) this.noChats = true;
  }

  async getChatSenders()
  {
    this.chats.forEach(async chat=>
      {
        if (chat.greaterID == this.userID) chat.senderID = chat.lesserID;
        else chat.senderID = chat.greaterID;
        chat.senderName = await this.userInfo.getUserNameByID(chat.senderID);
      });
  }

  goToChat(threadID:string, senderID:string, userID:string, senderName:string)
  {
   this.navCtrl.push(ChatroomPage, {
     'threadID': threadID,
     'senderID': senderID,
     'userID': userID,
     'senderName': senderName
    });
  }


}
