import React, { useEffect } from 'react';
import './FAQ.css';

function FAQ() {
     useEffect(() => {
          const observer = new IntersectionObserver((entries) => {
               entries.forEach(entry => {
                    if (entry.isIntersecting) {
                         entry.target.classList.add('visible');
                    } else {
                         entry.target.classList.remove('visible');
                    }
               });
          }, { threshold: 0.1 });

          const sections = document.querySelectorAll('section');
          const faqItems = document.querySelectorAll('.faq-item');

          sections.forEach(section => observer.observe(section));
          faqItems.forEach(item => observer.observe(item));

          return () => {
               sections.forEach(section => observer.unobserve(section));
               faqItems.forEach(item => observer.unobserve(item));
          };
     }, []);

     return (
          <div className="FAQ">
               <main>
                    <section className="faq-hero-section animate-on-scroll">
                         <div className="container">
                              <div className="faq-hero-content">
                                   <h1>Frequently Asked Questions</h1>
                                   <p>
                                        Find answers to common questions about our Smart Parking System. We're here to help you park with ease!
                                   </p>
                              </div>
                         </div>
                    
                         <div className="container">
                              <div className="faq-grid">
                                   <div className="faq-item">
                                        <h3>How do I book a parking spot?</h3>
                                        <p>Simply log in to your account, search for available spots in your desired location and time, and click "Reserve" to confirm your booking. It's quick and easy!</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>What payment methods do you accept?</h3>
                                        <p>We accept major credit cards, debit cards, and digital wallets like PayPal and Apple Pay for secure and convenient payments.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>Can I cancel my booking?</h3>
                                        <p>Yes, you can cancel your booking up to 30 minutes before the start time through your account dashboard. Cancellations after that may incur a small fee.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>Is my vehicle safe in your parking lots?</h3>
                                        <p>Absolutely! Our parking facilities are equipped with 24/7 surveillance, secure gates, and well-lit areas to ensure your vehicle's safety at all times.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>What is VIN search?</h3>
                                        <p>VIN search allows you to find your parked vehicle quickly by entering your Vehicle Identification Number (VIN) in our app or website.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>How do I check real-time availability?</h3>
                                        <p>Use our app or website to view live updates on parking spot availability. You can filter by location, time, and spot type for the best options.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>Which locations do you support?</h3>
                                        <p>We currently support parking in major cities across the country, including downtown areas, airports, and shopping centers. Check our app for the full list.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>How do I create an account?</h3>
                                        <p>Click "Sign Up" on our website or app, enter your email and password, and verify your account. It's free and takes just a minute!</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>How can I contact customer support?</h3>
                                        <p>Reach out to us via the "Contact Us" page on our website, email support@smartparking.com, or call our 24/7 hotline at 1-800-PARK-NOW.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>What are the parking rules?</h3>
                                        <p>Park only in designated spots, obey time limits, and follow all posted signs. Vehicles must be legally parked and not blocking access. Violations may result in fines.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>Do you offer discounts for frequent users?</h3>
                                        <p>Yes! Our loyalty program rewards frequent parkers with discounts and priority booking. Sign up and start earning points with every reservation.</p>
                                   </div>
                                   <div className="faq-item">
                                        <h3>What if I arrive late for my booking?</h3>
                                        <p>If you're running late, contact us immediately. We hold your spot for up to 15 minutes past the start time, after which it may be released.</p>
                                   </div>
                              </div>
                         </div>
                    </section>
               </main>
          </div>
     );
}

export default FAQ;
