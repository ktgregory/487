import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

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
   console.log(posts);
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
    if(daysUntil<-1)
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

  async getPendingPosts(userID:string)
  {
    let posts =[];
    let postQuery = await this.afs.firestore.collection(`posts`).where("uid","==",userID).where("status","==","pending");    
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

  async deleteEvent(eventID:string)
  {
    await this.afs.firestore.collection("events").doc(eventID).delete();
  }

  async approvePost(postID:string, eventName:string, date)
  {
    let eventInfo = null;
    let eventQuery = await this.afs.firestore.collection(`events`).where("name","==",eventName);    
    await eventQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          eventInfo = doc.data();
      })
    });
    if (eventInfo!=null)
    {
      if((eventInfo.name == eventName) && (eventInfo.date.seconds == date.seconds))
      {
        return Promise.reject('An event by this name on this date already exists!');
      }
    }    
    else
    {
      let id = this.afs.createId();
      this.afs.collection(`events`).doc(id).set({
        name: eventName,
        status: "approved",
        date: date
       });
       this.afs.doc(`posts/${postID}`).update({
        status:"approved"
        });
    }
  }

  async checkIfUserHasPosted(uid:string, eventName:string)
  {
    let eventInfo = null;
    let postQuery = await this.afs.firestore.collection(`posts`).where("event","==",eventName).where("uid","==",uid);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          eventInfo = doc.data();
      })
    });
    if(eventInfo==null) return true;
    else return Promise.reject("You have already posted about this event!");
  }

  async getAllEvents()
  {
    let events=[];
    let postQuery = await this.afs.firestore.collection(`events`);
    await postQuery.get().then((querySnapshot) => { 
        querySnapshot.forEach((doc) => {
          events.push(doc.data());
      })
    });
    events.forEach(event=>
      {
        let timestamp = new Date(0);
        timestamp.setUTCSeconds(event.date.seconds);
        let day = timestamp.getUTCDate();
        let month = timestamp.getUTCMonth();
        let year = timestamp.getUTCFullYear();
        event.dateString = ((month+1) + "/" + day + "/" + year);
      });
    return events;
  }
  

}
