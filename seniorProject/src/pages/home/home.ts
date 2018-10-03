import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {EventFormPage} from '../eventform/eventform';
import { AboutPage } from '../about/about';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public alerCtrl: AlertController) { }

  goToEventForm()
  {
    this.navCtrl.push(EventFormPage);
  }
  goToAboutPage()
  {
    this.navCtrl.push(AboutPage);
  }


  doConfirm() {
    let confirm = this.alerCtrl.create({
      title: 'Send request?',
      message: 'Do you want to send a request for more information about this event?',
      buttons: [
        {
          text: 'Yes!',
          handler: () => {
            console.log('Agree clicked');
          }
        },
        {
          text: 'Not now.',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    confirm.present()
}

}


