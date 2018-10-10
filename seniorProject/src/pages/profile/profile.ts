import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, NavParams } from 'ionic-angular';
import {SettingsPage} from '../settings/settings';
import { AlertController, Loading } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';
import { AccountsettingsPage } from '../accountsettings/accountsettings';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { UserInfo } from '../../models/item.model';
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage implements OnInit {
  
  name;
  bio;
  email;
  school;
  userinfo;
  uid;
  currentemail;
  constructor(private userService:UserinfoProvider, public navCtrl: NavController, public alertCtrl: AlertController, 
    public authData: AuthProvider, public loadingCtrl: LoadingController, public navParams: NavParams)  {
      this.currentemail=navParams.get('data');
    }
  
   
  ngOnInit()
  {
    this.userService.getUserInfo().subscribe(userinfo=>{
        this.userinfo = userinfo;
    });
    console.log(this.userinfo);
  }


  goToSettings() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(SettingsPage);
    
  }
  goToAccountSettings() {
    //push another page onto the history stack
    //causing the nav controller to animate the new page in
    this.navCtrl.push(AccountsettingsPage);
  
}
  //if trash can button is clicked, 
  //the user is asked to confirm before the post is deleted
  confirmDeletePost() {
    let confirm = this.alertCtrl.create({
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
  let confirm = this.alertCtrl.create({
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


logout()
{
  this.authData.logoutUser()
  .then(() => {
    this.navCtrl.push(LoginPage);
    window.location.reload();
  }, (error) => {
   // this.loading.dismiss().then( () => {
      var errorMessage: string = error.message;
        let alert = this.alertCtrl.create({
          message: errorMessage,
          buttons: [
            {
              text: "Ok",
              role: 'cancel'
            }
          ]
        });
      alert.present();
    });
  //});

  /*this.loading = this.loadingCtrl.create({
    dismissOnPageChange: true,
  });
  this.loading.present();*/



}

}
