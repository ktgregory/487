import { Component, OnInit } from '@angular/core';
import { IonicPage, ViewController, NavParams, AlertController } from 'ionic-angular';
import { RequestProvider } from '../../providers/request/request';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { ChatProvider } from '../../providers/chat/chat';


@IonicPage()
@Component({
  selector: 'page-request-modal',
  templateUrl: 'request-modal.html',
})
export class RequestModalPage implements OnInit {

  requestID: string;
  requestInfo;
  name;
  bio;
  profileimage;
  eventName;
  phoneNumber;
  email;
  otherUserID;
  userID;
  
  constructor(
    public viewCtrl: ViewController, params: NavParams, 
    private reqService: RequestProvider, private userService: UserinfoProvider,
    public alertCtrl: AlertController, private chat: ChatProvider
  ) {
    // Gets navigation parameters and updates corresponding variables. 
    this.requestID = params.get('requestID');
    this.otherUserID = params.get('otherUserID');
    this.userID = params.get('userID');
  }


  async ngOnInit()
  {
    // Gets the sender of the request's profile information
    // to be displayed.
    let request = await this.reqService.getRequestInfo(this.requestID);
    this.requestInfo = request[0];
    this.eventName = this.requestInfo.eventName;
    let sender= await this.userService.getUserInfo(this.requestInfo.senderID);
    let senderInfo = sender[0];
    this.name = senderInfo.name;
    this.bio = senderInfo.bio;
    this.profileimage = senderInfo.profileimage;
  }

  dismiss() 
  {
    // Closes the modal. 
    this.viewCtrl.dismiss();
  }

 clearRequest()
  {
    // Asks user to confirm that they want to clear 
    // the request before clearing it. 
    let clearMessage = this.alertCtrl.create({
      title: 'Clear this request?',
      message: 'The request will no longer be viewable to you'
      + 'and this action cannot be undone!',
      buttons: [
        {
          text: 'Nevermind!',
          handler: () => {
            
          }
        },
        {
          text: 'Yes, clear it please.',
          handler: () => {
            this.reqService.clearRequestReceiver(this.requestID);
            this.dismiss();
          }
        }
      ]
    });
    clearMessage.present();
  }

  async acceptRequest()
  {
    // Asks user to confirm that they want to accept
    // the request, and then creates a new thread 
    // between the users. 
    let acceptMessage = this.alertCtrl.create({
      title: 'Accept?',
      message: 'Would you like to accept this request?',
      buttons: [
        {
          text: 'Nevermind.',
          handler: () => {}
        },
        {
          text: 'Yes, accept!',
          handler: async () => {
            await this.chat
            .startThread(this.userID, this.otherUserID, this.eventName)
            .then(any=>
            {
                this.reqService.acceptRequest(this.requestID);
                this.announceAcceptance();
            });
          }
        }
      ]
    });
    acceptMessage.present()
  }

  announceAcceptance()
  {
    // Notifies user that the request was successfully accepted
    // and that a new chat thread has been created. 
    let acceptMessage = this.alertCtrl.create({
      title: 'Request Accepted!',
      message: 'A new chat has been started with ' 
      + this.name + ' on the topic of ' + this.eventName,
      buttons: [
        { text: 'OK.',
          handler: () => {
            this.dismiss();
          }
        }]
      }
    );
    acceptMessage.present();
  }


}
