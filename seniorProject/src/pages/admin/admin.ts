import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})
export class AdminPage {

  constructor(public navCtrl: NavController) { }

    goToTabs() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(TabsPage);
    }
  }


