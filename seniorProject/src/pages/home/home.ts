import { Component } from '@angular/core';
import { NavController, App, ModalController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {EventFormPage} from '../eventform/eventform';
import { AboutPage } from '../about/about';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { EventInfoProvider } from '../../providers/event-info/event-info';
import { RequestProvider } from '../../providers/request/request';
import { UserinfoProvider } from '../../providers/userinfo/userinfo';
import { AdminPage } from '../admin/admin';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(Slides) slides: Slides;
  userID;
  posts=[];
  type;
  admin = false;
  interface = "reg";
  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
    private authData: AuthProvider, private afs: AngularFirestore,
    private eventInfo: EventInfoProvider, private reqService: RequestProvider,
    private userService: UserinfoProvider, public app: App, 
    public modalCtrl: ModalController) {}

   
  async ngOnInit()
  {
    this.posts=[];
    this.userID = await this.authData.getUserID(); 
    await this.getPostsForTimeline();

    // Sorts the posts in chronological order. 
    this.posts = this.posts.sort(this.compareDates);

    this.type = await this.userService.getUserType(this.userID);
    if(this.type=="admin")
    {
      this.admin=true;
    }
  }

  async ionViewWillEnter()
  {
    // Checks to see if the user is admin.
    // If so, they are redirected to the Admin page. 
    // This is needed for when an admin user refreshes
    // their page. 
    // let type = await this.userService.getUserType(this.userID);
    // if(type=="admin")
    // {
    //   this.app.getRootNav().setRoot(AdminPage);
    // }
  }

  async getPostsForTimeline()
  {
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("status","==","approved");    
    await postQuery.onSnapshot((querySnapshot) => { 
     querySnapshot.docChanges().forEach((change) => {

      // If a post is added, call the eventTimeCalculations method 
      // and push to the posts array, and resorts the posts. 
      if (change.type === "added") {
        this.posts.push(this.eventInfo.eventTimeCalculations(change.doc.data()));
        this.posts.sort(this.compareDates);
      }

      // If a post is removed, the eventTimeCalculations must be re-called
      // so the document data will match what is in the posts array.
      if (change.type === "removed") {
        this.remove(this.posts, (this.eventInfo.eventTimeCalculations(change.doc.data())));
      }   
    })
   });   
 }

 // Used to remove a post from the posts array. 
  remove(array, element) { 
    // SOURCE: https://blog.mariusschulz.com/2016/07/16/removing-elements-from-javascript-arrays
    const index = array.indexOf(element);
    if (index != -1) {
      array.splice(index, 1);
    }
  }

  compareDates(post1, post2)
  {
    return post1.daysUntil - post2.daysUntil;
     // SOURCE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  }

  goToEventForm()
  {
    // Creates and opens the Event form modal.
    let myModal = this.modalCtrl.create(EventFormPage);
    myModal.onDidDismiss(() => {});
    myModal.present();
  }

  goToAboutPage()
  {
    this.navCtrl.push(AboutPage);
  }


  doConfirm(postID:string) {
    let confirm = this.alerCtrl.create({
      title: 'Send request?',
      message: 
      'Do you want to send a request for more information about this event?',
      buttons: [
      {
        text: 'Yes!',
        handler: () => {
          // Creates a new requests, and either catches any errors or 
          // displays confirmation that the request was successfully sent.
          this.reqService.createNewRequest(this.userID, postID)
          .then(any=>
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
        text: 'Not now.'
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
      buttons: [{
        text: 'Duh.'
      }]
    });
    error.present();
  }

  switchToAdminInterface()
  {
    // Switches to the administrative user interface,
    // when the "Admin" option is selected from the drop
    // down menu at the top of the page.
    if (this.interface=="admin")
      this.app.getRootNav().setRoot(AdminPage);
  }
}