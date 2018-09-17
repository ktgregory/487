import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-eventform',
  templateUrl: 'eventform.html'
})
export class EventFormPage {

  constructor(public navCtrl: NavController, public alerCtrl: AlertController) { }

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
              this.submitEvent();
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
      message: 'You will be notified when your post is approved.',
      buttons: [
        {
          text: 'Okay.'
        }
      ]
    });
    confirm.present();
    this.goToTabs();
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


