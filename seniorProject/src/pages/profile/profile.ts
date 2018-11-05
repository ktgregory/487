import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController} from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AccountsettingsPage } from '../accountsettings/accountsettings';
import { AngularFirestore} from 'angularfire2/firestore';
import { EventInfoProvider } from '../../providers/event-info/event-info';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage implements OnInit {
  
  name;
  bio;
  email;
  school;
  userinfo;
  userID;
  currentemail;
  userData;
  imageURL;
  posts=[];
  noPosts;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, 
    public authData: AuthProvider, public loadingCtrl: LoadingController, 
    private eventInfo: EventInfoProvider, private afs: AngularFirestore
    )  { }
  
   
  async ngOnInit()
    {
      // Queries for the current user's profile information
      // and all of their posts. 
      this.userID = await this.authData.getUserID();
      let userQuery = await this.afs.firestore.collection(`users`)
      .where("uid","==",this.userID);    
      await userQuery.get().then((querySnapshot) => {  
         querySnapshot.forEach((doc) => {
          this.name = doc.data().name;
          this.email = doc.data().email;
          this.school = doc.data().school;
          this.bio = doc.data().bio;
          this.imageURL = doc.data().profileimage;
        })
     });
     
     this.posts = await this.eventInfo.getEventTimeInfoWithID(this.userID);

     if (this.posts.length ==0)
     {
       this.noPosts = true;
     }
     else
     {
       // Sorts posts chronologically. 
      this.posts.sort(this.compareDates);
     }
  }

  compareDates(post1, post2)
  {
    // Comparison that is used to sort posts. 
    return post1.daysUntil - post2.daysUntil;
  }
  
  ionViewWillEnter()
  {
    // Refreshes user's information when the page 
    // is being loaded. 
    this.ngOnInit();
  }


  goToSettings() 
  {
    this.navCtrl.push(SettingsPage, this.posts);
  }

  goToAccountSettings() 
  {
    this.navCtrl.push(AccountsettingsPage);
  }

  
  confirmDeletePost(postID:string) 
  {
    //If trash can button is clicked, 
    // the user is asked to confirm before the post is deleted.
    let confirm = this.alertCtrl.create({
      title: 'Delete event post?',
      message: 'Do you want to delete your post about' 
        + 'this event? This cannot be undone.',
      buttons: [
        {
          text: 'Yes.',
          handler: () => {
            this.eventInfo.deletePost(postID);
            this.ngOnInit();
          }
        },
        {
          text: 'Nevermind!'
        }
      ]
    });
    confirm.present()
  }

  statusInfo() {
    let confirm = this.alertCtrl.create({
      title: 'Post Status:',
      message: 'If a post is pending, you will be notified when it is approved or denied!',
      buttons: [
        {
          text: 'Okay.',
        }
      ]
    });
    confirm.present()
  }


  logout()
  {
    // Logs user out and returns to the Login page. 
    this.authData.logoutUser();
    window.location.reload();
  }

}
