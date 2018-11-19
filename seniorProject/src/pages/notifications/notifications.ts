import { Component, NgZone } from '@angular/core';
import { NavController, 
  AlertController, 
  ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { RequestProvider } from '../../providers/request/request';
import { RequestModalPage } from '../../pages/request-modal/request-modal';
import { TimeDateCalculationsProvider } from '../../providers/time-date-calculations/time-date-calculations';

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
    public NgZone:NgZone, private timeInfo: TimeDateCalculationsProvider) {}

   
  async ngOnInit()
  {
      this.noSent = false;
      this.noReceived = false;
      this.userID = await this.authData.getUserID(); 
      this.receivedRequests = [];//await this.reqService.getReceivedRequests(this.userID);
      this.sentRequests = []; //await this.reqService.getSentRequests(this.userID);
      if(this.sentRequests.length==0) this.noSent=true;
      if(this.receivedRequests.length==0) this.noReceived=true;
      await this.reqService.deleteClearedRequests();
      await this.sentRequestListener();
      await this.receivedRequestListener();
  }

  ionViewWillEnter()
  {
    // this.receivedRequests = [];//await this.reqService.getReceivedRequests(this.userID);
    // this.sentRequests = []; //await this.reqService.getSentRequests(this.userID);
    // this.pendingPosts = []; //await this.eventInfo.getPendingPosts(this.userID); 
    // this.ngOnInit();
  }

  respondToRequest(requestID:string, userID: string) { 
    // Opens Request modal and passes relevant parameters. 
    let myModal = this.modalCtrl.create(RequestModalPage, { 
      'requestID': requestID,
      'otherUserID': userID,
      'userID': this.userID
    });
        myModal.onDidDismiss(() => {
        //this.ngOnInit();
    });
    myModal.present();
  }

  pendingAlert(requestID:string)
  {
    // Displayed for a pending sent request. 
    let pendingMessage = this.alertCtrl.create({
      title: 'Request Status Info:',
      message: 'This request is still pending.' 
      + 'Once it\'s accepted, you will be notified!'
      + 'Or, you can clear the request now.',
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
    // Clears a request and refreshes arrays after user confirms
    // that they want to clear the request. 
    let clearMessage = this.alertCtrl.create({
      title: 'Clear this pending request?',
      message: 'If you clear this request, it cannot be undone!',
      buttons: [
        {
          text: 'Yes, clear it please.',
          handler: () => {
            this.reqService.clearRequestSender(requestID);
          }
        },
        {
          text: 'Nevermind!'
        }
      ]
    });
    clearMessage.present();
  }


  async viewAccepted(requestID:string)
  {
    // Displayed when a request has been accepted. 
    let request2= await this.reqService.getRequestInfo(requestID);
    let request = request2[0];
    let name = request.receiverName;
    let topic = request.eventName;
    let pendingMessage = this.alertCtrl.create({
      title: 'Request was accepted!',
      message: "You can now visit the Messages Page to chat with " 
        + name + " about " + topic + "!",
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

  async requestHasExpired(requestID)
  {
    // Message for expired sent request. 
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
    // Message for expired received request. 
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

  async sentRequestListener()
  {
    // Queries for requests sent by the current user
    // and listens for new additions. 
    let requestQuery = await this.afs.firestore.collection(`requests`)
    .where("senderID","==",this.userID).where("senderStatus","==","uncleared"); 
      await requestQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(change => {
              
        // If a new request is sent, it is added to the sentRequests array.
        if (change.type === "added") {
          this.sentRequests.push(this.reqService.checkExpiredRequests(change.doc.data()));
          if (this.noSent==true) this.noSent=false;
        }
        // If a request is deleted, it is removed from the sentRequests array.
        if (change.type === "removed") {
         this.sentRequests = this.sentRequests.filter(
           item => item !== (this.reqService.checkExpiredRequests(change.doc.data())));
          if (this.sentRequests.length==0) this.noSent = true;
        }
        
        if (change.type === "modified")
        {
          this.updateRequestInfoSent(this.reqService.checkExpiredRequests(change.doc.data()));
        }

      });  
    });
  }

  async receivedRequestListener()
  {
    // Queries for requests received by the current user
    // and listens for new additions. 
    let requestQuery = await this.afs.firestore.collection(`requests`)
    .where("receiverID","==",this.userID).where("status","==","pending"); 
    await requestQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          // If a new request is received, it is added to the receivedRequests array.
          this.receivedRequests.push(this.reqService.checkExpiredRequests(change.doc.data()));
          if (this.noReceived==true) this.noReceived=false;
        }
        if (change.type === "removed") {
          // If a request is deleted, it is removed from the receivedRequests array.
         this.receivedRequests = this.receivedRequests.filter(
           item => item !== (this.reqService.checkExpiredRequests(change.doc.data())));
          if (this.receivedRequests.length==0) this.noReceived = true;
        }
        if (change.type === "modified")
        {
          this.updateRequestInfoReceived(this.reqService.checkExpiredRequests(change.doc.data()));
        }
      });  
    });
  }


  updateRequestInfoReceived(updatedRequest)
  {
    this.receivedRequests.forEach(request=>
    {
      if(request.requestID == updatedRequest.requestID)
      {
        request.status = updatedRequest.status;
        request.senderStatus = updatedRequest.senderStatus;
      }
    });
  }

  updateRequestInfoSent(updatedRequest)
  {
    this.sentRequests.forEach(request=>
    {
      if(request.requestID == updatedRequest.requestID)
      {
        request.status = updatedRequest.status;
        request.senderStatus = updatedRequest.senderStatus;
      }
    });
  }
}
