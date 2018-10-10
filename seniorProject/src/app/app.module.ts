import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { MessagesPage } from '../pages/messages/messages';
import { ProfilePage } from '../pages/profile/profile';
import { HomePage } from '../pages/home/home';
import { NotificationsPage } from '../pages/notifications/notifications';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { SignUpPage } from '../pages/signup/signup';
import { AdminPage } from '../pages/admin/admin';

import { AboutPage } from '../pages/about/about';
import { AccountsettingsPage } from '../pages/accountsettings/accountsettings';
import { UploadPage } from '../pages/uploadprofilepic/uploadprofilepic';

import {ResetPasswordPage} from '../pages/resetpassword/resetpassword';
import {SettingsPage} from '../pages/settings/settings';
import {EventFormPage} from '../pages/eventform/eventform';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpClientModule } from '@angular/common/http'; 
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';
import { AuthProvider } from '../providers/auth/auth';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule} from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environment/environment';
import { UserinfoProvider } from '../providers/userinfo/userinfo';


@NgModule({
  declarations: [
    MyApp,
    ProfilePage,
    MessagesPage,
    NotificationsPage,
    HomePage,
    LoginPage,
    SignUpPage,
    SettingsPage,
    EventFormPage,
    ResetPasswordPage,
    AdminPage,
    UploadPage,
    AccountsettingsPage,
    AboutPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebaseConfig, 'seniorProject'),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    HttpModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProfilePage,
    MessagesPage,
    NotificationsPage,
    HomePage,
    LoginPage,
    SignUpPage,
    SettingsPage,
    EventFormPage,
    ResetPasswordPage,
    AdminPage,
    UploadPage,
    AboutPage,
    AccountsettingsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
   {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserinfoProvider, 
  ]
})
export class AppModule {}
