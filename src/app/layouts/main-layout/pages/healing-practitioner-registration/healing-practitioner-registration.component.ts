import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommunityService } from 'src/app/@shared/services/community.service';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { TokenStorageService } from 'src/app/@shared/services/token-storage.service';

@Component({
  selector: 'app-healing-practitioner-registration',
  templateUrl: './healing-practitioner-registration.component.html',
  styleUrls: ['./healing-practitioner-registration.component.scss'],
})
export class HealingPractitionerRegistrationComponent implements OnInit {
  profileId: number;

  allCountryData: any;
  selectedCountry = 'US';
  allStateData: any;
  selectedState = '';

  isCountryChecked: boolean = true;
  isWorldwideChecked: boolean = false;

  selectPractitionerPage: boolean;

  practitionerArea: any = [];
  selectedAreaValues: number[] = [];

  selectedCards: any[] = [];
  cards: any[] = [];

  isFromHome = false;

  constructor(
    private seoService: SeoService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private tokenStorage: TokenStorageService,
    private toastService: ToastService,
    private communityService: CommunityService,
  ) {
    const queryParams = this.route.snapshot.queryParams;
    const newParams = { ...queryParams };
    // console.log(this.router.routerState.snapshot.url);
    this.selectPractitionerPage = this.router.routerState.snapshot.url.includes('request-video-call') || false;
    this.isFromHome = this.router.routerState.snapshot.url.includes('request-video-call') || false;
    // console.log(this.selectPractitionerPage)
    // this.channelId = this.shareService?.channelData?.id;
    // this.route.queryParams.subscribe((params: any) => {
    //   console.log(params.channelId);
    if (newParams['token']) {
      const token = newParams['token'];
      this.tokenStorage.saveToken(token)
      delete newParams['token']
      const navigationExtras: NavigationExtras = {
        queryParams: newParams
      };
      this.router.navigate([], navigationExtras);
    }

    this.profileId = Number(localStorage.getItem('profileId'));
    const data = {
      title: 'TherapistTube Registration',
      url: `${window.location.href}`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
  }

  ngOnInit(): void {
    this.getAllCountries();
    this.getCategories();
  }

  updateCheckbox(selectedOption: 'country' | 'worldwide') {
    if (selectedOption === 'country' && this.isWorldwideChecked) {
      this.isWorldwideChecked = false;
    } else if (selectedOption === 'worldwide' && this.isCountryChecked) {
      this.selectedCountry = '';
      this.selectedState = '';
      this.allStateData = null
      this.isCountryChecked = false;
    }
  }

  getAllCountries() {
    this.spinner.show();
    this.customerService.getCountriesData().subscribe({
      next: (result) => {
        this.spinner.hide();
        this.allCountryData = result;
        this.getAllState();
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  getAllState() {
    this.spinner.show();
    const selectCountry = this.selectedCountry;
    this.customerService.getStateData(selectCountry).subscribe({
      next: (result) => {
        this.spinner.hide();
        this.allStateData = result;
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }
  isSelected(id: number): boolean {
    return this.selectedCards.includes(id);
  }

  selectCard(cardId: string): void {
    const index = this.selectedCards.indexOf(cardId);
    if (index === -1) {
      this.selectedCards.push(cardId);
    } else {
      this.selectedCards = this.selectedCards.filter(id => id !== cardId);
    }
  }

  changeCountry() {
    if (this.isCountryChecked) {
      this.getAllState();
    }
  }

  backPreview() {
    this.selectPractitionerPage = !this.selectPractitionerPage;
  }

  nextPageSearch() {
    if (this.selectedCards.length > 0) {
      const practitionerRequirements = {
        selectedCard: this.selectedCards,
        // selectedCountry: this.selectedCountry,
        // selectedState: this.selectedState,
        selectedAreas: this.selectedAreaValues
      };
      this.router.navigate(['/therapists'], { state: { data: practitionerRequirements } });
    } else if (this.isWorldwideChecked && this.selectedCards.length <= 0) {
      const areaValues = { selectedAreas: this.selectedAreaValues } 
      this.router.navigate(['/therapists'], { state: { data: areaValues } });
    }
    else {
      this.toastService.danger('Please select therapist are you looking for!');
    }
  }

  getCategories() {
    this.communityService.getCategories().subscribe({
      next: (res) => {
        this.practitionerArea = res.area;
        this.cards = res.emphasis;
        console.log(this.cards);
      },
      error: (error) => {
        this.spinner.hide();
        console.log(error);
      },
    });
  }

  onAreaboxChange(event: any, area: any): void {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selectedAreaValues.push(area.aId);
    } else {
      this.selectedAreaValues = this.selectedAreaValues.filter(
        (id) => id !== area.aId
      );
    }
  }
}
