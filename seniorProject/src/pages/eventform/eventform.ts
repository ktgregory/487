import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import { AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup} from '@angular/forms';
import { SelectSearchableComponent } from 'ionic-select-searchable';
import { AngularFirestore} from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';




@Component({
  selector: 'page-eventform',
  templateUrl: 'eventform.html'
})
export class EventFormPage {

  events=[];
  event;
  userID;
  username;
  public eventForm: FormGroup;
  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
      public formBuilder: FormBuilder, private authData: AuthProvider, 
      private afs: AngularFirestore,) { 

      this.eventForm = formBuilder.group({
        event: [''],
        date:[''],
        time:[''],
        description:['']
      });


    }

    async ngOnInit()
    {
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
    this.goToTabs();
    }

    portChange(event: { //https://www.npmjs.com/package/ionic-select-searchable
      component: SelectSearchableComponent,
      value: any 
      }) {
      console.log('event:', event.value);
    }
  

    async submitEventForm()
    {
      let timeString = this.eventForm.value.date;
      let status ="approved";
      if (this.eventForm.value.event.name.toString() == "Other")
      {
        status = "pending";
      }
      console.log(timeString);
      let id = this.afs.createId();
       this.afs.collection(`posts`).doc(id).set({
        uid: this.userID,
        event: this.eventForm.value.event.name,
        description: this.eventForm.value.description,
        date: new Date(timeString),
        username: this.username,
        postID: id,
        status: status
        })
        .then(any=>{
            this.submitEvent();
            this.ngOnInit();
        });
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
              this.goToTabs();
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
  }


