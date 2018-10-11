import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/observable';
import { AngularFirestoreDocument } from 'angularfire2/firestore';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
//import { User } from '../../models/item.model';
import { switchMap } from 'rxjs/operators';
import { AngularFireDatabase } from 'angularfire2/database';
/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

interface User 
{
  uid: string;
  name?: string;
  email?: string | null;
}

@Injectable()
export class AuthProvider {

  userDoc;
  info;
  userID;
  user: Observable<User | null>;
  constructor(private afAuth: AngularFireAuth,
    private afs: AngularFirestore, private db : AngularFireDatabase) {
      this.user = this.afAuth.authState.pipe(
        switchMap(user => {
          if (user) {
            
            this.userID = user.uid;
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            return Observable.of(null);
          }
        })
      );
  }



  loginUser(email: string, password: string) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(credential => {
        this.userID = credential.user.uid;
        return this.updateUserData(credential.user);
      }).catch();
  }

  resetPassword(email: string): Promise<void> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  signupUser(newEmail: string, newPassword: string): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(newEmail, newPassword);
  }

  private updateUserData(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );


    const data: User = {
      uid: user.uid
      // displayName: user.displayName || 'nameless user',
      // photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ'
    };

  }

  getUserID()
  {
    console.log(this.afAuth.auth.currentUser.uid);
    return this.afAuth.auth.currentUser.uid
  }

}
