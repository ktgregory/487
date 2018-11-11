import { Component } from '@angular/core';
import { NavController, AlertController, ModalController, App } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AccountsettingsPage} from '../accountsettings/accountsettings';
import { EventInfoProvider } from '../../providers/event-info/event-info';
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

  constructor(public navCtrl: NavController, private authData: AuthProvider,
    private eventService: EventInfoProvider, private afs: AngularFirestore,
    public alertCtrl: AlertController, public modalCtrl: ModalController,
    public app: App) { }

    noPending = false;
    pendingEvents = [];

    async ngOnInit()
    {
      // Populates the page with pending events.
      this.pendingEvents = await this.eventService.getPendingEvents();
      if(this.pendingEvents.length==0)
        this.noPending=true;
    }

 
    goToAccountSettings() {
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
          this.ngOnInit();
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
            this.ngOnInit();
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
    this.ngOnInit();
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


