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

import {ResetPasswordPage} from '../pages/resetpassword/resetpassword';
import {SettingsPage} from '../pages/settings/settings';
import {EventFormPage} from '../pages/eventform/eventform';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';


import { AngularFireModule } from 'angularfire2';
import { AuthProvider } from '../providers/auth/auth';
import { AngularFireAuthModule } from 'angularfire2/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAbSZBtYt9-Vpn41Y8FtwZ-cop7U_xm3cU",
  authDomain: "senior-project-5e8d8.firebaseapp.com",
  databaseURL: "https://senior-project-5e8d8.firebaseio.com",
  projectId: "senior-project-5e8d8",
  storageBucket: "senior-project-5e8d8.appspot.com",
  messagingSenderId: "201357500908"
};


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
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule
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
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider
  ]
})
export class AppModule {}
