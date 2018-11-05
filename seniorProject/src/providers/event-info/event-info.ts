import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class EventInfoProvider {
  
  constructor(private afs: AngularFirestore) {}


  //https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
  

  async getPendingEvents()
  {
    // Retrieves pending events from the database and adds 
    // dateString, notExpired, and timeUntil attributes to 
    // each event. Used for Admin interface. 
    let posts=[];
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("status","==","pending");
    await postQuery.get().then((querySnapshot) => { 
        querySnapshot.forEach((doc) => {
          posts.push(this.eventTimeCalculations(doc.data()));
      })
    });
    return posts;
  }
  
  eventTimeCalculations(element)
  {
    // Creates a string for the event's date and 
    // calculates the time until the event. Also
    // determines if an event is expired. 
  
    this.getDateString(element);
    let daysUntil = this.calculateDaysUntil(element);
  
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
   return element;
  }


  async getEventTimeInfoWithID(userID:string)
  {
    // Gets posts and corresponding time calculations and date string
    // that a user has posted. 
    let posts =[];
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("uid","==",userID);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          posts.push(this.eventTimeCalculations(doc.data()));
      })
    });
   return posts;
  }

  getDateString(element)
  {
    // Creates a string of the event's date. 
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(element.date.seconds);
    let day = timestamp.getUTCDate();
    let month = timestamp.getUTCMonth();
    let year = timestamp.getUTCFullYear();
    element.dateString = ((month+1) + "/" + day + "/" + year);
  }

  calculateDaysUntil(element)
  {
    // Returns the number of days until the passed event.
    // SOURCE: 
    // https://stackoverflow.com/questions/2627473/
    // how-to-calculate-the-number-of-days-between-two-dates
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(element.date.seconds);
    let timestamp2 = new Date();
    let oneDay = 24*60*60*1000;
    let daysUntil = Math.round(((timestamp.getTime() 
        - timestamp2.getTime())/(oneDay)));
    return daysUntil;
  }

  async deletePost(postID:string)
  {
    // Removes a post from the database by its ID. 
    await this.afs.firestore.collection("posts").doc(postID).delete();
  }

  async deleteEvent(eventID:string)
  {
    // Removes an event from the database by its ID. 
    await this.afs.firestore.collection("events").doc(eventID).delete();
  }

  async approvePost(postID:string, eventName:string, date)
  {
    // Checks to see that an event does not already exist by the
    // same name and date before creating a new event entry in the 
    // database. Also sets the user's pending post to approved. 
    let eventInfo = null;
    let eventQuery = await this.afs.firestore.collection(`events`)
    .where("name","==",eventName);    
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
        date: date,
        eventID: id
       });
       this.afs.doc(`posts/${postID}`).update({
        status:"approved"
        });
    }
  }

  async checkIfUserHasPosted(uid:string, eventName:string)
  {
    // Checks to see if a user has already posted about an event. 
    let eventInfo = null;
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("event","==",eventName).where("uid","==",uid);    
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
    // Gets all events from the event collection in the database and 
    // creates a string of each event's date.
    let events=[];
    let postQuery = await this.afs.firestore.collection(`events`);
    await postQuery.get().then((querySnapshot) => { 
        querySnapshot.forEach((doc) => {
          events.push(doc.data());
      })
    });
    events.forEach(event=>
    {
      this.getDateString(event);
    });
    return events;
  }

}
