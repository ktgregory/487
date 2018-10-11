import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, NavParams } from 'ionic-angular';
import {SettingsPage} from '../settings/settings';
import { AlertController, Loading } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';
import { AccountsettingsPage } from '../accountsettings/accountsettings';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { User } from '../../models/item.model';
import { AngularFirestore} from 'angularfire2/firestore';
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
  userID;
  currentemail;
  userData;
  posts=[];

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, 
    public authData: AuthProvider, public loadingCtrl: LoadingController, 
    private userService: UserinfoProvider, private afs: AngularFirestore
    )  {
        
    }
  
   
  async ngOnInit()
    {
    
      this.userID = await this.authData.getUserID();
      let userQuery = await this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
      await userQuery.get().then((querySnapshot) => { 
          
         querySnapshot.forEach((doc) => {

          this.name = doc.data().name;
          this.email = doc.data().email;
          this.school = doc.data().school;
          this.bio = doc.data().bio;
        })
     });
     
     let postQuery = await this.afs.firestore.collection(`posts`).where("uid","==",this.userID);    
      await postQuery.get().then((querySnapshot) => { 
         querySnapshot.forEach((doc) => {
           // console.log(doc.data());
            this.posts.push(doc.data());
        })
     });


    console.log(this.posts);

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
      this.authData.logoutUser();

      this.navCtrl.push(LoginPage);
      window.location.reload();

    }

}
