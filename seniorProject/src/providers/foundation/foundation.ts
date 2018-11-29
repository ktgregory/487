// For future use!

import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

@Injectable()
export class FoundationProvider {


  private toast = null; 

  constructor (
      private toastCtrl: ToastController, private platform: Platform
  ) {}

  presentToast(message, position, cssclass) {
      // Prevent toasts from "stacking":
      if (this.toast) {
          this.toast.dismiss();
          this.toast = null;
      }
      // Create a toast:
      this.toast = this.toastCtrl.create({
          message: message,
          closeButtonText: "OK",
          showCloseButton: true,
          cssClass: cssclass,
          position: position,
      });
      this.toast.present();
  }

  appIsOnDevice()
  {
    return !this.platform.url().startsWith('http');
  }

}

// SOURCE: //https://forum.ionicframework.com/t/pwa-new-way-for-add-to-home-screen-banner/131584/6
