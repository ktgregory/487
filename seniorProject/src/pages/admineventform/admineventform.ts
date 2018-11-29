import { Component } from '@angular/core';
import { NavController, ModalController, ViewController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup} from '@angular/forms';
import { AngularFirestore} from 'angularfire2/firestore';

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
      // The minimum date that appears as an option is
      // the current date. 
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
      // Creates a new document in the Events collection
      // in the database. 
      let id = this.afs.createId();
      this.afs.collection(`events`).doc(id).set(
        {
          eventID: id,
          name: this.eventForm.value.name,
          status: "approved",
          date: new Date(this.eventForm.value.date)
        });
    }
        
  }

    



