import { Component } from '@angular/core';

import { NotificationsPage } from '../notifications/notifications';
import { MessagesPage } from '../messages/messages';
import { ProfilePage } from '../profile/profile';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = MessagesPage;
  tab3Root = NotificationsPage;
  tab4Root = ProfilePage;

  constructor() {

  }
}