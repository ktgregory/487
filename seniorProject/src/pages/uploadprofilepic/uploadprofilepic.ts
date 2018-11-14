import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { NavParams, NavController } from 'ionic-angular';

@Component({
  selector: 'uploadprofilepic-page',
  templateUrl: 'uploadprofilepic.html',
})
export class UploadPage {

  userID;
  profilePic;
  file;
  // Main task 
  task: AngularFireUploadTask;

  // Progress monitoring
  percentage: Observable<number>;

  snapshot: Observable<any>;

  // Download URL
  downloadURL:string;



  constructor(private storage: AngularFireStorage, private db: AngularFirestore,
    public navParams: NavParams, public navCtrl: NavController) { 
    this.profilePic = this.navParams.get('profilePic');
    this.userID = this.navParams.get('userID');
  }

  

  async setUpload(event: FileList) 
  {
    this.file = event.item(0);
  }

  async startUpload() {
    // The File object
    const file = this.file;

    // Client-side validation example
    if (file.type.split('/')[0] !== 'image') { 
      console.error('unsupported file type :( ')
      return;
    }

    // The storage path
    let url;
    const path = `profilePhotos/${this.userID}`;
    let storageref = this.storage.ref(path);
    storageref.put(file).then(async any=>
    {
        storageref.getDownloadURL().subscribe(result=>
          {
            this.profilePic = result;
            this.db.collection('users').doc(this.userID).update(
            {
              profileimage:  result
            })
          });
      });

      // this.db.collection('users').doc(this.userID).update(
      //   {
      //     profileimage:  url

    
    // Totally optional metadata
    const customMetadata = { app: 'My AngularFire-powered PWA!' };
  }

  goToSettings()
  {
    this.navCtrl.pop();
  }
    
}










//SOURCE: https://angularfirebase.com/lessons/firebase-storage-with-angularfire-dropzone-file-uploader/



