import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }


  ionViewWillLeave()
  {
    // If you are on the About page and select another tab, this
    // pops back to the Home tab (Post timeline), so that when you
    // return to the Home tab, the About page will no longer be 
    // showing.
    this.navCtrl.popToRoot();
  }

}
