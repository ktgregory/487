import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {EventFormPage} from '../eventform/eventform';
import { AboutPage } from '../about/about';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { EventInfoProvider } from '../../providers/event-info/event-info';
import { RequestProvider } from '../../providers/request/request';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { AdminPage } from '../admin/admin';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  userID;
  posts=[];
  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
    private authData: AuthProvider, private afs: AngularFirestore,
    private eventInfo: EventInfoProvider, private reqService: RequestProvider,
    private userService: UserinfoProvider, public app: App) {

     }


   
  async ngOnInit()
  {
    
    this.userID = await this.authData.getUserID(); 
    this.posts = await this.eventInfo.getPostsForTimeline();
    this.posts.sort(this.compareDates);
       //^^^ https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    
    let type = await this.userService.getUserType(this.userID);
    if(type=="admin")
    {
      this.app.getRootNav().setRoot(AdminPage);
      //this.navCtrl.setRoot(AdminPage);
     // this.navCtrl.setRoot(AdminPage);
    }

  }

  compareDates(post1, post2)
  {
    return post1.daysUntil - post2.daysUntil;
  }

  // async getFiles() {
  //   // let ref = await this.afs.firestore.collection(`images`);   
  //   // return ref.get().then((querySnapshot) => {
  //   //   querySnapshot.forEach((doc) => {
  //   //     this.posts.push(doc.data());
  //   //   })
  //   // });
  // }

  goToEventForm()
  {
    this.navCtrl.push(EventFormPage);
  }
  goToAboutPage()
  {
    this.navCtrl.push(AboutPage);
  }


  doConfirm(postID:string) {
    let confirm = this.alerCtrl.create({
      title: 'Send request?',
      message: 'Do you want to send a request for more information about this event?',
      buttons: [
        {
          text: 'Yes!',
          handler: () => {
            
            this.reqService.createNewRequest(this.userID, postID).then(any=>
              {
                this.confirmRequest();
              }).catch(error=>
                {
                  this.presentErrorAlert(error);
                }
              );
          }
        },
        {
          text: 'Not now.',
          handler: () => {
           
          }
        }
      ]
    });
    confirm.present()
}

confirmRequest()
{
  let confirm = this.alerCtrl.create({
      title: 'Success!',
      message: 'Request has been sent.',
      buttons: [
        {
          text: 'Okay.'
        }
      ]
    });
    confirm.present();
  }

  presentErrorAlert(errorMessage:string)
  {
    let error = this.alerCtrl.create({
      title: 'Request not sent!',
      message: errorMessage,
      buttons: [
        {
          text: 'Duh.'
        }
      ]
    });
    error.present();

  }

}


