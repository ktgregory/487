import { Component, OnInit } from '@angular/core';
import { IonicPage, ViewController, NavParams, AlertController } from 'ionic-angular';
import { RequestProvider } from '../../providers/request/request';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { AngularFirestore } from 'angularfire2/firestore';

/**
 * Generated class for the RequestModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
  
  constructor(
    public viewCtrl: ViewController, params: NavParams, private reqService: RequestProvider,
    private userService: UserinfoProvider, private afs: AngularFirestore,
    public alertCtrl: AlertController
  ) {
    this.requestID = params.get('myParam');
    
  }


  async ngOnInit()
  {
    let request = await this.reqService.getRequestInfo(this.requestID);
    this.requestInfo = request[0];
    this.eventName = this.requestInfo.eventName;
    let sender= await this.userService.getUserInfo(this.requestInfo.senderID);
    let senderInfo = sender[0];
    this.name = senderInfo.name;
    this.bio = senderInfo.bio;
    this.profileimage = senderInfo.profileimage;
    this.getEmail();
    this.getPhoneNumber();
  }

  async getEmail()
  {
    let id = this.requestInfo.receiverID;
    let receiver = await this.userService.getUserInfo(id);
    this.email=receiver[0].email;

  }

  async getPhoneNumber()
  {  
    let id = this.requestInfo.receiverID;
    let receiver = await this.userService.getUserInfo(id);
    this.phoneNumber = receiver[0].phoneNumber;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

 clearRequest()
  {
    let clearMessage = this.alertCtrl.create({
      title: 'Clear this request?',
      message: 'The request will no longer be viewable to you, and this action cannot be undone!',
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
    clearMessage.present()
  
  }

  acceptRequest()
  {
    let acceptMessage = this.alertCtrl.create({
      title: 'Accept?',
      message: 'Would you like to accept this request?',
      buttons: [
        {
          text: 'Nevermind.',
          handler: () => {
            
          }
        },
        {
          text: 'Yes, accept!',
          handler: () => {
            
            this.contactInfoAlert();
          }
        }
        
      ]
    });
    acceptMessage.present()
  
  }

  contactInfoAlert()
  {
    let contactInfo = this.alertCtrl.create({
      title: 'Method of contact?',
      message: 'How would you like to be contacted?',
      buttons: [
        { text: 'Cancel',
          handler: () => {
         
        }
        },
        {
          text: 'Text',
          handler: () => {
            this.reqService.acceptRequest(this.requestID, this.phoneNumber);
            this.announceAcceptance();
          }
        },
        {
          text: 'Email',
          handler: () => {
            this.reqService.acceptRequest(this.requestID, this.email);
            this.announceAcceptance();
          }
        }

      ]
      }
    );
    
      contactInfo.present();
  }

  announceAcceptance()
  {
    let acceptMessage = this.alertCtrl.create({
      title: 'Request Accepted!',
      message: 'Your chosen contact information was sent',
      buttons: [
        { text: 'OK.',
          handler: () => {
            this.dismiss();
        }
        }
      ]
      }
    );
    
      acceptMessage.present();
  }


}
