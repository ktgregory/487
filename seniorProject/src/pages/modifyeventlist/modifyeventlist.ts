import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { EventProvider } from '../../providers/event/event';
import { AdmineventformPage } from '../admineventform/admineventform';

@IonicPage()
@Component({
  selector: 'page-modifyeventlist',
  templateUrl: 'modifyeventlist.html',
})
export class ModifyeventlistPage {

  events = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public viewCtrl: ViewController, private eventInfo:EventProvider, 
    public alertCtrl: AlertController) {
  }

  async ngOnInit()
  { 
    this.events = []; // Must be reset to an empty array in case ngOnInit
                      // is re-called to avoid duplicates in the array.
    this.events = await this.eventInfo.getAllEvents();
  }

  async ionViewWillEnter()
  {
    // Refreshes the list (i.e. when the admin has just 
    // created a new event). 
    this.ngOnInit();
  }

  dismiss() {
    // Closes the modal and returns to the main Admin page. 
    this.viewCtrl.dismiss();
  }

  confirmDeleteEvent(eventID:string) {
    let confirm = this.alertCtrl.create({
      title: 'Delete event?',
      message: 'Do you want to delete this event? This cannot be undone.',
      buttons: [
        {
          text: 'Yes.',
          handler: () => {
            this.eventInfo.deleteEvent(eventID);
            // Refreshes the event list after deletion. 
            this.ngOnInit();
          }
        },
        {
          text: 'Nevermind!',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    confirm.present()
  }

  createNewEvent()
  {
    this.navCtrl.push(AdmineventformPage);
  }

}
