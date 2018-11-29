import { Component } from '@angular/core';
import { NavController, AlertController, ModalController, App, Loading, LoadingController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AccountsettingsPage} from '../accountsettings/accountsettings';
import { EventProvider } from '../../providers/event/event';
import { AngularFirestore } from 'angularfire2/firestore';
import { ModifyeventlistPage } from '../modifyeventlist/modifyeventlist';
import { TabsPage } from '../tabs/tabs';

@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})

export class AdminPage {

  // Variable that is toggled with the drop-down menu at the top 
  // of the page (for switching to the regular user interface)
  interface="admin";
  loading:Loading;

  constructor(public navCtrl: NavController, private authData: AuthProvider,
    private eventService: EventProvider, private afs: AngularFirestore,
    public alertCtrl: AlertController, public modalCtrl: ModalController,
    public app: App, public loadingCtrl: LoadingController) { }

    pendingEvents;
    async ngOnInit()
    {
      this.pendingEvents = [];
      // Populates the page with pending events.
      await this.eventService.getPendingEvents(this.pendingEvents);

    }

    goToAccountSettings() {
      // Navigates to Account Settings page.
      this.navCtrl.push(AccountsettingsPage);
    }

    async approvePost(postID:string, eventName:string, eventDate)
    {   
      this.eventService.approvePost(postID, eventName, eventDate)
      .catch(error=>
        {
          this.presentErrorAlert(error, postID);
        })
        .then(any=>
        {
          // Reloads the page.
         // this.ngOnInit();
        });
    }

  presentErrorAlert(errorMessage:string,postID:string)
  {
    let error = this.alertCtrl.create({
      title: 'Event not approved!',
      message: errorMessage + 
                "Approve post without creating new event entry?",
      buttons: [
        {
          text: 'Yes.',
          handler: () => {
            // Updates the post's status in the database.
            this.afs.doc(`posts/${postID}`).update({
              status:"approved"
              });
            // Reloads the page.
           // this.ngOnInit();
          }
        },
        {
          text: 'Not now.'
        }
      ]
    });
    error.present();
  }


  async denyPost(postID:string)
  {
    // Deletes post from the database and reloads page. 
    this.afs.doc(`posts/${postID}`).delete();
   // this.ngOnInit();
  }

  async modifyEvents()
  {
    // Opens the Event List page as a modal.
    let myModal = this.modalCtrl.create(ModifyeventlistPage);
      myModal.onDidDismiss(() => {
        // Reloads the page when the modal is closed.
        this.ngOnInit();
    });
    myModal.present();
  }

  logout()
  {
    this.authData.logoutUser();
    window.location.reload();
  }


  switchToRegularInterface()
  {
    // Switches back to the regular user interface,
    // when the "Home" option is selected from the drop
    // down menu at the top of the page.
    if (this.interface=="home")
      this.app.getRootNav().setRoot(TabsPage);
  }

}


