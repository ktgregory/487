import { Component } from '@angular/core';
import { IonicPage, 
  NavController, 
  NavParams, 
  AlertController, 
  Loading, 
  LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../validators/email';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-delete-account',
  templateUrl: 'delete-account.html',
})
export class DeleteAccountPage {

  public loginForm:FormGroup;
  public loading:Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public formBuilder: FormBuilder, private authData: AuthProvider,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    // Sets loginForm variable equal to the inputs from the html
    // and sets validators
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }


  confirmDelete()
  {
    let alert = this.alertCtrl.create({
      title:"Confirm Account Deletion",
      message: "If you delete your account, it cannot be undone!",
      buttons: [
        {
          text: "Nevermind!",
          role: 'cancel'
        },
        {
          text: "Delete my account.",
          handler: () =>
          {
            this.deleteAccount();
          }
        }
      ]
    });
    alert.present();
  }


  async deleteAccount()
  {
    this.authData.deleteAccount()
    .then(any=>
      {
        this.navCtrl.setRoot(LoginPage);
        this.loading.dismiss().then(() =>
        {    
          let alert = this.alertCtrl.create({
          message: "Your account has been deleted.",
          buttons: [
            {
              text: "Ok",
              role: 'cancel'
            }
            ]
            });
            alert.present();
        });
      });

      this.navCtrl.pop(); 
  }

  loginUser(){
    // Logs the user in before changing their password. 
    if (!this.loginForm.valid){
      console.log("Error");
      return;
    }

      this.authData.loginUser(this.loginForm.value.email, 
        this.loginForm.value.password)
      .then( authData => {
        this.confirmDelete();
      }, error => {
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            message: error.message,
            buttons: [
              {
                text: "Ok",
                role: 'cancel'
              }
            ]
          });
          alert.present();
        });
      });

      // Shows loading symbol.
      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    
  }


  cancel()
  {
    // Returns to Profile page. 
    this.navCtrl.pop();
  }
}
