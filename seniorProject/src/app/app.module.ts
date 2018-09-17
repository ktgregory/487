import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { MessagesPage } from '../pages/messages/messages';
import { ProfilePage } from '../pages/profile/profile';
import { HomePage } from '../pages/home/home';
import { NotificationsPage } from '../pages/notifications/notifications';
import { TabsPage } from '../pages/tabs/tabs';
import {LoginPage} from '../pages/login/login';
import {SettingsPage} from '../pages/settings/settings';
import {EventFormPage} from '../pages/eventform/eventform';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    ProfilePage,
    MessagesPage,
    NotificationsPage,
    HomePage,
    LoginPage,
    SettingsPage,
    EventFormPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProfilePage,
    MessagesPage,
    NotificationsPage,
    HomePage,
    LoginPage,
    SettingsPage,
    EventFormPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
