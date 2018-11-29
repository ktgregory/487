import { Component, NgZone } from '@angular/core';
import { NavController, 
  AlertController, 
  ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { RequestProvider } from '../../providers/request/request';
import { RequestModalPage } from '../request-modal/request-modal';


@Component({
  selector: 'page-request-center',
  templateUrl: 'request-center.html'
})
export class RequestCenterPage {

  userID;
  receivedRequests=[];
  sentRequests=[];
  noSent = false;
  noReceived = false;

  constructor(public navCtrl: NavController, private authData: AuthProvider,
    private afs: AngularFirestore, private reqService: RequestProvider,
    public alertCtrl: AlertController, public modalCtrl: ModalController,
    public NgZone:NgZone) {}

   
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

  respondToRequest(requestID:string, userID: string) { 
    // Opens Request modal and passes relevant parameters. 
    let myModal = this.modalCtrl.create(RequestModalPage, { 
      'requestID': requestID,
      'otherUserID': userID,
      'userID': this.userID
    });
        myModal.onDidDismiss(() => {
          this.ngOnInit(); // Refreshes the page. 
    });
    myModal.present();
    this.afs.firestore.collection('requests').doc(requestID).update({viewed:true});
  }

  pendingAlert(requestID:string)
  {
    // Displayed for a pending sent request. 
    let pendingMessage = this.alertCtrl.create({
      title: 'Request Status Info:',
      message: 'This request is still pending.' 
      + ' Once it\'s accepted, you will be notified!'
      + ' Or, you can clear the request now.',
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
            this.ngOnInit();
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
    let request;
    request = await this.reqService.getRequestInfo(requestID);
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
    pendingMessage.present();
    this.afs.firestore.collection('requests').doc(requestID).update({viewedBySender:true});
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
    .where("senderID","==",this.userID); 
      await requestQuery.onSnapshot((snapshot) => { 
      snapshot.docChanges().forEach(async(change) => { 
        let request;
        // If a new request is sent, it is added to the sentRequests array.
        if (change.type === "added") {
          if((change.doc.data().senderStatus=="uncleared") || 
          (change.doc.data().senderStatus=="cleared" && change.doc.data().status=="accepted" && change.doc.data().viewedBySender==false))
          {
            request = await this.getReceiverInfo(this.reqService.checkExpiredRequests(change.doc.data()));
            this.sentRequests.push(request);
            if (this.noSent==true) this.noSent=false;
          }
        }
        // If a request is deleted, it is removed from the sentRequests array.
        if (change.type === "removed") {
         this.sentRequests = this.sentRequests.filter(
           item => item !== (this.reqService.checkExpiredRequests(change.doc.data())));
          if (this.sentRequests.length==0) this.noSent = true;
        }
        
        if (change.type === "modified")
        {
          if (change.doc.data().senderStatus=="cleared" && change.doc.data().status=="accepted" && change.doc.data().viewedBySender==false)
          {
            this.checkForSentRequest(await change.doc.data());
          }
          else
          {
            this.updateRequestInfoSent(this.reqService.checkExpiredRequests(change.doc.data()));
          }
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
      snapshot.docChanges().forEach(async(change) => {
        let request;
        if (change.type === "added") {
          // If a new request is received, it is added to the receivedRequests array.
          request = await this.getSenderInfo(this.reqService.checkExpiredRequests(change.doc.data()));
          this.receivedRequests.push(request);
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
          // remove request if accepted by receiver 
          this.updateRequestInfoReceived(this.reqService.checkExpiredRequests(change.doc.data()));
        }
      });  
    });
  }


  updateRequestInfoReceived(updatedRequest)
  {
    // Updates the request's information should there
    // be any changes in the database. 
    this.receivedRequests.forEach(request=>
    {
      if(request.requestID == updatedRequest.requestID)
      {
        request.status = updatedRequest.status;
        request.senderStatus = updatedRequest.senderStatus;
        request.viewed = updatedRequest.viewed;
        if (request.status == "accepted")
          this.removeRequest(request);
      }
    });
  }

  updateRequestInfoSent(updatedRequest)
  {
    // Updates the request's information should there
    // be any changes in the database. 
    this.sentRequests.forEach(request=>
    {
      if(request.requestID == updatedRequest.requestID)
      {
        request.status = updatedRequest.status;
        request.senderStatus = updatedRequest.senderStatus;
        request.viewedBySender = updatedRequest.viewedBySender;
      }
    });
  }

  removeRequest(requestToRemove)
  {
    // Removes a request from the received request array. 
    for(let i=0; i < this.receivedRequests.length; i++)
    {
      if(this.receivedRequests[i].requestID == requestToRemove.requestID)
      {
        this.receivedRequests.splice(i,1);
      }
    }
  }

  async getSenderInfo(request)
  {
    // Gets the sender's profile image.
    let ref = this.afs.firestore.collection('users').where('uid','==',request.senderID);
    await ref.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        request.image= await change.doc.data().profileimage;
        request.senderName= await change.doc.data().name;
      });
    });
    return request;
  }

  async getReceiverInfo(request)
  {
    // Gets the receiver's profile image.
    let ref = this.afs.firestore.collection('users').where('uid','==',request.receiverID);
    await ref.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        request.image = await change.doc.data().profileimage;
        request.receiverName= await change.doc.data().name;
      });
    });
    return request;
  }

  async checkForSentRequest(request2)
  {
    let found=false;
    this.sentRequests.forEach(request=>
      {
        if(request.requestID == request2.requestID)
        {
          found=true;
        }
      });

    if(found==false)
    {
      request2 = await this.getReceiverInfo(this.reqService.checkExpiredRequests(request2));
      this.sentRequests.push(request2);
      this.noSent=false;
    }
  }
}
