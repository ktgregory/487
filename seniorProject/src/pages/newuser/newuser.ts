
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AngularFirestore} from 'angularfire2/firestore';
import { AuthProvider } from '../../providers/auth/auth';
import { Component } from '@angular/core';

import { IonicPage, NavController, NavParams } from 'ionic-angular';
export interface Data
{
  name:string,
  school:string,
  birthday:string,
  bio:string
}
@IonicPage()
@Component({
  selector: 'page-newuser',
  templateUrl: 'newuser.html',
})

export class NewuserPage {

  public newuserForm: FormGroup;
  userID; 
 // myControl; - Add form control later to ensure that form inputs arent left blank and limit characters 

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private authData: AuthProvider, private afs: AngularFirestore,
    public formBuilder: FormBuilder){
     // this.myControl = new FormControl('value');
      this.newuserForm = formBuilder.group({
        name: [''],
        school: [''],
        birthday:[''],
        bio:['']
      });
  }

   
  async ngOnInit()
  {
      this.userID = await this.authData.getUserID();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewuserPage');
  }

  async newUserForm()
  {
    this.afs.doc(`users/${this.userID}`).set({
      uid: this.userID,
      name: this.newuserForm.value.name,
      bio: this.newuserForm.value.bio,
      birthday: this.newuserForm.value.birthday,
      school: this.newuserForm.value.school
      })
      .then(any=>{
          this.navCtrl.pop();
      });

  }

}
