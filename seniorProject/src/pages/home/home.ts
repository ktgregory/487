import { Component } from '@angular/core';
import { NavController, App, 
  ModalController, 
  ToastController, 
  Loading, 
  LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import {EventFormPage} from '../eventform/eventform';
import { AboutPage } from '../about/about';
import { AuthProvider } from '../../providers/auth/auth';
import { AngularFirestore} from 'angularfire2/firestore';
import { RequestProvider } from '../../providers/request/request';
import { UserProvider } from '../../providers/user/user';
import { AdminPage } from '../admin/admin';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { TimeDateCalculationsProvider } from '../../providers/time-date-calculations/time-date-calculations';

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
  showDescription=false;
  loading:Loading;
  activeMenu: string;

  constructor(public navCtrl: NavController, public alerCtrl: AlertController,
    private authData: AuthProvider, private afs: AngularFirestore,
    private timeInfo: TimeDateCalculationsProvider, private reqService: RequestProvider,
    private userInfo: UserProvider, public app: App, public loadingCtrl: LoadingController,
    public modalCtrl: ModalController, public toastCtrl: ToastController) {
      
    }

   
  async ngOnInit()
  {
    this.posts=[];
    this.userID = await this.authData.getUserID(); 
    await this.getPostsForTimeline();

    // Sorts the posts in chronological order. 
    this.posts = this.posts.sort(this.compareDates);

    this.type = await this.userInfo.getUserType(this.userID);
    if(this.type=="admin")
    {
      this.admin=true;
    }
  }

  async getPostsForTimeline()
  {
    let postQuery = await this.afs.firestore.collection(`posts`)
    .where("status","==","approved");    
    await postQuery.onSnapshot((querySnapshot) => { 
     querySnapshot.docChanges().forEach(async (change) => {
      let post;
      // If a post is added, call the eventTimeCalculations method 
      // and push to the posts array, and resorts the posts. 
      if (change.type === "added") {
        post = await this.timeInfo.eventTimeCalculations(change.doc.data());
        post.profileimage = await this.userInfo.getUserImageByID(post.uid);
        post.username = await this.userInfo.getUserNameByID(post.uid);
        if(post.description.length>30)
        {
          // Creates a preview for the post description if the description
          // is greater than 30 characters. 
          post.descriptionPreview = post.description.substring(0,20) + "...";
          post.longDescription=true;
        }
        else
        {
          post.descriptionPreview = post.description;
          post.longDescription = false;
        }
        this.posts.push(post);
        this.posts.sort(this.compareDates);
        this.listenForUserImageNameUpdates(post);
      }

      // If a post is removed, the eventTimeCalculations must be re-called
      // so the document data will match what is in the posts array.
      if (change.type === "removed") {
        this.removePost(change.doc.data());
      }   
    })
   });   
 }

 async listenForUserImageNameUpdates(updatedPost)
 {
   // Updates a user's profile image if they change their profile
   // photo after the page is initially loaded. 
    let userQuery = await this.afs.firestore.collection(`users`)
    .where("uid","==",updatedPost.uid);
    await userQuery.onSnapshot((querySnapshot) => { 
      querySnapshot.docChanges().forEach(async (change) => {
       
       if (change.type==="modified")
       {
          let userInfo = await change.doc.data();
         this.posts.forEach(post=>
          {
            if (post.postID==updatedPost.postID)
            {
              post.username= userInfo.name;
              post.profileimage= userInfo.profileimage;
            }
          })
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
      if(this.slides.getActiveIndex()==i)
      {
        if(this.slides.getActiveIndex()!=0)
        {
          this.slides.ionSlideDrag.emit();
          this.slides.slidePrev(0);
        }
        else if(this.slides.getActiveIndex()==0)
        {
          this.slides.ionSlideDrag.emit();
          this.slides.slideNext(0);
        }
        else if (this.slides.getActiveIndex()==(this.slides.length()-1))
        {
          this.slides.slidePrev(0);
          this.slides.ionSlideDrag.emit();
        }
        else
        {
          this.slides.ionSlideDrag.emit();
          this.slides.slideNext(0);
        }
      }

      this.posts.splice(i,1);
      this.posts.sort(this.compareDates);
      this.slides.update();
    }
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
      'Do you want to send a request to open a chat with this user about this event?',
      buttons: [{
        text: 'Yes!',
        handler: () => {
          // Creates a new requests, and either catches any errors or 
          // displays confirmation that the request was successfully sent.
          this.reqService.createNewRequest(this.userID, postID)
          .then(()=>
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
      }]
    });
    confirm.present();
  }

  confirmRequest()
  {
    let confirm = this.toastCtrl.create({
      message: 'Your request has been sent.',
      position: 'bottom',
      duration:2000,
      showCloseButton:true,
      closeButtonText:'x'
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

  toggleDescription()
  {
    if(this.showDescription==true)
      this.showDescription=false;
    else
      this.showDescription=true;
  }
  
  slideDragged()
  {
    this.showDescription=false;
  }
  
}