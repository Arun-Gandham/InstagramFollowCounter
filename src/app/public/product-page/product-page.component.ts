import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MechanicalCounterComponent } from '../../shared/components/mechanical-counter/mechanical-counter.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../shared/components/site-header/site-header.component';

export interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SiteHeaderComponent,
    SiteFooterComponent,
    MechanicalCounterComponent
  ],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css']
})
export class ProductPageComponent {
  @ViewChild('heroCounter') heroCounter?: MechanicalCounterComponent;
  @ViewChild('interactiveCounter') interactiveCounter?: MechanicalCounterComponent;

  selectedDigitCount: 5 | 7 = 5;
  interactiveCount = 4289;
  hasVirtualFollowed = false;

  // Inquiry Form State
  inquiryName = '';
  inquiryEmail = '';
  inquiryHandle = '';
  inquiryModel: '5' | '7' = '5';
  inquiryVenue = 'Cafe & Dining';
  inquiryNotes = '';
  isSubmittingInquiry = false;
  inquirySubmitted = false;

  // FAQ Accordion State
  openFaqIndex: number | null = 0;

  readonly FAQ_ITEMS: FaqItem[] = [
    {
      question: 'How does the physical counter connect to my Instagram account?',
      answer:
        'The device connects over standard 2.4 GHz Wi-Fi to our cloud gateway. You authenticate your Instagram account securely through official Meta OAuth in your web browser. The counter never handles or stores your password.'
    },
    {
      question: 'Which Instagram account types are supported?',
      answer:
        'Meta Graph API requires an Instagram Professional account (either Creator or Business). Switching from a personal account is free, takes 30 seconds in the Instagram app (Settings → Account type → Switch to professional), and unlocks real-time follower count access.'
    },
    {
      question: 'How quickly does the counter update when someone follows?',
      answer:
        'The counter synchronizes with Meta’s Graph API on a continuous, jittered 30 to 60-second cycle. When a follower is detected, the stepper motors immediately rotate only the changed digit flaps with an audible, satisfying mechanical click.'
    },
    {
      question: 'What happens if my venue Wi-Fi network disconnects?',
      answer:
        'The mechanical flaps remain stationary at their last known follower count without resetting or losing state. As soon as Wi-Fi reconnects, the device automatically pulls the latest count and smoothly rotates forward to the updated number.'
    },
    {
      question: 'What is the difference between the 5-digit and 7-digit models?',
      answer:
        'The 5-digit model (FC-05M) measures 42 cm wide and displays up to 99,999 followers—ideal for neighborhood cafés, independent boutiques, and growing creators. The 7-digit model (FC-07M) measures 56 cm wide and displays up to 9,999,999 followers—ideal for flagship retail stores, agencies, and large audiences.'
    },
    {
      question: 'Does the counter require an active computer or phone nearby?',
      answer:
        'No. Once configured via your phone or laptop during initial setup, the counter operates completely autonomously. It only requires a standard 5V USB-C power connection and a Wi-Fi signal.'
    },
    {
      question: 'How is the counter powered?',
      answer:
        'The counter features a standard 5V USB-C port and consumes less than 2.5W during operation. It can be powered by any standard USB-C wall charger or even a portable 5V USB power bank for outdoor pop-ups and trade shows.'
    },
    {
      question: 'Can I reconfigure the counter for a different Instagram account later?',
      answer:
        'Yes. You can unbind, transfer, or switch your linked Instagram account anytime from your customer dashboard with a single click.'
    }
  ];

  onDigitCountChanged(count: 5 | 7): void {
    this.selectedDigitCount = count;
  }

  simulateVirtualFollow(): void {
    this.interactiveCount++;
    this.hasVirtualFollowed = true;
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  scrollToSection(sectionId: string): void {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  submitInquiry(): void {
    if (!this.inquiryEmail || !this.inquiryName) return;

    this.isSubmittingInquiry = true;
    setTimeout(() => {
      this.isSubmittingInquiry = false;
      this.inquirySubmitted = true;
    }, 800);
  }

  resetInquiryForm(): void {
    this.inquirySubmitted = false;
    this.inquiryName = '';
    this.inquiryEmail = '';
    this.inquiryHandle = '';
    this.inquiryNotes = '';
  }
}
