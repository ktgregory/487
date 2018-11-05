import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { EmailValidator } from '../../validators/email';

@Component({
  selector: 'page-resetpassword',
  templateUrl: 'resetpassword.html'
})
export class ResetPasswordPage {

    public resetPasswordForm:FormGroup;

    constructor(public authData: AuthProvider, public formBuilder: FormBuilder,
        public nav: NavController, public alertCtrl: AlertController) {
        
        // Sets the resetPasswordForm variable equal to the html input
        // and applies email validator to the input. 
        this.resetPasswordForm = formBuilder.group({
          email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
        })
      }

  resetPassword()
  {
    // Checks that the form is valid and calls resetPassword function
    // in the Auth Provider. 
    if (this.resetPasswordForm.valid)
    {
      this.authData.resetPassword(this.resetPasswordForm.value.email)
      .then((user) => 
      {
        let alert = this.alertCtrl.create({
          message: "We just sent you a reset link to your email",
          buttons: [
          {
            text: "Ok",
            role: 'cancel',
            handler: () => {
              this.nav.pop();
              }
          }]
        });
      alert.present();
      }, 
      // Presents error message if an error occurs. 
      (error) => {
        var errorMessage: string = error.message;
        let errorAlert = this.alertCtrl.create({
          message: errorMessage,
          buttons: [
          {
              text: "Ok",
              role: 'cancel'
           }
          ]
        });
        errorAlert.present();
      });
    }
  }
}
