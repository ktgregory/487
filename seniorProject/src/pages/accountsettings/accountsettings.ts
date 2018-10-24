import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { TabsPage } from '../tabs/tabs';
import { ChangepasswordPage } from '../changepassword/changepassword';
import { ChangeemailPage } from '../changeemail/changeemail';
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
  phonenumber;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private authData: AuthProvider, private afs: AngularFirestore,
    public alertCtrl: AlertController, public modalCtrl: ModalController) {
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
          this.phonenumber = doc.data().phoneNumber;

        })
     });
     
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad AccountsettingsPage');
  }


  changeBirthday()
  {

    // const prompt = this.alertCtrl.create({
    //   message: "Enter your birthday:",
    //   inputs: [
    //     {
    //       name: 'birthday',
    //       placeholder: 'Birthday'
    //     }
    //   ],
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       handler: data => {
    //         console.log('Cancel clicked');
    //       }
    //     },
    //     {
    //       text: 'Update',
    //       handler: data => {
             
    //         this.afs.doc(`users/${this.userID}`).update({birthday:data.birthday});
    //         let userQuery = this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
    //         userQuery.get().then((querySnapshot) => {           
    //              querySnapshot.forEach((doc) => {
    //               this.birthday = doc.data().birthday;
    //           })
    //         });
    //         this.navCtrl.setRoot(TabsPage);
    //       }
    //     }
    //   ]
    // });
   // prompt.present();

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
            this.ngOnInit();
          }
          
        }
      ]
    });
    prompt.present();

  }

  changePhoneNumber()
  {

    const prompt = this.alertCtrl.create({
      message: "Enter your phone number:",
      inputs: [
        {
          name: 'phone',
          placeholder: 'Phone Number'
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
             
            this.afs.doc(`users/${this.userID}`).update({phoneNumber:data.phone});
            this.ngOnInit();
          }
          
        }
      ]
    });
    prompt.present();

  }

  changeEmail()
  {
    let myModal = this.modalCtrl.create(ChangeemailPage, {});
      myModal.onDidDismiss(() => {
        this.ngOnInit();
      });
    myModal.present();
   // this.navCtrl.push(ChangeemailPage);
  }

  changePassword()
  {
    this.navCtrl.push(ChangepasswordPage);
  }
  
}
