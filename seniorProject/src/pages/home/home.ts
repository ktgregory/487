import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {EventFormPage} from '../eventform/eventform';
import { AboutPage } from '../about/about';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  userID;
  posts=[];
  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
    private authData: AuthProvider, private afs: AngularFirestore) { }


   
   
  async ngOnInit()
    {
    
      this.userID = await this.authData.getUserID(); 
      let postQuery = await this.afs.firestore.collection(`posts`).where("uid","==",this.userID);    
      await postQuery.get().then((querySnapshot) => { 
         querySnapshot.forEach((doc) => {
            this.posts.push(doc.data());
        })
     });


    console.log(this.posts);

  }



  goToEventForm()
  {
    this.navCtrl.push(EventFormPage);
  }
  goToAboutPage()
  {
    this.navCtrl.push(AboutPage);
  }


  doConfirm() {
    let confirm = this.alerCtrl.create({
      title: 'Send request?',
      message: 'Do you want to send a request for more information about this event?',
      buttons: [
        {
          text: 'Yes!',
          handler: () => {
            console.log('Agree clicked');
          }
        },
        {
          text: 'Not now.',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    confirm.present()
}

}


