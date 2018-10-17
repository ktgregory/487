import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { AngularFireAuth } from 'angularfire2/auth'; // imported for firebase authentication
import { AuthProvider } from '../providers/auth/auth';
import { UserinfoProvider } from '../providers/userinfo/userinfo';
import { AdminPage } from '../pages/admin/admin';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, afAuth: AngularFireAuth, 
    statusBar: StatusBar, splashScreen: SplashScreen,
    authData: AuthProvider, userService: UserinfoProvider ) {
    const authObserver = afAuth.authState.subscribe(user => {
      if (user) {

       
        // const type = userService.getUserType(afAuth.auth.currentUser.uid).subscribe(type=>
        // {
        //   if(type == "admin")
        //   {
        //     this.rootPage = AdminPage;
        //   }
        //   else
        //  {
          this.rootPage = TabsPage;
         // }

        //});
       
        authObserver.unsubscribe();
        //console.log(type);

      } else {
        this.rootPage = LoginPage;
        authObserver.unsubscribe();
      }
    });
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
  
}
