import { Component } from '@angular/core';
import { NavController, 
  AlertController,
   NavParams, 
   ModalController, 
   Loading, 
   LoadingController,
   ToastController } from 'ionic-angular';
import { AngularFirestore} from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';
import {TabsPage} from '../tabs/tabs';
import { AngularFireStorage } from 'angularfire2/storage';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  
  name;
  bio;
  userID;
  profilePic;
  file;
  previewRef;
  loading:Loading;

  constructor(public navCtrl: NavController, public authData: AuthProvider,
    private afs: AngularFirestore, public alertCtrl: AlertController,
    public navParams: NavParams, public modalCtrl: ModalController,
    private storage: AngularFireStorage, private db: AngularFirestore,
     public loadingCtrl: LoadingController, public toastCtrl: ToastController) {
      this.profilePic = this.navParams.get('profilePic');
      this.userID = this.navParams.get('userID');
     }

  async ngOnInit()
  {
    // Queries for the user's profile information and listens
    // for changes. 
    let userQuery = await this.afs.firestore.collection(`users`)
    .where("uid","==",this.userID);    
    await userQuery.onSnapshot((querySnapshot)=>
    {
      querySnapshot.docChanges().forEach(async (change)=>
      {
        this.name = change.doc.data().name;
        this.bio = change.doc.data().bio;
        this.profilePic = change.doc.data().profileimage;
      });
   });
  }

  ionViewWillLeave()
  {
    // Deletes the preview any time a user leaves this page. 
    this.deletePreview;
  }
  
  goToTabs() {
    this.navCtrl.push(TabsPage);
  }


  editName()
  {
    const prompt = this.alertCtrl.create({
      message: "Edit your name:",
      inputs: [
        {
          name: 'name',
          value: this.name
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Update',
          handler: data => {
            this.afs.doc(`users/${this.userID}`).update({name:data.name});
            let userQuery = this.afs.firestore.collection(`users`)
            .where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.name = doc.data().name;
              })
            });
          }
        }
      ]
    });
    prompt.present();
  }

  editBio()
  {
    const prompt = this.alertCtrl.create({
      message: "Edit your bio:",
      inputs: [
        {
          name: 'bio',
          value:this.bio
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {}
        },
        {
          text: 'Update',
          handler: data => {
             
            this.afs.doc(`users/${this.userID}`).update({bio:data.bio});
            let userQuery = this.afs.firestore.collection(`users`)
            .where("uid","==",this.userID);    
            userQuery.get().then((querySnapshot) => {           
                 querySnapshot.forEach((doc) => {
                  this.bio = doc.data().bio;
              })
            });
          }
        }
      ]
      });
    prompt.present();
  }




  
 // UPLOADING PHOTO METHODS:


 async setUpload(event: FileList) 
 {
   // Sets the file variable to the file the user has selected, and
   // calls the uploadPreview function. 
   // Called when a user selects a file. 
   this.file = event.item(0);
   this.uploadPreview();
 }

 async startUpload() 
 {
   // Uploads the image they have selected.
   // Will overwrite their previous profile photo in
   // the database. 
   if (this.file == null)
   {
     this.presentErrorMessage("You have not selected a photo!");
     return;
   }
   
   if (this.file.type.split('/')[0] !== 'image') { 
     this.presentErrorMessage("You have selected an unsupported file type!");
     return;
   }

   this.loading = this.loadingCtrl.create({
     dismissOnPageChange: true,
   });
   this.loading.present();

   const path = `profilePhotos/${this.userID}`;
   let storageref = this.storage.ref(path);
   storageref.put(this.file).then(async any=>
   {
       storageref.getDownloadURL().subscribe(result=>
         {
           this.db.collection('users').doc(this.userID).update(
           {
             profileimage:  result
           }).then(()=>
           {
             this.profilePic = result;
             this.file = null;
             this.loading.dismiss();
             this.presentSuccessfulUploadMessage();
           })
         });
     });
 }

 uploadPreview()
 {
   // Uploads a preview of their selected image to the previews
   // folder in the database. This is needed because, if they decide
   // not to change their profile photo, the old photo should not be
   // overwritten. 
   if (this.file.type.split('/')[0] !== 'image') { 
     this.presentErrorMessage("You have selected an unsupported file type!");
     return;
   }

   this.loading = this.loadingCtrl.create({
     dismissOnPageChange: true,
   });
   this.loading.present();

   const path = `previews/${this.userID}`;
   this.previewRef = this.storage.ref(path);
   this.previewRef.put(this.file).then(async any=>
   { 
       this.previewRef.getDownloadURL().subscribe(result=>
         {
           this.loading.dismiss();
           this.profilePic = result;
         });
     });
 }

 deletePreview()
 {
   // Deletes the profile photo preview from the database. 
   if (this.file!=null)
     this.previewRef.delete(this.file);
 }

 goToSettings()
 {
   // Pops the uploadprofilepic page from the navigation
   // stack.
   this.navCtrl.pop();
 }


 presentSuccessfulUploadMessage()
 {
   // Displayed for a pending sent request. 
   let toast = this.toastCtrl.create({
     message: 'Your profile photo has been changed!',
     duration: 2000,
     position: 'bottom'
   });
   toast.present();
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
}


//SOURCE: https://angularfirebase.com/lessons/firebase-storage-with-angularfire-dropzone-file-uploader/



