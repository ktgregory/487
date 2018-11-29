import { AngularFirestore } from 'angularfire2/firestore';
import { Injectable } from '@angular/core';
import { TimeDateCalculationsProvider } from '../time-date-calculations/time-date-calculations';
import { AngularFireStorage } from 'angularfire2/storage';



@Injectable()
export class EventProvider {
  
  constructor(private afs: AngularFirestore, private timeInfo: TimeDateCalculationsProvider,
    private storage: AngularFireStorage) {}


  //https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
  

  async getPendingEvents(posts)
  {
    // Retrieves pending events from the database and adds 
    // dateString, notExpired, and timeUntil attributes to 
    // each event. Used for Admin interface. 
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("status","==","pending");
    await postQuery.onSnapshot((querySnapshot) => { 
      querySnapshot.docChanges().forEach(async (change) => {
        if(change.type==="added")
          posts.push(this.timeInfo.eventTimeCalculations(change.doc.data()));
        if(change.type==="modified" && (change.doc.data().status=="pending"))
          posts = this.removePost(posts, change.doc.data());
        if(change.type==="removed")
        {
          posts = this.removePost(posts, change.doc.data());
        }
      })
    });
      
  }
  
  removePost(posts, approvePost) { 
    
    for (let i=0; i<posts.length; i++)
    {
      if (posts[i].postID==approvePost.postID)
      {
        posts.splice(i,1);
      }
    }
  }

  async deletePost(postID:string)
  {
    // Removes a post from the database by its ID as well as its corresponding image.
    await this.storage.ref(`postPhotos/${postID}`).delete();
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
      this.timeInfo.getDateString(event);
    });

    return events;
  }

}
