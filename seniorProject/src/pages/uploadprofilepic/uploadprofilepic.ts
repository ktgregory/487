import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { NavParams, NavController, AlertController, Loading, LoadingController } from 'ionic-angular';

@Component({
  selector: 'uploadprofilepic-page',
  templateUrl: 'uploadprofilepic.html',
})
export class UploadPage {

  userID;
  profilePic;
  file;
  previewRef;
  
  loading:Loading
  constructor(private storage: AngularFireStorage, private db: AngularFirestore,
    public navParams: NavParams, public navCtrl: NavController,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController) { 
    this.profilePic = this.navParams.get('profilePic');
    this.userID = this.navParams.get('userID');
  }

  ionViewWillLeave()
  {
    this.deletePreview;
  }
  

  async setUpload(event: FileList) 
  {
    this.deletePreview;
    this.file = event.item(0);
    this.uploadPreview();
  }

  async startUpload() {
    // The File object
    const file = this.file;

    if (file == null)
    {
      this.presentErrorMessage("You have not selected a photo!");
      return;
    }
    
    if (file.type.split('/')[0] !== 'image') { 
      this.presentErrorMessage("You have selected an unsupported file type!");
      return;
    }
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();

    const path = `profilePhotos/${this.userID}`;
    let storageref = this.storage.ref(path);
    storageref.put(file).then(async any=>
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
    const file = this.file;

    if (file.type.split('/')[0] !== 'image') { 
      this.presentErrorMessage("You have selected an unsupported file type!");
      return;
    }
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
    });
    this.loading.present();

    const path = `previews/${this.userID}`;
    this.previewRef = this.storage.ref(path);
    this.previewRef.put(file).then(async any=>
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
    if (this.file!=null)
      this.previewRef.delete(this.file);
  }

  goToSettings()
  {
    this.navCtrl.pop();
  }


  presentSuccessfulUploadMessage()
  {
    // Displayed for a pending sent request. 
    let pendingMessage = this.alertCtrl.create({
      title: 'Upload Successful!',
      message: 'Your profile photo has been successfully changed!',
      buttons: [
        {
          text: 'Ok!'
        }
      ]
    });
    pendingMessage.present();
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
    pendingMessage.present()
  }
}

//SOURCE: https://angularfirebase.com/lessons/firebase-storage-with-angularfire-dropzone-file-uploader/



