import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class RequestProvider {

  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore) {
  }



  async createNewRequest(userID:string, postID:string)
  {
    let postInfo;
    let postQuery = await this.afs.firestore.collection(`posts`).where("postID","==",postID);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          postInfo = doc.data();
      })
    });

    let userInfo;
    let userQuery = await this.afs.firestore.collection(`users`).where("uid","==",userID);    
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
      let ref = await this.afs.firestore.collection(`requests`).where("postID","==",postID)
        .where("senderID", "==", userID);
      
        await ref.get().then((querySnapshot) => { 
          querySnapshot.forEach((doc) => {
            testData = doc.data();
         })
       });
      if(testData!=null)
      {
        return Promise.reject('You have already sent a request about this event!');
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
          receiverName: postInfo.username, //wrong
          senderStatus: "uncleared",
          date: new Date(year, month, day, 0,0,0, 0)
          });
      }
    }
  }

 async acceptRequest(requestID:string, contactInfo:string)
  {
    await this.afs.firestore.collection(`requests`).doc(requestID).update({
      status:"accepted",
      contact: contactInfo
    });

  }

async clearRequestSender(requestID:string)
  {
    await this.afs.firestore.collection(`requests`).doc(requestID).update({
      senderStatus:"cleared"
    });
  }

async clearRequestReceiver(requestID:string)
{
    await this.afs.firestore.collection(`requests`).doc(requestID).update({
      status:"cleared"
    });
}

async deleteClearedRequests()
{

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
    let requests=[];
    let requestQuery = await this.afs.firestore.collection(`requests`).where("receiverID","==",userID)
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
    requests.forEach(async request=>
    {
      console.log(request);
      if((request.senderStatus=="cleared") && (request.status=="cleared"))
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
    if(request.length!=0)
    {
      request.expired = false;
      let timestamp = new Date(0);
      timestamp.setUTCSeconds(request.date.seconds);
        let timestamp2 = new Date();
        let oneDay = 24*60*60*1000;
        let daysUntil = Math.round(((timestamp.getTime() - timestamp2.getTime())/(oneDay)));
        if(daysUntil<0)
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
    let requests=[];
    let requestQuery = await this.afs.firestore.collection(`requests`).where("senderID","==",userID)
    .where("senderStatus","==","uncleared");    
    await requestQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          requests.push(doc.data());
      })
    });
    requests.forEach(async request=>
      {
        request =  await this.checkExpiredRequests(request);
      });
      
      return requests;

    }

    async getRequestInfo(requestID:string)
    {
      let requestInfo=[];
      let reqQuery = await this.afs.firestore.collection("requests").where("requestID","==",requestID);    
      await reqQuery.get().then((querySnapshot) => { 
         querySnapshot.forEach((doc) => {
          requestInfo.push(doc.data());
        })
      });

      return requestInfo;
    }




}
