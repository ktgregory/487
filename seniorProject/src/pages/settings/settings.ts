import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, ModalController } from 'ionic-angular';
import {UploadPage} from '../uploadprofilepic/uploadprofilepic';
import { AngularFirestore} from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';
import {TabsPage} from '../tabs/tabs';
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  
  name;
  bio;
  userID;
  profilePic;

  constructor(public navCtrl: NavController, public authData: AuthProvider,
    private afs: AngularFirestore, public alertCtrl: AlertController,
    public navParams: NavParams, public modalCtrl: ModalController) {
      this.profilePic = this.navParams.get('profilePic');
      this.userID = this.navParams.get('userID');
     }

  async ngOnInit()
  {
    // Queries for the user's profile information. 
    //this.userID = await this.authData.getUserID();
    let userQuery = await this.afs.firestore.collection(`users`)
    .where("uid","==",this.userID);    
    await userQuery.get().then((querySnapshot) => { 
       querySnapshot.forEach((doc) => {
        this.name = doc.data().name;
        this.bio = doc.data().bio;
      })
   });
  }


  ionViewWillLeave()
  {
    // If you are on the Settings page and select another tab, this
    // pops back to the Profile page, so that when you return to the 
    // Profile tab, the Settings page will no longer be showing.
    // this.navCtrl.popToRoot();
  }



  goToUploadPage() { 
    // Opens UploadPage as a modal and passes relevant parameters. 
    let myModal = this.modalCtrl.create(UploadPage, { 
      'profilePic':this.profilePic,
      'userID': this.userID
    });
        myModal.onDidDismiss(() => {
        //this.ngOnInit();
    });
    myModal.present();
  }


  goToTabs() {
    this.navCtrl.push(TabsPage);
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
          handler: data => {}
        },
        {
          text: 'Update',
          handler: data => {
            this.afs.doc(`users/${this.userID}`).update({name:data.name});
            let userQuery = this.afs.firestore.collection(`users`)
            .where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.name = doc.data().name;
              })
            });
            this.ngOnInit();
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
          handler: data => {}
        },
        {
          text: 'Update',
          handler: data => {
             
            this.afs.doc(`users/${this.userID}`).update({bio:data.bio});
            let userQuery = this.afs.firestore.collection(`users`)
            .where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.bio = doc.data().bio;
              })
            });
            this.ngOnInit();
          }
        }
      ]
      });
    prompt.present();
  }


}


