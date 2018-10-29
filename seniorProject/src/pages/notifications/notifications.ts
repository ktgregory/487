import { Component, NgZone } from '@angular/core';
import { NavController, Alert, AlertController, ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { RequestProvider } from '../../providers/request/request';
import { RequestModalPage } from '../../pages/request-modal/request-modal';
import { EventInfoProvider } from '../../providers/event-info/event-info';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  userID;
  receivedRequests=[];
  sentRequests=[];
  pendingPosts=[];
  noSent = false;
  noReceived = false;
  noPendingPosts = false;

  constructor(public navCtrl: NavController, private authData: AuthProvider,
    private afs: AngularFirestore, private reqService: RequestProvider,
    public alertCtrl: AlertController, public modalCtrl: ModalController,
    public NgZone:NgZone, private eventInfo: EventInfoProvider) {

  }

   
  async ngOnInit()
  {
      this.noSent = false;
      this.noReceived = false;
      this.noPendingPosts = false;
      this.userID = await this.authData.getUserID(); 
      this.receivedRequests = await this.reqService.getReceivedRequests(this.userID);
      this.sentRequests = await this.reqService.getSentRequests(this.userID);
      this.pendingPosts = await this.eventInfo.getPendingPosts(this.userID);
      if(this.sentRequests.length==0) this.noSent=true;
      if(this.receivedRequests.length==0) this.noReceived=true;
      if(this.pendingPosts.length==0) this.noPendingPosts=true;
      await this.reqService.deleteClearedRequests();
  }

  async ionViewWillEnter()
  {
    this.ngOnInit();
  }

  respondToRequest(requestID:string) { //open modal 
  
      let myModal = this.modalCtrl.create(RequestModalPage, { 
        'myParam': requestID });
        myModal.onDidDismiss(() => {
          this.ngOnInit();
        });
      myModal.present();
    
  }

  pendingAlert(requestID:string)
  {
    let pendingMessage = this.alertCtrl.create({
    title: 'Request Status Info:',
    message: 'This request is still pending. Once it\'s accepted, come back here for their contact info! Or, you can clear the request now.',
    buttons: [
      {
        text: 'Ok!'
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
           this.ngOnInit();
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
          this.ngOnInit();
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

  async requestHasExpired(requestID)
  {
    let pendingMessage = this.alertCtrl.create({
    title: 'Request has expired!',
    message: "This event is no longer available.",
    buttons: [
      {
        text: 'Clear this request.',
        handler: () => {
          this.reqService.clearRequestSender(requestID);
          this.ngOnInit();
        }
      }
    ]
  });
  

  pendingMessage.present()

  }


  async requestHasExpiredReceiver(requestID)
  {
    let pendingMessage = this.alertCtrl.create({
    title: 'Request has expired!',
    message: "This event is no longer available.",
    buttons: [
      {
        text: 'Clear this request.',
        handler: () => {
          this.reqService.clearRequestReceiver(requestID);
          this.ngOnInit();
        }
      }
    ]
  });

  pendingMessage.present()
  }
}
