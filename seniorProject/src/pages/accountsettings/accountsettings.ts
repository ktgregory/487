import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { ChangepasswordPage } from '../changepassword/changepassword';
import { ChangeemailPage } from '../changeemail/changeemail';


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
    
      // Gets user's ID to use when making query. 
      this.userID = await this.authData.getUserID();
      
      // Makes a query and updates the page variables.
      let userQuery = await this.afs.firestore.collection(`users`)
      .where("uid","==",this.userID);    
      await userQuery.get().then((querySnapshot) => 
      { 
         querySnapshot.forEach((doc) => 
         {
          this.email = doc.data().email;
          this.school = doc.data().school;
          this.birthday = doc.data().birthday;
          this.bio = doc.data().bio;
          this.phonenumber = doc.data().phoneNumber;
        })
     });
     
  }

  ionViewWillLeave()
  {
    // If you are on the Account Settings page and select another
    // tab, this pops back to the Profile page, so that when you
    // return to the Profile tab, the Account Settings page will 
    // no longer be showing.
      this.navCtrl.popToRoot();
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
             if(data.school.length!=0) // Cannot be an empty string.
             {
              // Updates the user's school in the database.
               this.afs.doc(`users/${this.userID}`).update({school:data.school});
               // Makes a query to update the school variable 
               // to reflect the change.
               let userQuery = this.afs.firestore.collection(`users`)
               .where("uid","==",this.userID);    
                userQuery.get().then((querySnapshot) => {           
                      querySnapshot.forEach((doc) => {
                      this.school = doc.data().school;
                  })
                });
             this.ngOnInit();
             }
             else
             {
               this.presentSchoolError();
             }
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
          text: 'Cancel'
        },
        {
          text: 'Update',
          handler: data => {
            if ((this.phoneValidator(data.phone)) && 
            (data.phone.length==10) )
            {
              this.afs.doc(`users/${this.userID}`)
              .update({phoneNumber:data.phone}).then(any=>
                {
                  this.presentSuccessPhoneChange();
                  this.ngOnInit(); 
                  // Reloads the page to reflect the 
                  // change information.
                });
            }
            else // If the phone number is not valid.
            {
             this.presentPhoneError();
            }
          }         
        }
      ]
    });
    prompt.present();
  }

  phoneValidator(phonenumber)
  {
    // Used to make sure the entered phone number
    // only contains numbers.
      const re = /^-?(0|[1-9]\d*)$/.test(
        phonenumber
      );
      console.log(re);
      return re;
  }

  changeEmail()
  {
    // Opens Change Email page as a modal.
    let myModal = this.modalCtrl.create(ChangeemailPage, {});
      myModal.onDidDismiss(() => {
        // Reloads the page once the modal closes.
        this.ngOnInit();
      });
    myModal.present();
  }

  changePassword()
  {
    // Opens Change Password page as a modal.
    let myModal = this.modalCtrl.create(ChangepasswordPage, {});
      myModal.onDidDismiss(() => {
        // Reloads the page once the modal closes.
        this.ngOnInit();
      });
    myModal.present();
  }

  presentSchoolError()
  {
    const prompt = this.alertCtrl.create({
      title: "Error",
      message: "You must enter a valid name.",
      buttons: [
        {
          text: 'Ok.'
        }
      ]
    });
    prompt.present();
  }

  presentPhoneError()
  {
    const prompt = this.alertCtrl.create({
      title: "Error",
      message: "You must enter a valid phone number.",
      buttons: [
        {
          text: 'Ok.'
        }
      ]
    });
    prompt.present();
  }

  presentSuccessPhoneChange()
  {
    const prompt = this.alertCtrl.create({
      title: "Success",
      message: "Your phone number has been changed!",
      buttons: [
        {
          text: 'Ok.'
        }
      ]
    });
    prompt.present();
  }
  
}
