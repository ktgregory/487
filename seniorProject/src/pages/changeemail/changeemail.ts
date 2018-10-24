import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, 
  AlertController, Loading, LoadingController, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailValidator } from '../../validators/email';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore } from 'angularfire2/firestore';
/**
 * Generated class for the ChangepasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      newemail: ['', Validators.compose([Validators.required, EmailValidator.isValid])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChangepasswordPage');
  }

  async changeEmail()
  { 
    let id = await this.authData.getUserID();
    this.afs.doc(`users/${id}`).update({email:this.loginForm.value.newemail}).then(any=>{
    this.authData.changeEmail(this.loginForm.value.newemail).then(any=>
      {
        this.loading.dismiss().then(() =>
        {
          this.viewCtrl.dismiss();    
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

      this.loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
      });
      this.loading.present();
    }
  }

  cancel()
  {
    this.viewCtrl.dismiss();
  }
}
