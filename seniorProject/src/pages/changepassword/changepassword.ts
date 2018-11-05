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

@IonicPage()
@Component({
  selector: 'page-changepassword',
  templateUrl: 'changepassword.html',
})
export class ChangepasswordPage {

  public loginForm:FormGroup;
  public loading:Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public formBuilder: FormBuilder, private authData: AuthProvider,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    // Sets loginForm variable equal to the inputs from the html
    // and sets validators
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      newpassword: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }



  async changePassword()
  {
    this.authData.changePassword(this.loginForm.value.newpassword)
    .then(any=>
      {
        this.loading.dismiss().then(() =>
        {    
          let alert = this.alertCtrl.create({
          message: "Password has been changed!",
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
    if (this.loginForm.valid){
      this.authData.loginUser(this.loginForm.value.email, 
        this.loginForm.value.password)
      .then( authData => {
        this.changePassword();
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
  }

  cancel()
  {
    // Returns to Profile page. 
    this.navCtrl.pop();
  }
}
