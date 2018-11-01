import { Injectable } from '@angular/core';
import { AngularFirestore} from 'angularfire2/firestore';
import { AngularFireDatabase} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/observable/of';
import { AuthProvider } from '../auth/auth';


@Injectable()
export class UserinfoProvider {

 

  constructor(private afs: AngularFirestore, private db: AngularFireDatabase, 
    private afAuth: AngularFireAuth, private authProvider:AuthProvider) {
     
  }

  async getUserInfo(userID:string)
  {
    let userInfo=[];
    let ref = await this.afs.firestore.collection(`users`).where("uid","==",userID); 
    await ref.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
       userInfo.push(doc.data());
     })
   });

   return userInfo;

  }
  

 async getUserType(userID:string)
  {
    let userInfo=[];
    let ref = await this.afs.firestore.collection(`users`).where("uid","==",userID); 
    await ref.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
       userInfo.push(doc.data());
     })
   });
   return userInfo[0].type;

  }

  async getUserNameByID(userID)
  {
    
    let userInfo=[];
    let ref = await this.afs.firestore.collection(`users`).where("uid","==",userID); 
    await ref.get().then((querySnapshot) => { 
      querySnapshot.forEach((doc) => {
       userInfo.push(doc.data());
     })
   });
   return userInfo[0].name;
    

  }

}