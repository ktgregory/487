import { Injectable } from '@angular/core';
import { AngularFirestore, 
  AngularFirestoreCollection, 
  AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from '../../models/item.model';
import { Observable } from 'rxjs/observable';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http'; 
import { AngularFireDatabase, AngularFireAction} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/observable/of';
import { of } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { switchMap } from 'rxjs/operators';
import { AuthProvider } from '../auth/auth';
import { getTypeNameForDebugging } from '@angular/common/src/directives/ng_for_of';


@Injectable()
export class UserinfoProvider {

  itemsCollection: AngularFirestoreCollection<User>;
  userinfo: Observable<User[]>;
  user: Observable<User | null>;
  userID;
  name;
  

  constructor(private afs: AngularFirestore, private db: AngularFireDatabase, 
    private afAuth: AngularFireAuth, private authProvider:AuthProvider) {
      this.user = this.afAuth.authState.pipe(
        switchMap(user => {
          if (user) {
            this.userID = user.uid;
           // this.userinfo = this.afs.collection(`users`).valueChanges();
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            return Observable.of(null);
          }
        })
      );
    // this.users = this.db.list('/path');
    
    //this.test = this.afs.collection('users').doc();
  }

async getUserInfo(): Promise<void>
  {
      this.userID = await this.authProvider.getUserID();
      let userQuery = await this.afs.firestore.collection(`users`).where("uid","==",this.userID);    
      await userQuery.get().then((querySnapshot) => { 
          
         querySnapshot.forEach((doc) => {

          this.name = doc.data().name;
          //console.log(userinfo);
         // return userinfo;

        })
     });
  }


async getName(): Promise<void>
{
  await this.getUserInfo();
  return await this.name;
}

}


// GET ALL OF A COLLECTION !!!!!!!!
// let userDoc = this.afs.firestore.collection(`users`);
//       userDoc.get().then((querySnapshot) => { 
//         querySnapshot.forEach((doc) => {
//               console.log(doc.id, "=>", doc.data());  
//         })
//       });