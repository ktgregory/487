import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {EventFormPage} from '../eventform/eventform';
import { AboutPage } from '../about/about';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { EventInfoProvider } from '../../providers/event-info/event-info';

// class Post 
// {
//   public uid: string;
//   public event: string;
//   public date: any;
//   public description: string;
//   public postID: string;
//   public image: string;
//   public username: string;
//   public profileimage: string;
//   public dateString: string;
//   public daysUntil: any;
//   public timeUntil: string;
//   public notExpired: Boolean;
// }
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  userID;
  posts=[];
  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
    private authData: AuthProvider, private afs: AngularFirestore,
    private eventInfo: EventInfoProvider) { }

  
   
   
  async ngOnInit()
  {
    
    this.userID = await this.authData.getUserID(); 
    this.posts = await this.eventInfo.getEventTimeInfo();
    this.posts.sort(this.compareDates);
       //^^^ https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  

  }

  compareDates(post1, post2)
  {
    return post1.daysUntil - post2.daysUntil;
  }

  async getFiles() {
    let ref = await this.afs.firestore.collection(`images`);   
    return ref.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.posts.push(doc.data());
      })
    });
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


