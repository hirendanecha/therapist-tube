import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  isDark = true;
  userData: any = {};
  notificationList: any = [];
  isNotify = false;

  constructor(
    public modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private customerService: CustomerService
  ) {
    if (localStorage.getItem('theme') === 'dark') {
      this.changeDarkUi();
    } else {
      this.changeLightUi();
    }
  }

  changeDarkUi() {
    this.isDark = true;
    document.body.classList.remove('dark-ui');
    // document.body.classList.add('dark-ui');
    localStorage.setItem('theme', 'dark');
  }

  changeLightUi() {
    this.isDark = false;
    document.body.classList.add('dark-ui');
    // document.body.classList.remove('dark-ui');
    localStorage.setItem('theme', 'light');
  }

  toggleUi(): void {
    if (this.isDark) {
      this.changeLightUi();
    } else {
      this.changeDarkUi();
    }
  }

  getUserDetails() {
    const profileId = localStorage.getItem('profileId');
    if (profileId) {
      const localUserData = JSON.parse(localStorage.getItem('userData'));
      if (localUserData?.Id) {
        this.userData = localUserData;
      }

      this.spinner.show();

      this.customerService.getProfile(profileId).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const data = res?.data?.[0];

          if (data) {
            this.userData = data;
            localStorage.setItem('userData', JSON.stringify(this.userData));
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        }
      });
    }
  }

  isUserMediaApproved(): boolean {
    return this.userData?.MediaApproved === 1;
  }

  getNotificationList() {
    const id = localStorage.getItem('profileId');
    this.customerService.getNotificationList(Number(id)).subscribe({
      next: (res: any) => {
        this.isNotify = false;
        this.notificationList = res?.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
