import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import {TabsPage} from '../tabs/tabs';
import { AuthProvider } from '../../providers/auth/auth';
import { AccountsettingsPage} from '../accountsettings/accountsettings';
import { EventInfoProvider } from '../../providers/event-info/event-info';
import { AngularFirestore } from 'angularfire2/firestore';
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})
export class AdminPage {

  constructor(public navCtrl: NavController, private authData: AuthProvider,
    private eventService: EventInfoProvider, private afs: AngularFirestore,
    public alertCtrl: AlertController) { }

    noPending = false;
    pendingEvents = [];

    async ngOnInit()
    {
      this.pendingEvents = await this.eventService.getPendingEvents();
      if(this.pendingEvents.length==0)
        this.noPending=true;

    }

    goToTabs() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(TabsPage);
    }


    goToAccountSettings() {
      //push another page onto the history stack
      //causing the nav controller to animate the new page in
      this.navCtrl.push(AccountsettingsPage);
    
    }

    async approvePost(postID:string, eventName:string)
    { 
      
    
      let id = this.afs.createId();
      this.eventService.approvePost(id, eventName).catch(error=>
        {
          this.presentErrorAlert(error, postID);
        }).then(any=>
        {
          this.ngOnInit();
        });
        

      //notify user 

    }

  presentErrorAlert(errorMessage:string,postID:string)
  {
    let error = this.alertCtrl.create({
      title: 'Event not approved!',
      message: errorMessage + " Approve post without creating new event entry?",
      buttons: [
        {
          text: 'Yes.',
          handler: () => {
            this.afs.doc(`posts/${postID}`).update({
              status:"approved"
              });
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
      this.afs.doc(`posts/${postID}`).delete();
      this.ngOnInit();
      //notify user with message (ie this event is already on the list)

    }

    logout()
    {
      this.authData.logoutUser();
      window.location.reload();

    }
  }


