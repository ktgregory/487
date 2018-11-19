import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController} from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AccountsettingsPage } from '../accountsettings/accountsettings';
import { AngularFirestore} from 'angularfire2/firestore';
import { EventInfoProvider } from '../../providers/event-info/event-info';
import { AngularFireStorage } from 'angularfire2/storage';
import { TimeDateCalculationsProvider } from '../../providers/time-date-calculations/time-date-calculations';

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
  noPosts=false;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, 
    public authData: AuthProvider, public loadingCtrl: LoadingController, 
    private eventInfo: EventInfoProvider, private afs: AngularFirestore,
    private storage: AngularFireStorage, private timeInfo: TimeDateCalculationsProvider
    )  { }
  
   
  async ngOnInit()
    {
      
      // Queries for the current user's profile information
      // and all of their posts. 
      this.userID = await this.authData.getUserID();
      let userQuery = await this.afs.firestore.collection(`users`)
      .where("uid","==",this.userID);    
      await userQuery.get().then((querySnapshot) => {  
         querySnapshot.docChanges().forEach(async (change) => {
          this.name = change.doc.data().name;
          this.email = change.doc.data().email;
          this.school = change.doc.data().school;
          this.bio = change.doc.data().bio;
          this.imageURL = change.doc.data().profileimage;
        })
     });
     
     this.getEventTimeInfoWithID();
    
     if (this.posts.length ==0)
     {
       this.noPosts=true;
     }
  }

  compareDates(post1, post2)
  {
    // Comparison that is used to sort posts. 
    return post1.daysUntil - post2.daysUntil;
  }
  

  goToSettings() 
  {
    this.navCtrl.push(SettingsPage,
      {
        'profilePic':this.imageURL,
        'userID': this.userID
      });
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
            this.storage.ref('postPhotos/'+postID).delete();
          }
        },
        {
          text: 'Nevermind!'
        }
      ]
    });
    confirm.present();
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


  async getEventTimeInfoWithID()
  {
    // Gets posts and corresponding time calculations and date string
    // that a user has posted. 
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("uid","==",this.userID);    
    await postQuery.onSnapshot((querySnapshot) => { 
       querySnapshot.docChanges().forEach(async (change) => {
  
        if(change.type === "added")
        {
          this.posts.push(await this.timeInfo.eventTimeCalculations(change.doc.data()));
          this.noPosts=false;
          this.posts.sort(this.compareDates);
        }
        if (change.type === "removed")
        {
          this.posts.sort(this.compareDates); 
          this.removePost(change.doc.data());
          if(this.posts.length==0)
            this.noPosts=true;
        }
      })
    });
  }

   // Used to remove a post from the posts array. 
   removePost(removedPost) { 

    for(let i=0; i < this.posts.length; i++)
    {
      if(this.posts[i].postID == removedPost.postID)
      {
        this.posts.splice(i,1);
        this.posts.sort(this.compareDates);

      }
    }
  }

  logout()
  {
    // Logs user out and returns to the Login page. 
    this.authData.logoutUser();
    window.location.reload();
  }

}
