import { Injectable } from '@angular/core';
import { AngularFirestore, 
  AngularFirestoreCollection, 
  AngularFirestoreDocument } from 'angularfire2/firestore';
import { UserInfo } from '../../models/item.model';
import { Observable } from 'rxjs/observable';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http'; 
import { AngularFireDatabase, AngularFireAction} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/observable/of';
import { of } from 'rxjs';
import { Subject } from 'rxjs/Subject';

/*
  Generated class for the UserinfoProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

export class User
{
  body: string;
}

@Injectable()
export class UserinfoProvider {

  userId: string;
  itemsCollection: AngularFirestoreCollection<UserInfo>;
  userinfo: Observable<UserInfo>;
  users;
  test;

  constructor(private afs: AngularFirestore, private db: AngularFireDatabase, 
    private afAuth: AngularFireAuth) {
   
    this.users = this.db.list('/path');
    this.afAuth.authState.subscribe(user => {
      if(user) this.userId = user.uid;
    })
    this.userinfo = this.afs.collection('users').doc('this.userId').valueChanges();
    this.test = this.afs.collection('users').doc(`this.userId`);
    console.log(this.test);
  }

  getUserInfo(): Observable<UserInfo>
  {
    if(!this.userId) return;
   // this.users = this.db.list(`users/${this.userId}`);
  //  console.log(this.users.toString());
    return this.userinfo;
  }


}
