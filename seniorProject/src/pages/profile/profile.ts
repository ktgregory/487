import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController} from 'ionic-angular';
import { SettingsPage } from '../settings/settings';
import { AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { AccountsettingsPage } from '../accountsettings/accountsettings';
import { AngularFirestore} from 'angularfire2/firestore';
import { EventProvider } from '../../providers/event/event';
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
  newlyApproved=[];
  noPosts=false;

  constructor(public navCtrl: NavController, public alertCtrl: AlertController, 
    public authData: AuthProvider, public loadingCtrl: LoadingController, 
    private eventInfo: EventProvider, private afs: AngularFirestore,
    private storage: AngularFireStorage, private timeInfo: TimeDateCalculationsProvider
    )  { }
  
   
  async ngOnInit()
    {
      
      // Queries for the current user's profile information
      // and all of their posts. 
      this.userID = await this.authData.getUserID();
      
      let userQuery = await this.afs.firestore.collection(`users`)
      .where("uid","==",this.userID);    
      await userQuery.onSnapshot((querySnapshot) => {  
         querySnapshot.docChanges().forEach(async (change) => {
          this.name = change.doc.data().name;
          this.email = change.doc.data().email;
          this.school = change.doc.data().school;
          this.bio = change.doc.data().bio;
          this.imageURL = change.doc.data().profileimage;
        })
     });
     
     this.getEventTimeInfoWithID();
     this.newlyApproved.forEach(post=>
      {
        let notification = this.alertCtrl.create({
          title: 'Post Status:',
          message: "Your post about " + post.event + " has been approved!",
          buttons: [
            {
              text: 'Okay.',
            }
          ]
        });
        notification.present();
      });
      this.newlyApproved=[];
     if (this.posts.length ==0)
     {
       this.noPosts=true;
     }
  }

  ionViewDidEnter()
  {
    // Creates an alert for if any newly approved posts. 
    this.newlyApproved.forEach(post=>
      {
        this.afs.firestore.collection('posts').doc(post.postID)
        .update({approvalViewed:true});
        let notification = this.alertCtrl.create({
          title: 'Post Status:',
          message: "Your post about " + post.event + " has been approved!",
          buttons: [
            {
              text: 'Okay.',
            }
          ]
        });
        notification.present();
      });
      this.newlyApproved=[];
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
    // If trash can button is clicked, 
    // the user is asked to confirm before the post is deleted.
    let confirm = this.alertCtrl.create({
      title: 'Delete event post?',
      message: 'Do you want to delete your post about ' 
        + ' this event? This cannot be undone.',
      buttons: [
        {
          text: 'Yes.',
          handler: () => {
            this.eventInfo.deletePost(postID);
          }
        },
        {
          text: 'Nevermind!'
        }
      ]
    });
    confirm.present();
  }

  statusInfo(status) 
  {
    let message;
    if(status=="approved")
    {
      message = "This post has been approved and is displayed to other users on their Home Tabs!"
    }
    else 
    {
      message = "This post is still pending. You will be notified when it is approved!"
    }
    let confirm = this.alertCtrl.create({
      title: 'Post Status:',
      message: message,
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
          if(change.doc.data().status=="approved" && change.doc.data().approvalViewed==false)
          {
            this.newlyApproved.push(change.doc.data());
          }
        }
        if (change.type === "removed")
        {
          this.posts.sort(this.compareDates); 
          this.removePost(change.doc.data());
          if(this.posts.length==0)
            this.noPosts=true;
        }
        if (change.type === "modified")
        {
          this.checkForNewApproved(change.doc.data());
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

  checkForNewApproved(updatedPost)
  {
    // Checks to see if any pending posts have 
    // become approved.
    this.posts.forEach(post=>
    {
        if(updatedPost.postID == post.postID)
        {
          post = updatedPost;
          if (post.status=="approved" && post.approvalViewed==false)
          {
            this.newlyApproved.push(post);
          }
        }
    });
  }

}
