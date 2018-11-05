import { Component } from '@angular/core';
import { IonicPage, 
  NavController, 
  NavParams, 
  AlertController, 
  Loading, 
  LoadingController, 
  ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../validators/email';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore } from 'angularfire2/firestore';


@IonicPage()
@Component({
  selector: 'page-changeemail',
  templateUrl: 'changeemail.html',
})
export class ChangeemailPage {

  public loginForm:FormGroup;

  public loading:Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public formBuilder: FormBuilder, private authData: AuthProvider,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    private afs: AngularFirestore, public viewCtrl: ViewController) {
    // Sets loginForm variable equal to the inputs from the html
    // and sets validators
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      newemail: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    });
  }

  async changeEmail()
  { 
    let id = await this.authData.getUserID();
    // Updates the user's email in the Firestore database 
    // and the authentication database.
    this.afs.doc(`users/${id}`).update({email:this.loginForm.value.newemail})
    .then(any=>{
    this.authData.changeEmail(this.loginForm.value.newemail).then(any=>
      {
        this.loading.dismiss().then(() =>
        {
          this.viewCtrl.dismiss(); // Closes modal.
          let alert = this.alertCtrl.create({
          message: "Email address has been changed!",
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
    });
  }


  loginUser(){
    if (!this.loginForm.valid){
      console.log(this.loginForm.value);
    } else {
      // Logs in user then calls changeEmail function if successful. 
      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then( authData => {
        this.changeEmail();

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
    // Closes modal 
    this.viewCtrl.dismiss();
  }
}
