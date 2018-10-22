import { Component } from '@angular/core';
import {
  NavController,
  LoadingController,
  Loading,
  AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { TabsPage } from '../tabs/tabs';
import { EmailValidator } from '../../validators/email';
import { AngularFirestore } from 'angularfire2/firestore';
//import { InputMask } from 'ionic-input-mask';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignUpPage {
  public signupForm: FormGroup;
  public loading: Loading;
  userID:string;

  constructor(public nav: NavController, public authData: AuthProvider,
    public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, private afs: AngularFirestore) {

    this.signupForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      name: ['', Validators.required],
      school: ['', Validators.required],
      birthday:['', Validators.required],
      bio:['', Validators.required],
      phoneNumberPt1:['', Validators.required],
      phoneNumberPt2:['', Validators.required],
      areaCode:['', Validators.required]
    });
  }



  /**
   * If the form is valid it will call the AuthData service to sign the user up password displaying a loading
   *  component while the user waits.
   *
   * If the form is invalid it will just log the form value, feel free to handle that as you like.
   */
  signupUser(){
    if (!this.signupForm.valid){
      console.log(this.signupForm.value);
    } else {
      this.authData.signupUser(this.signupForm.value.email, this.signupForm.value.password)
      .then(() => {
        let id = this.afs.createId();
        this.afs.doc(`users/${id}`).set({
          uid: id,
          name: this.signupForm.value.name,
          bio: this.signupForm.value.bio,
          birthday: this.signupForm.value.birthday,
          school: this.signupForm.value.school,
          email: this.signupForm.value.email,
          phoneNumber: this.signupForm.value.phoneNumber,
          type:"reg"
          })
          .then(any=>{
            this.nav.setRoot(TabsPage);
          });     
      }, (error) => {
        this.loading.dismiss().then( () => {
          var errorMessage: string = error.message;
            let alert = this.alertCtrl.create({
              message: errorMessage,
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
}