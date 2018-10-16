
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

    console.log(postInfo.uid);
    console.log(userID);
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
          senderStatus: "uncleared"
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
   return requests;
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
