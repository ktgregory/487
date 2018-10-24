import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { EventInfoProvider } from '../../providers/event-info/event-info';
import { AdmineventformPage } from '../admineventform/admineventform';

/**
 * Generated class for the ModifyeventlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-modifyeventlist',
  templateUrl: 'modifyeventlist.html',
})
export class ModifyeventlistPage {

  events =[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    private eventInfo:EventInfoProvider, public alertCtrl: AlertController) {
  }

  async ngOnInit()
  { 
    this.events = [];
    this.events = await this.eventInfo.getAllEvents();
  
  }
  async ionViewWillEnter()
  {
    this.ngOnInit();
  }

  dismiss() {
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
