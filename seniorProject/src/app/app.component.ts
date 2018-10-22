import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { AngularFireAuth } from 'angularfire2/auth';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, afAuth: AngularFireAuth, 
    statusBar: StatusBar, splashScreen: SplashScreen ) {
    const authObserver = afAuth.authState.subscribe(user => {
      if (user) {

   
          this.rootPage = TabsPage;

       
        authObserver.unsubscribe();
        

      } else {
        this.rootPage = LoginPage;
        authObserver.unsubscribe();
      }
    });
    platform.ready().then(() => {
     
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
  
}
