import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
// import { AngularFirestore } from 'angularfire2/firestore';
// import { Observable } from 'rxjs/observable';
// import { AngularFirestoreDocument } from 'angularfire2/firestore';
// import { switchMap } from 'rxjs/operators';

interface User 
{
  uid: string;
  name?: string;
  email?: string | null;
}

@Injectable()
export class AuthProvider {

  userID;
 // user: Observable<User | null>;
  constructor(private afAuth: AngularFireAuth,
    //private afs: AngularFirestore
    ) {
      
      // Pipe for auth state.
    //   this.user = this.afAuth.authState.pipe
    //   (
    //     switchMap(user => {
    //       if (user) {
    //         this.userID = user.uid;
    //         return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
    //       } else {
    //         return Observable.of(null);
    //       }
    //     })
    // );
  }



  loginUser(email: string, password: string) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(credential => {
        this.userID = credential.user.uid;
       // return this.updateUserData(credential.user);
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

  // private updateUserData(user: User) {
  //   // const userRef: AngularFirestoreDocument<User> = this.afs.doc(
  //   //   `users/${user.uid}`
  //   // );
  // }

  updateUserEmail(currentEmail: string, password: string, newEmail:string): Promise<any>
  {
    // Updates user's email address after re-logging them in.
    this.loginUser(currentEmail, password);
    return this.afAuth.auth.currentUser.updateEmail(newEmail);
  }

  getUserEmail()
  {
    return this.afAuth.auth.currentUser.email;
  }

  getUserID()
  {
    return this.afAuth.auth.currentUser.uid;
  }

  changePassword(newPassword:string)
  {
    return this.afAuth.auth.currentUser.updatePassword(newPassword);
  }

  changeEmail(newEmail:string)
  {
    return this.afAuth.auth.currentUser.updateEmail(newEmail);
  }


}


/*
SOURCES:

https://www.youtube.com/watch?v=2ciHixbc4HE (How to Connect Firebase Users to their Data - 3 Methods)

https://javebratt.com/ionic-firebase-tutorial-auth/ (Firebase Authentication for Ionic Apps)

*/