
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
/*
  Generated class for the EventInfoProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/



@Injectable()
export class EventInfoProvider {
  
  constructor(private afs: AngularFirestore) {
    
  }

  async getPostsForTimeline()
  {
    let posts=[];
    let postQuery = await this.afs.firestore.collection(`posts`).where("status","==","approved");    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          posts.push(doc.data());
      })
   });
   
   return this.eventTimeCalculations(posts);

  }

  async getPendingEvents()
  {
    let posts=[];
    let postQuery = await this.afs.firestore.collection(`posts`).where("status","==","pending");
    await postQuery.get().then((querySnapshot) => { 
        querySnapshot.forEach((doc) => {
          posts.push(doc.data());
      })
    });
    return this.eventTimeCalculations(posts);
  }
  
  eventTimeCalculations(posts:any[])
  {
   posts.forEach(element => {
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(element.date.seconds);
    let day = timestamp.getUTCDate();
    let month = timestamp.getUTCMonth();
    let year = timestamp.getUTCFullYear();
   
    element.dateString = ((month+1) + "/" + day + "/" + year);
    let timestamp2 = new Date();
    let oneDay = 24*60*60*1000;
    let daysUntil = Math.round(((timestamp.getTime() - timestamp2.getTime())/(oneDay)));
    
    element.daysUntil = daysUntil;
    
    let weeks = Math.round((daysUntil/7));
    if(daysUntil<0)
    {
      element.notExpired = false;
      element.timeUntil = "expired";
    }
    else if(weeks<1)
    {
      element.notExpired = true;
      element.timeUntil = "in < 1 wk";
    }
    else if(weeks==1)
    {
      element.notExpired = true;
      element.timeUntil = "in ";
      element.timeUntil += weeks.toString();
      element.timeUntil += " wk";
    }
    else 
    {
      element.notExpired = true;
      element.timeUntil = "in ";
      element.timeUntil += weeks.toString();
      element.timeUntil += " wks";
    }
  
    // https://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates
   });

   return posts;

  }


  async getEventTimeInfoWithID(userID:string)
  {
    let posts =[];
    let postQuery = await this.afs.firestore.collection(`posts`).where("uid","==",userID);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
    
          posts.push(doc.data());
      })
    });

   return this.eventTimeCalculations(posts);

  }

  async deletePost(postID:string)
  {
    await this.afs.firestore.collection("posts").doc(postID).delete();
  }

  async approvePost(postID:string, eventName:string)
  {
    
    
    let eventInfo;
    let postQuery = await this.afs.firestore.collection(`events`).where("name","==",eventName);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          eventInfo = doc.data();
      })
    });

    if(eventInfo.name == eventName)
    {
      return Promise.reject('An event by this name already exists!');
    }
    else
    {
      this.afs.collection(`events`).doc(postID).set({
        name: eventName,
        status: "approved"
       });
       this.afs.doc(`posts/${postID}`).update({
        status:"approved"
        });

    }

  }

}
