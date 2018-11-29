import { Injectable } from '@angular/core';
import { AngularFirestore} from 'angularfire2/firestore';
import 'rxjs/add/observable/of';
import { AngularFireStorage } from 'angularfire2/storage';


@Injectable()
export class UserProvider {

  defaultURL = "https://firebasestorage.googleapis.com/v0/b/seniorproject-27d62.appspot.com/o/previews%2FdefaultPhoto.png?alt=media&token=58701963-8475-4902-852b-77acc7affd31";

  constructor(private afs: AngularFirestore, private storage: AngularFireStorage) { }
  
  async getUserInfo(userID:string)
  {
    // Returns entire user document that matches the 
    // passed ID.
    let userInfo=[];
    let ref = await this.afs.firestore.collection(`users`)
    .where("uid","==",userID); 
    await ref.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
       userInfo.push(doc.data());
     })
   });
   return userInfo;
  }
  

 async getUserType(userID:string)
  {
    // Returns user's type. 
    let userInfo=[];
    let ref = await this.afs.firestore.collection(`users`)
    .where("uid","==",userID); 
    await ref.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
       userInfo.push(doc.data());
     })
   });
   return userInfo[0].type;
  }

  async getUserNameByID(userID)
  {
    // Returns user's name. 
    let userInfo=[];
    let ref = await this.afs.firestore.collection(`users`)
    .where("uid","==",userID); 
    await ref.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
       userInfo.push(doc.data());
     })
   });
   return userInfo[0].name;
  
  }

  async getUserImageByID(userID)
  {
    // Gets a user's profile image URL. 
    let userInfo=[];
    let ref = await this.afs.firestore.collection(`users`)
    .where("uid","==",userID); 
    await ref.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
       userInfo.push(doc.data());
     })
   });
   return userInfo[0].profileimage;
  }

  async deleteUser(userID)
  {
    // Deletes a user and their profile image from 
    // the database (as long as their profile image
    // is the not set as the default). 
    let userImage = await this.getUserImageByID(userID);
    if(userImage!=this.defaultURL)
    {
      this.storage.ref(`profilePhotos/${userID}`).delete();
    }
    await this.afs.firestore.collection('users').doc(userID).delete();
  }
}