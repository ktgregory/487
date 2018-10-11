import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';

@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html'
})
export class NotificationsPage {

  userID;
  receivedRequests=[];

  constructor(public navCtrl: NavController, private authData: AuthProvider,
    private afs: AngularFirestore) {

  }

   
  async ngOnInit()
    {
    
      this.userID = await this.authData.getUserID(); 
      let postQuery = await this.afs.firestore.collection(`requests`);    
      await postQuery.get().then((querySnapshot) => { 
         querySnapshot.forEach((doc) => {
            this.receivedRequests.push(doc.data());
        })
     });


    console.log(this.receivedRequests);

  }

}
