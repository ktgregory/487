import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import {UploadPage} from '../uploadprofilepic/uploadprofilepic';
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  firstname = "Katie";
  lastname = "Gregory";
  bio = "I'm a senior CS major at Ole Miss";
  email = "kcgregor@go.olemiss.edu";
  birthday = "Dec. 1, 1996";
  school = "University of Mississippi";


  constructor(public navCtrl: NavController) { }

    goToTabs() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(TabsPage);
    }

    goToUploadPage() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(UploadPage);
    }

  }


