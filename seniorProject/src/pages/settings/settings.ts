import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(public navCtrl: NavController) { }

    goToTabs() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(TabsPage);
    }
  }


