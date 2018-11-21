import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

@Injectable()
export class TimeDateCalculationsProvider {
  constructor(private afs: AngularFirestore) {}


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


  getTimeString(element)
  {
    // Creates a string of the event's time stamp. 
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(element.date.seconds);
    let pmOrAm;
    let minString;
    let date = timestamp.toString().substring(16,21);
    let hour = parseInt(date.substring(0,2));
    let min = parseInt(date.substring(3,5));
    if (hour > 12)
    {
      hour = hour - 12;
      pmOrAm = "PM";
    }
    else if(hour==12)
    {
      pmOrAm= "PM";
    }
    else
    {
      pmOrAm = "AM"
    }
    if(min<10) minString = "0" + min;
    else minString = min.toString();
    let dateString = (hour + ":" + minString + " " + pmOrAm);
    return dateString;
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
}
