import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import {UploadPage} from '../uploadprofilepic/uploadprofilepic';
import { AngularFirestore} from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  
  name;
  bio;
  userID;

  constructor(public navCtrl: NavController, public authData: AuthProvider,
    private afs: AngularFirestore, public alertCtrl: AlertController) { }

  async ngOnInit()
  {

    this.userID = await this.authData.getUserID();
    let userQuery = await this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
    await userQuery.get().then((querySnapshot) => { 
        
       querySnapshot.forEach((doc) => {

        this.name = doc.data().name;
        this.bio = doc.data().bio;
      })
   });
  }
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

    editName()
    {

    const prompt = this.alertCtrl.create({
      message: "Enter your name:",
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Update',
          handler: data => {
             
            this.afs.doc(`users/${this.userID}`).update({name:data.name});
            let userQuery = this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.name = doc.data().name;
              })
            });
          }
        }
      ]
    });
    prompt.present();

    }

    editBio()
    {


    const prompt = this.alertCtrl.create({
      message: "Enter your bio:",
      inputs: [
        {
          name: 'bio',
          placeholder: 'Bio'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Update',
          handler: data => {
             
            this.afs.doc(`users/${this.userID}`).update({bio:data.bio});
            let userQuery = this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.bio = doc.data().bio;
              })
            });
          }
        }
      ]
    });
    prompt.present();

    }

  }


