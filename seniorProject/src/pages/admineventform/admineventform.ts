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
  selector: 'page-admineventform',
  templateUrl: 'admineventform.html'
})
export class AdmineventformPage {


  public eventForm: FormGroup;
  minDate;

  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
      public formBuilder: FormBuilder, private afs: AngularFirestore, 
      public modalCtrl: ModalController, public viewCtrl: ViewController) { 

      this.eventForm = formBuilder.group({
        name:[''],
        date:['']
      });

    }

    async ngOnInit()
    {
      this.minDate = new Date().toISOString();
     
    }



    confirmSubmission()
    {
      let confirm = this.alerCtrl.create({
        title: 'Add new event?',
        message: 'Are you sure you want to add this event to the event list?',
        buttons: [
          {
            text: 'Yes, add!',
            handler: () => {
              this.submitEventForm();
              this.navCtrl.pop();
            }
          },
          {
            text: 'Nevermind.',
            handler: () => {
              
            }
          }
        ]
      });
      confirm.present()
    }

    dismiss()
    {
      this.navCtrl.pop();
    }

    async submitEventForm()
    {
      // add to the "events" collection, dates and get dates from there
      // for existing pre-approved events, and display those dates on the list
      // if an event is selected from that list, get date from there
      // otherwise, get date from new form 
      let id = this.afs.createId();
      this.afs.collection(`events`).doc(id).set({
          eventID: id,
          name: this.eventForm.value.name,
          status: "approved",
          date: new Date(this.eventForm.value.date)
        });

      }
        
    }

    



