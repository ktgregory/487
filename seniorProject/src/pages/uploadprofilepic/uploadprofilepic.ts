import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
/**
 * Generated class for the UploadprofilepicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-uploadprofilepic',
  templateUrl: 'uploadprofilepic.html',
})
export class UploadPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UploadprofilepicPage');
  }

  goToSettings() {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.pop();
  
}

}
