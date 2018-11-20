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
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { FoundationProvider } from '../../providers/foundation/foundation';

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
    public loadingCtrl: LoadingController, private userService: UserinfoProvider, 
    private foundation: FoundationProvider) {

      // Sets loginForm variable equal to corresponding HTML inputs.
      this.loginForm = formBuilder.group({
        email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
        password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
      });
  }


  ionViewDidLoad() { 
    // Prompts user to add app icon to their home screen.
    //https://forum.ionicframework.com/t/pwa-new-way-for-add-to-home-screen-banner/131584/6
    if (!this.foundation.appIsOnDevice) {
      // the app is in PWA mode, we proceed to detect device and browser support:
      let userAgent = navigator.userAgent;
      if (userAgent.match(/Android/i)) {
        //code for "add to desktop" for Android:
        this.foundation.presentToast("Tap ' ... ' in the top panel of your browser and then 'Add to Home Screen' to get full screen mode and faster loading times...", "top", 'speech-bubble-android')
      }
      else if (userAgent.match(/iPhone/i) || userAgent.match(/iPad/i)) {
        //code for "add to desktop" for iOS:
        this.foundation.presentToast("Tap 'Share' in the bottom panel of your browser and then 'Add to Home Screen' to get full screen mode and faster loading times...", "bottom", 'speech-bubble-ios')
      }
    }
  }

  loginUser(){
    // SOURCE: https://javebratt.com/ionic-firebase-tutorial-auth/

    if (!this.loginForm.valid){
      console.log(this.loginForm.value);
    } else {
      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then( authData => {
        this.navCtrl.setRoot(TabsPage);
       // this.navigateBasedOnUserType();
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

  goToResetPassword(){
    this.navCtrl.push(ResetPasswordPage);
  }

  createAccount(){
    this.navCtrl.push(SignUpPage);
  }

  // async navigateBasedOnUserType()
  // {
  //   // Determines whether the user needs to be navigated
  //   // to the Admin page or Home page. 
  //   let id = await this.authData.getUserID();
  //   let userInfo = await this.userService.getUserInfo(id);
  //   let type = userInfo[0].type;
  //   if(type=="admin")
  //   {
  //     this.navCtrl.setRoot(AdminPage);
  //   }
  //   else
  //   {
  //     this.navCtrl.setRoot(TabsPage);
  //   }
  // }
}
