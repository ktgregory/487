
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
/*
  Generated class for the EventInfoProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/



@Injectable()
export class EventInfoProvider {
  
  posts=[];
  posts2=[];
  constructor(private afs: AngularFirestore) {
    
  }

  async getEventTimeInfo()
  {
    let postQuery = await this.afs.firestore.collection(`posts`);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
          this.posts.push(doc.data());
      })
   });
   
   return this.eventTimeCalculations(this.posts);

  }
  
  eventTimeCalculations(posts:any[])
  {
   posts.forEach(element => {
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(element.date.seconds);
    let day = timestamp.getUTCDay();
    let month = timestamp.getUTCMonth();
    let year = timestamp.getUTCFullYear();
    console.log(timestamp);
    element.dateString = ((month+1) + "/" + day + "/" + year);
    let timestamp2 = new Date();
    let oneDay = 24*60*60*1000;
    let daysUntil = Math.round(((timestamp.getTime() - timestamp2.getTime())/(oneDay)));
    console.log(daysUntil); 
    element.daysUntil = daysUntil;
    
    let weeks = Math.floor((daysUntil/7));
    if(daysUntil==-0)
    {
      element.notExpired = false;
      element.timeUntil = "expired";
    }
    else if(weeks==0)
    {
      element.notExpired = true;
      element.timeUntil = "in < 1 wk";
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
    let postQuery = await this.afs.firestore.collection(`posts`).where("uid","==",userID);    
    await postQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
         // console.log(doc.data());
          this.posts2.push(doc.data());
      })
    });

   return this.eventTimeCalculations(this.posts2);

  }

}
