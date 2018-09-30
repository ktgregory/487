import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AccountsettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-accountsettings',
  templateUrl: 'accountsettings.html',
})
export class AccountsettingsPage {

  firstname = "Katie";
  lastname = "Gregory";
  bio = "I'm a senior CS major at Ole Miss";
  email = "kcgregor@go.olemiss.edu";
  birthday = "Dec. 1, 1996";
  school = "University of Mississippi";
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AccountsettingsPage');
  }

  
}
