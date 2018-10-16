import { Component, NgZone } from '@angular/core';
import { NavController, Alert, AlertController, ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { RequestProvider } from '../../providers/request/request';
import { RequestModalPage } from '../../pages/request-modal/request-modal';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  userID;
  receivedRequests=[];
  sentRequests=[];
  noSent = false;
  noReceived = false;

  constructor(public navCtrl: NavController, private authData: AuthProvider,
    private afs: AngularFirestore, private reqService: RequestProvider,
    public alertCtrl: AlertController, public modalCtrl: ModalController,
    public NgZone:NgZone) {

  }

   
  async ngOnInit()
  {
      this.userID = await this.authData.getUserID(); 
      this.receivedRequests = await this.reqService.getReceivedRequests(this.userID);
      this.sentRequests = await this.reqService.getSentRequests(this.userID);
      if(this.sentRequests.length==0) this.noSent=true;
      if(this.receivedRequests.length==0) this.noReceived=true;
  }

  respondToRequest(requestID:string) { //open modal 
  
      let myModal = this.modalCtrl.create(RequestModalPage, { 
        'myParam': requestID });
        myModal.onDidDismiss(() => {
          this.navCtrl.setRoot(TabsPage);
        });
      myModal.present();
    
  }

  pendingAlert(requestID:string)
  {
    let pendingMessage = this.alertCtrl.create({
    title: 'Request Status Info:',
    message: 'This request is still pending. Once it\'s accepted, come back here for their contact info! Or you can clear the request now.',
    buttons: [
      {
        text: 'Ok!',
        handler: () => {
            
        }
      },
      {
        text: 'Clear the request.',
        handler: () => {
          this.confirmClear(requestID);
        }
      }
    ]
  });
  pendingMessage.present()

  }

  confirmClear(requestID:string)
  {
    let clearMessage = this.alertCtrl.create({
      title: 'Clear this pending request?',
      message: 'If you clear this request, it cannot be undone!',
      buttons: [
        {
          text: 'Yes, clear it please.',
          handler: () => {
            this.reqService.clearRequestSender(requestID);
            this.navCtrl.setRoot(TabsPage);
          }
        },
        {
          text: 'Nevermind!',
          handler: () => {
            
          }
        }
      ]
    });
    clearMessage.present()
  
  }

  async viewAccepted(requestID:string)
  {
    let request2= await this.reqService.getRequestInfo(requestID);
    let request = request2[0];
    let name = request.receiverName;
    let contact = request.contact;
    let pendingMessage = this.alertCtrl.create({
    title: 'Request was accepted!',
    message: name + " would like to be contacted at " + contact,
    buttons: [
      {
        text: 'Clear this request.',
        handler: () => {
          this.confirmClear(requestID);
        }
      },
      {
        text: 'Ok, save this for later!',
        handler: () => {
            
        }
      }  
    ]
  });
  pendingMessage.present()

  }

}
