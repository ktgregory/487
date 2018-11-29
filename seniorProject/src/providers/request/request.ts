import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { TimeDateCalculationsProvider } from '../time-date-calculations/time-date-calculations';

@Injectable()
export class RequestProvider {

  constructor(private afs: AngularFirestore, 
    private timeInfo: TimeDateCalculationsProvider) {}


  async createNewRequest(userID:string, postID:string)
  {
    // Checks to see that the user is not trying to send 
    // a request to themselves and that they have not already
    // sent a request about the event before creating a new
    // request document in the database. 
    let postInfo;
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("postID","==",postID);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          postInfo = doc.data();
      })
    });

    let userInfo;
    let userQuery = await this.afs.firestore.collection(`users`)
    .where("uid","==",userID);    
    await userQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          userInfo = doc.data();
      })
    });

    if(userID == postInfo.uid)
    {
      return Promise.reject('You can\'t send a request to yourself!');
    }
    else 
    {
      let testData;
      let ref = await this.afs.firestore.collection(`requests`)
      .where("postID","==",postID)
        .where("senderID", "==", userID);
      
        await ref.get().then((querySnapshot) => { 
          querySnapshot.forEach((doc) => {
            testData = doc.data();
         })
       });
      if(testData!=null)
      {
        return Promise.reject('You have already sent a request' 
        + ' about this event!');
      }
      else
      {  
        let timestamp = new Date(0);
        timestamp.setUTCSeconds(postInfo.date.seconds);
        let day = timestamp.getUTCDate();
        let month = timestamp.getUTCMonth();
        let year = timestamp.getUTCFullYear();
        let id = this.afs.createId();
        this.afs.collection(`requests`).doc(id).set({
          senderID: userID,
          receiverID: postInfo.uid,
          postID: postID,
          senderName: userInfo.name,
          status:"pending",
          eventName: postInfo.event,
          requestID:id,
          contact:"",
          receiverName: postInfo.username,
          senderStatus: "uncleared",
          date: new Date(year, month, day, 0, 0, 0, 0),
          viewed:false,
          viewedBySender:false
        });
      }
    }
  }

 async acceptRequest(requestID:string)
  {
    // Sets a request's status to accepted in the database. 
    await this.afs.firestore.collection(`requests`).doc(requestID).update({
      status:"accepted"
    });
  }

  async clearRequestSender(requestID:string)
  {
    // Sets the sender's status to cleared.
    // This is used to prevent the request from being showed
    // in the sender's request center. 
    await this.afs.firestore.collection(`requests`).doc(requestID).update({
      senderStatus:"cleared"
    });
  }

  async clearRequestReceiver(requestID:string)
  {
    // Sets the request's status to cleared.
    // This is used to prevent the request from being showed
    // in the receiver's request center. 
    await this.afs.firestore.collection(`requests`).doc(requestID).update({
      status:"cleared"
    });
  }

  async deleteClearedRequests()
  {
    // Grabs all requests from the database and passes them
    // to the checkClearedRequests function.
    let requests=[];
    let requestQuery = await this.afs.firestore.collection(`requests`);   
      await requestQuery.get().then((querySnapshot) => { 
        querySnapshot.forEach((doc) => {
            requests.push(doc.data());
        })
      });
    await this.checkClearedRequests(requests);
  }

  async getReceivedRequests(userID:string)
  {
    // Gets requests that have been received by the user
    // and that are still pending. Also checks to see if 
    // the pending requests have expired. 
    let requests=[];
    let requestQuery = await this.afs.firestore.collection(`requests`)
      .where("receiverID","==",userID)
      .where("status","==","pending");    
    await requestQuery.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
      requests.push(doc.data());
      })
    });
    requests.forEach(async request=>
    {
      request = await this.checkExpiredRequests(request);
    });
    return requests;
  }


  async checkClearedRequests(requests)
  {
    // Filters requests array based on if the request has been 
    // cleared by both the receiver and the sender and deletes
    // those requests from the database. 
    requests.forEach(async request=>
    {
      if((request.senderStatus=="cleared") && (request.status=="cleared") && (request.expired))
      {
       await this.afs.collection('requests').doc(request.requestID).delete(); 
      }
      else if ((request.senderStatus=="cleared") && (request.status=="accepted") && (request.expired))
      {
        await this.afs.collection('requests').doc(request.requestID).delete(); 
      }
    });
    let requests2 = requests.filter(function(value, index, arr)
    { 
      return (!((value.senderStatus=="cleared")&&(value.status=="cleared"))); 
    });
    return requests2;
  }



 checkExpiredRequests(request)
  {
    // Checks to see if a request is expired by 
    // by calculating the days until the event. 
    if(request.length!=0)
    {
      request.expired = false;
      let daysUntil = this.timeInfo.calculateDaysUntil(request);
      if(daysUntil<-1)
      {
        request.expired = true;
      }
      else
      {
         request.expired = false;
      }
    }
    return request;
  }

  async getSentRequests(userID:string)
  {
    // Gets requests that a user has sent that have 
    // not been cleared. 
    let request;
    let requestQuery = await this.afs.firestore.collection(`requests`)
    .where("senderID","==",userID)
    .where("senderStatus","==","uncleared");    
    await requestQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach(async (doc) => {
          request = await this.checkExpiredRequests(doc.data());
        });
      }); 
    return request;
  }


  async getRequestInfo(requestID:string)
  {
    // Queries for a specific request document from the database
    // by its ID.
    let requestInfo=[];
    let reqQuery = await this.afs.firestore.collection("requests")
    .where("requestID","==",requestID);    
    await reqQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
        requestInfo.push(doc.data());
      })
    });
    return requestInfo;
  }

}
