import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, AlertCmp } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { TabsPage } from '../tabs/tabs';
import { ChangepasswordPage } from '../changepassword/changepassword';
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

  userID;
  bio;
  email;
  school;
  birthday;
  userinfo;
  userData;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private authData: AuthProvider, private afs: AngularFirestore,
    public alertCtrl: AlertController) {
  }


  async ngOnInit()
    {
    
      this.userID = await this.authData.getUserID();
      let userQuery = await this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
      await userQuery.get().then((querySnapshot) => { 
          
         querySnapshot.forEach((doc) => {

          this.email = doc.data().email;
          this.school = doc.data().school;
          this.birthday = doc.data().birthday;
          this.bio = doc.data().bio;

        })
     });
     
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad AccountsettingsPage');
  }

  changeEmailAddress()
  {
    const prompt = this.alertCtrl.create({
      message: "Enter your new email address:",
      inputs: [
        {
          name: 'currentemail',
          placeholder: 'Current Email'
        },
        {
          name: 'email',
          placeholder: 'Email Address',
        },
        {
          name: 'password',
          placeholder: 'Password',
          type: 'passsword'
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
              this.authData.updateUserEmail(data.currentemail, data.password,
                data.email.trim()).then(any=>{
                  this.afs.doc(`users/${this.userID}`).update({email:data.email});
                  let userQuery = this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
                  userQuery.get().then((querySnapshot) => {           
                     querySnapshot.forEach((doc) => {
                      this.email = doc.data().email;
                    })
                 });
              });
              this.navCtrl.setRoot(TabsPage);
          }
        }
      ]
    });
    prompt.present();

  }

  changeBirthday()
  {

    const prompt = this.alertCtrl.create({
      message: "Enter your birthday:",
      inputs: [
        {
          name: 'birthday',
          placeholder: 'Birthday'
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
             
            this.afs.doc(`users/${this.userID}`).update({birthday:data.birthday});
            let userQuery = this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.birthday = doc.data().birthday;
              })
            });
            this.navCtrl.setRoot(TabsPage);
          }
        }
      ]
    });
    prompt.present();

  }

  changeSchool()
  {

    const prompt = this.alertCtrl.create({
      message: "Enter your school:",
      inputs: [
        {
          name: 'school',
          placeholder: 'School'
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
             
            this.afs.doc(`users/${this.userID}`).update({school:data.school});
            let userQuery = this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.school = doc.data().school;
              })
            });
            this.navCtrl.setRoot(TabsPage);
          }
          
        }
      ]
    });
    prompt.present();

  }

  changePassword()
  {
    this.navCtrl.push(ChangepasswordPage);
  }
  
}
