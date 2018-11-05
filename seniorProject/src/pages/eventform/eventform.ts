import { Component } from '@angular/core';
import { NavController, 
  ModalController, 
  ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup} from '@angular/forms';
import { SelectSearchableComponent } from 'ionic-select-searchable';
import { AngularFirestore} from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';
import { EventInfoProvider } from '../../providers/event-info/event-info';


@Component({
  selector: 'page-eventform',
  templateUrl: 'eventform.html'
})
export class EventFormPage {

    events=[];
    event;
    userID;
    username;
    minDate;
    name="";
    date="";
    showPart2=false;
    showEventInfo=false;
    public eventForm: FormGroup;

constructor(public navCtrl: NavController, public alerCtrl: AlertController,
      public formBuilder: FormBuilder, private authData: AuthProvider, 
      private afs: AngularFirestore,public modalCtrl: ModalController,
      private eventInfo: EventInfoProvider, public viewCtrl: ViewController) { 

      // Sets eventForm variable to the corresponding html inputs.
      this.eventForm = formBuilder.group({
        event: [''],
        description:[''],
        name:[''],
        date:['']
      });

}

async ngOnInit()
{
  // Gets minimum selectable date for the date input on the form. 
  this.minDate = new Date().toISOString(); 
  this.events=[];
  this.userID = await this.authData.getUserID();

  // Queries for the current user's name so that it can be associated 
  // with their post should they submit one. 
  let userQuery = await this.afs.firestore.collection(`users`)
  .where("uid","==",this.userID);
  await userQuery.get().then((querySnapshot) => { 
    querySnapshot.forEach((doc) => {
      this.username = doc.data().name;
    });
  });

  // Queries to populate the event list. 
  let eventQuery = await this.afs.firestore.collection('events');    
  await eventQuery.get().then((querySnapshot) => {       
    querySnapshot.forEach((doc) => {
      this.events.push(doc.data());
    });
  });

  // Creates a time string to be displayed along
  // with the event's name on the event list. 
  this.events.forEach(element => {
    // if the current events element is not Other, then 
    // create a timestring to display (adds the string
    // to the element's "name2" attribute). 
    if(element.name!="Other")
    {

      // Getting the month and day from the Firebase timestamp.
      let timestamp = new Date(0);
      timestamp.setUTCSeconds(element.date.seconds);
      let day = timestamp.getUTCDate();
      let month = timestamp.getUTCMonth();
      let dateString = ((month+1) + "/" + day);
      element.name2=element.name + " (" + dateString + ")";

     
      // Calculates days until the event to determine if it is expired. 
      let timestamp2 = new Date();
      let oneDay = 24*60*60*1000;
      let daysUntil = Math.round(((timestamp.getTime() - timestamp2.getTime())/(oneDay)));
      if (daysUntil<-1)
      { 
        // If the event is expired, it is deleted from the event list. 
        this.afs.firestore.collection("events").doc(element.eventID).delete();  
      }
    }
    else
    {
      element.name2 = element.name;
    }
  });
}

confirmSubmission()
{
  let confirm = this.alerCtrl.create({
    title: 'Submit this event post?',
    message: 'Are you sure you want to submit this post?',
    buttons: [
    {
      text: 'Yes, submit!',
      handler: () => {
        this.submitEventForm();
      }
    },
    {
      text: 'Nevermind.'
    }
    ]
  });
  confirm.present()
}

submitEvent()
{
  // Displays after an event post has been successfully
  // submitted. 
  let confirm = this.alerCtrl.create({
    title: 'Submission succeeded!',
    buttons: [
    {
      text: 'Okay.'
    }
    ]
  });
  confirm.present();
  // Closes the modal as the alert is being displayed. 
  this.viewCtrl.dismiss();
}

portChange(event: { 
// SOURCE: https://www.npmjs.com/package/ionic-select-searchable
// Creates event list modal (via the installed plugin)
component: SelectSearchableComponent,
value: any 
}) {
  if(event.value.name=="Other")
  {
    // If "Other" is selected, show the two additional inputs.
    this.showPart2=true;
    this.showEventInfo=false;
  }
  else
  {
    // If an event is selected, display the event's 
    // information in the form (not modifiable). 
    let timestamp = new Date(0);
    timestamp.setUTCSeconds(event.value.date.seconds);
    let day = timestamp.getUTCDate();
    let month = timestamp.getUTCMonth();
    this.name = event.value.name;
    this.date = ((month+1) + "/" + day);
    this.showPart2=false;
    this.showEventInfo=true;
  }
}


async submitEventForm()
{
  // If an event is selected from that list, get date from there.
  // Otherwise, get date from the form input.
  let date = this.eventForm.value.event.date;
  let status = "approved";
  let name;
  if (this.showPart2)
  {
    // If "Other" was selected, the status should be changed to
    // pending. 
    status = "pending";

    // Needed to create a timestamp for the database entry. 
    date = this.eventForm.value.date + "T00:00";
    date = new Date(date);

    // Since other was selected, name comes from form input. 
    name = this.eventForm.value.name;
  }
  else
  {
    // Since other was not selected, name comes from event array. 
    name = this.eventForm.value.event.name;
  }

  // Checks to make sure a user has not already posted about the 
  // selected event.
  let userCheck = await this.eventInfo.checkIfUserHasPosted(this.userID, name)
  .catch(error=>
  {
    this.presentError(error);
  });
  if (userCheck)
  {
    // Creates new document in the "posts" collection in the database. 
    let id = this.afs.createId();
    this.afs.collection(`posts`).doc(id).set({
      uid: this.userID,
      event: name,
      description: this.eventForm.value.description,
      date: date,
      username: this.username,
      postID: id,
      status: status
    })
    .then(any=>{
      if(status=="pending")
      {
        // Presents a message regarding the post needing to be approved. 
        this.openModalMessage(id); 
      }
      else
      {
        this.submitEvent();
      }
    });
  }
}




cancelForm()
{
  let confirm = this.alerCtrl.create({
    title: 'Cancel post?',
    message: 'Any information you\'ve entered will be lost!',
    buttons: [
    {
      text: 'Yes, cancel!',
      handler: () => {   
        // Closes the modal and returns to the Home page.  
        this.viewCtrl.dismiss();
      }
    },
    {
      text: 'Nevermind.'
    }
    ]
  });
  confirm.present()
}




presentError(error:string)
{
  let confirm = this.alerCtrl.create({
    title: 'Error!',
    message: error,
    buttons: [
    {
      text: 'Ok!'
    }
    ]
  });
  confirm.present()
}



openModalMessage(postID:string)
{
  let confirm = this.alerCtrl.create({
    title: 'Submit a new event for approval?',
    message: 'Because you have selected \"Other,\" your post is subject to approval!',
    buttons: [
    {
      text: 'Yes, continue!',
      handler: () => {
        this.submitEvent();
      }
    },
    {
      text: 'Nevermind.',
      handler: () => {
        this.eventInfo.deletePost(postID);
      }
    }
    ]
  });
  confirm.present()
}

}


