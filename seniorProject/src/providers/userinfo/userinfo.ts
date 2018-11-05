import { Injectable } from '@angular/core';
import { AngularFirestore} from 'angularfire2/firestore';
import 'rxjs/add/observable/of';


@Injectable()
export class UserinfoProvider {

  constructor(private afs: AngularFirestore) { }

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
}