// Project by Katie Gregory

import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { MessagesPage } from '../pages/messages/messages';
import { ProfilePage } from '../pages/profile/profile';
import { HomePage } from '../pages/home/home';
import { RequestCenterPage } from '../pages/request-center/request-center';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { SignUpPage } from '../pages/signup/signup';
import { AdminPage } from '../pages/admin/admin';
import { AboutPage } from '../pages/about/about';
import { AccountsettingsPage } from '../pages/accountsettings/accountsettings';
import { ChangepasswordPage } from '../pages/changepassword/changepassword';
import { ChangeemailPage } from '../pages/changeemail/changeemail';
import { ModifyeventlistPage } from '../pages/modifyeventlist/modifyeventlist';
import { AdmineventformPage } from '../pages/admineventform/admineventform';
import { ChatroomPage } from '../pages/chatroom/chatroom';
import { DeleteAccountPage } from '../pages/delete-account/delete-account';

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
import { UserProvider } from '../providers/user/user';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { SelectSearchableModule } from 'ionic-select-searchable';
import { EventProvider } from '../providers/event/event';
import { RequestProvider } from '../providers/request/request';
import { RequestModalPage } from '../pages/request-modal/request-modal';
import { ChatProvider } from '../providers/chat/chat';
import { FoundationProvider } from '../providers/foundation/foundation';
import { TimeDateCalculationsProvider } from '../providers/time-date-calculations/time-date-calculations';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  declarations: [
    MyApp,
    ProfilePage,
    MessagesPage,
    RequestCenterPage,
    HomePage,
    LoginPage,
    SignUpPage,
    SettingsPage,
    EventFormPage,
    ResetPasswordPage,
    AdminPage,
    AccountsettingsPage,
    AboutPage,
    TabsPage,
    ChangepasswordPage,
    ChangeemailPage,
    ModifyeventlistPage,
    RequestModalPage,
    ChatroomPage,
    DeleteAccountPage,
    AdmineventformPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(environment.firebaseConfig, 'seniorProject'),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    HttpModule,
    HttpClientModule,
    SelectSearchableModule,
    LazyLoadImageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProfilePage,
    MessagesPage,
    RequestCenterPage,
    HomePage,
    LoginPage,
    SignUpPage,
    SettingsPage,
    EventFormPage,
    ResetPasswordPage,
    AdminPage,
    AboutPage,
    AccountsettingsPage,
    TabsPage,
    ChangepasswordPage,
    ChangeemailPage,
    ModifyeventlistPage,
    RequestModalPage,
    ChatroomPage,
    DeleteAccountPage,
    AdmineventformPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserProvider,
    EventProvider,
    RequestProvider,
    ChatProvider,
    FoundationProvider,
    TimeDateCalculationsProvider
  ]
})
export class AppModule {}
