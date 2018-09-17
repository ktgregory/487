import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {SettingsPage} from '../settings/settings';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {

  constructor(public navCtrl: NavController, public alerCtrl: AlertController) {}
  
  goToSettings() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(SettingsPage);
    
  }
  

  //if trash can button is clicked, 
  //the user is asked to confirm before the post is deleted
  confirmDeletePost() {
    let confirm = this.alerCtrl.create({
      title: 'Delete event post?',
      message: 'Do you want to delete your post about this event?',
      buttons: [
        {
          text: 'Yes.',
          handler: () => {
            console.log('Agree clicked');
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

checkRequests() {
  let confirm = this.alerCtrl.create({
    title: 'Requests about this event:',
    message: 'None so far!',
    buttons: [
      {
        text: 'Okay.',
      }
    ]
  });
  confirm.present()
}

}
