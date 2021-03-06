import { Component } from '@angular/core';
import {
  NavController,
  LoadingController,
  Loading,
  AlertController, 
  NavParams} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { TabsPage } from '../tabs/tabs';
import { EmailValidator } from '../../validators/email';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignUpPage {
  public signupForm: FormGroup;
  public loading: Loading;
  userID:string;
  profilePic;
  previewRef;
  file;
  previewID;
  creatingAdmin=false;

  constructor(public nav: NavController, public authData: AuthProvider,
    public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, private afs: AngularFirestore,
    private storage: AngularFireStorage, public navParams:NavParams) {

    if(this.navParams.get('creatingAdmin'))
    {
      this.creatingAdmin=this.navParams.get('creatingAdmin');
    }
    // Sets signupForm variable equal to html inputs and applies validators. 
    this.signupForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])],
      name: ['', Validators.required],
      school: ['', Validators.required],
      bio:['', Validators.required],
      phoneNumber:['', Validators.compose(
        [Validators.minLength(10), 
          Validators.required,
          Validators.pattern(/^-?(0|[1-9]\d*)?$/)
      ])]
    });
  }

  ionViewWillEnter()
  {
    // Sets default profile photo.
    this.profilePic = 
    "https://firebasestorage.googleapis.com/v0/b/seniorproject-27d62.appspot.com"
    + "/o/previews%2FdefaultPhoto.png?alt=media&token=58701963-8475-4902-852b-77acc7affd31";

    // Sets the previewID so if they select multiple photos to preview,
    // each preview will be overwritten. 
    this.previewID = this.afs.createId();

  }

  ionViewWillLeave()
  {
    this.deletePreview();
  }

  presentErrorMessage(errorMessage:string)
  {
      // Displayed for a pending sent request. 
    let pendingMessage = this.alertCtrl.create({
      title: 'Error!',
      message: errorMessage,
      buttons: [
        {
          text: 'Ok!'
        }
      ]
    });
    pendingMessage.present();
  }
  

async setUpload(event: FileList) 
{
  // Called when the user selects a file. 
  // Sets file variable to the file they selected
  // and uploads a preview of their image. 
  this.file = event.item(0);

  if(event.item(0)){
   let reader = new FileReader();

     reader.onload = (event:any) => {
       this.profilePic = event.target.result;
     }
     reader.readAsDataURL(event.item(0));
   }

}

async startUpload()
{
  if (this.file == null)
  {
    // If they didn't select a profile photo,
    // their photo is set to the default image. 
    this.afs.collection('users').doc(this.userID).update(
    {
      profileimage: this.profilePic
    });
  }
  else
  {
    // Uploads their profile photo under their ID if they
    // complete the signing up process. 
    const path = `profilePhotos/${this.userID}`;
    let storageref = this.storage.ref(path);
    storageref.put(this.file).then(async ()=>
    {
      storageref.getDownloadURL().subscribe(result=>
        {
          this.afs.collection('users').doc(this.userID).update(
          {
            profileimage: result
          })
        });
    });
  }
}

  uploadPreview()
  {
    // Uploads a preview of their selected image
    // to the database.
    const file = this.file;
    if (file.type.split('/')[0] !== 'image') { 
      this.presentErrorMessage("You have selected an unsupported file type!");
      return;
    }
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();
    const path = `previews/${this.previewID}`;
    this.previewRef = this.storage.ref(path);
    this.previewRef.put(file).then(async ()=>
    { 
        this.previewRef.getDownloadURL().subscribe(result=>
          {
            this.loading.dismiss();
            this.profilePic = result;
          })
      }).catch(error=>
        {
          this.presentErrorMessage(error);
          this.loading.dismiss();
      });
  }

  deletePreview()
  {
    // Removes the preview from the database.
    // Called when the user leaves the sign up page,
    // whether they created an account or not. 
    // if(this.file!=null)
    //   this.previewRef.delete(this.file);
  }

  /**
   * If the form is valid it will call the AuthData service to sign the user 
   *  up password displaying a loading component while the user waits.
   */
  signupUser(){
    if (!this.signupForm.valid)
    {
      this.presentErrorMessage("You must fill in every field!");
      return;
    }
    let type;
    if(this.creatingAdmin)
      type="admin";
    else
      type="reg";
      this.authData.signupUser(this.signupForm.value.email, this.signupForm.value.password)
      .then(() => {
        this.userID = this.authData.getUserID();
        this.afs.doc(`users/${this.userID}`).set({
          uid: this.userID,
          name: this.signupForm.value.name,
          bio: this.signupForm.value.bio,
          school: this.signupForm.value.school,
          email: this.signupForm.value.email,
          phoneNumber: this.signupForm.value.phoneNumber,
          type: type
          }).then(()=>
          {
            this.startUpload();
          })
          .then(()=>{
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


/*
SOURCES: 
  Sign in function: https://javebratt.com/ionic-firebase-tutorial-auth/ 
  Form validators: https://angular-templates.io/tutorials/about/angular-forms-and-validations 
*/