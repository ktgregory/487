import { Component } from '@angular/core';
import {
  NavController,
  LoadingController,
  Loading,
  AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { EmailValidator } from '../../validators/email';
import { SignUpPage } from '../signup/signup';
import { ResetPasswordPage } from '../resetpassword/resetpassword';
import { TabsPage } from '../tabs/tabs';
import { Observable} from 'rxjs/observable';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { AdminPage } from '../admin/admin';
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  public loginForm:FormGroup;
  public loading:Loading;

  email;
  constructor(public navCtrl: NavController, public authData: AuthProvider,
    public formBuilder: FormBuilder, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, private userService: UserinfoProvider) {

      this.loginForm = formBuilder.group({
        email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
        password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
      });
  }

  loginUser(){
    if (!this.loginForm.valid){
      console.log(this.loginForm.value);
    } else {
      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then( authData => {

        this.navigateBasedOnUserType();

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

      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }

  goToResetPassword(){
    this.navCtrl.push(ResetPasswordPage);
  }

  createAccount(){
    this.navCtrl.push(SignUpPage);
  }

  async navigateBasedOnUserType()
  {
    let id = await this.authData.getUserID();
    let userInfo = await this.userService.getUserInfo(id);
    let type = userInfo[0].type;
    if(type=="admin")
    {
      this.navCtrl.setRoot(AdminPage);
    }
    else
    {
      this.navCtrl.setRoot(TabsPage);
    }

  }

}


/*
SOURCE: 

https://javebratt.com/ionic-firebase-tutorial-auth/

*/