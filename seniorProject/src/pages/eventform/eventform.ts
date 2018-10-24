import { Component } from '@angular/core';
import { NavController, ModalController, ViewController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
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
  public eventForm: FormGroup;
  showPart2=false;

  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
      public formBuilder: FormBuilder, private authData: AuthProvider, 
      private afs: AngularFirestore,public modalCtrl: ModalController,
      private eventInfo: EventInfoProvider, public viewCtrl: ViewController) { 

      this.eventForm = formBuilder.group({
        event: [''],
        description:[''],
        name:[''],
        date:['']
      });

    }

    async ngOnInit()
    {
      this.minDate = new Date().toISOString();
      console.log(this.minDate);
      this.events=[];
      this.userID = await this.authData.getUserID();
      let userQuery = await this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
      await userQuery.get().then((querySnapshot) => { 
          
         querySnapshot.forEach((doc) => {
          this.username = doc.data().name;
         });
        });

        let eventQuery = await this.afs.firestore.collection('events');    
        await eventQuery.get().then((querySnapshot) => { 
            
           querySnapshot.forEach((doc) => {
              this.events.push(doc.data());
           });
        });

        this.events.forEach(element => {
          if(element.name!="Other")
          {
            let timestamp = new Date(0);
            timestamp.setUTCSeconds(element.date.seconds);
            let day = timestamp.getUTCDate();
            let month = timestamp.getUTCMonth();
           
            let dateString = ((month+1) + "/" + day);
            element.name2=element.name + " (" + dateString + ")";

            let timestamp2 = new Date();
            let oneDay = 24*60*60*1000;
            let daysUntil = Math.round(((timestamp.getTime() - timestamp2.getTime())/(oneDay)));
            if (daysUntil<0)
            {
              this.afs.firestore.collection("events").doc(element.eventID).delete();  
            }
          }
          else
          {
            element.name2 = element.name;
          }
        });
    }

    goToTabs() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(TabsPage);
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
            text: 'Nevermind.',
            handler: () => {
              console.log('Disagree clicked');
            }
          }
        ]
      });
      confirm.present()
    }

    submitEvent()
    {
    let confirm = this.alerCtrl.create({
      title: 'Submission succeeded!',
      buttons: [
        {
          text: 'Okay.'
        }
      ]
    });
    confirm.present();
    this.viewCtrl.dismiss();
    }

    portChange(event: { //https://www.npmjs.com/package/ionic-select-searchable
      component: SelectSearchableComponent,
      value: any 
      }) {
        if(event.value.name=="Other")
        {
          this.showPart2=true;
        }
        else
        {
          this.showPart2=false;
        }
    }
  

    async submitEventForm()
    {
      // add to the "events" collection, dates and get dates from there
      // for existing pre-approved events, and display those dates on the list
      // if an event is selected from that list, get date from there
      // otherwise, get date from new form 

      let date = this.eventForm.value.event.date;
      let status ="approved";
      let name;
      if (this.showPart2)
      {
        status = "pending";
        date = this.eventForm.value.date + "T00:00";
        date = new Date(date);
        name = this.eventForm.value.name;
      }
      else
      {
        name = this.eventForm.value.event.name;
      }
        let userCheck = await this.eventInfo.checkIfUserHasPosted(this.userID, name).catch(error=>
          {
            this.presentError(error);
          });
      
        if (userCheck)
        {
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
            this.openModalMessage(id); 
            }
            else
            {
              this.submitEvent();
              this.ngOnInit();
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
              this.viewCtrl.dismiss();
            }
          },
          {
            text: 'Nevermind.',
            handler: () => {
              console.log('Disagree clicked');
            }
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
            text: 'Ok!',
            handler: () => {    
             
            }
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


