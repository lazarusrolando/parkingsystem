import React, { useEffect } from 'react';
import './Features.css';
import Header from './Header';
import Footer from './Footer';

function Features() {
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
          const cards = document.querySelectorAll('.feature-card');

          sections.forEach(section => observer.observe(section));
          cards.forEach(card => observer.observe(card));

          return () => {
               sections.forEach(section => observer.unobserve(section));
               cards.forEach(card => observer.unobserve(card));
          };
     }, []);

     return (
          <div className="Features">
               <Header />
               <main>
                    <section className="features-hero-section animate-on-scroll">
                         <div className="container">
                              <div className="features-hero-content">
                                   <h1>Key Features</h1>
                                   <p>
                                        Discover the powerful features that make our Smart Parking System the ultimate solution for effortless parking.
                                   </p>
                              </div>
                         </div>

                         <div className="container">
                              <div className="features-grid">
                                   <div className="feature-card">
                                        <h3>Real-Time Availability</h3>
                                        <p>
                                             Check parking spot availability in real-time and reserve your spot instantly.
                                        </p>
                                   </div>
                                   <div className="feature-card">
                                        <h3>Easy Booking</h3>
                                        <p>
                                             Book your parking spot with just a few clicks using our user-friendly interface.
                                        </p>
                                   </div>
                                   <div className="feature-card">
                                        <h3>Secure Payments</h3>
                                        <p>
                                             Pay securely through our integrated payment system with multiple options.
                                        </p>
                                   </div>
                                   <div className="feature-card">
                                        <h3>Smart Notifications</h3>
                                        <p>
                                             Receive instant notifications about your booking status and parking availability.
                                        </p>
                                   </div>
                                   <div className="feature-card">
                                        <h3>Multi-Location Support</h3>
                                        <p>
                                             Access parking spots across multiple cities and locations with our expansive network.
                                        </p>
                                   </div>
                                   <div className="feature-card">
                                        <h3>24/7 Support</h3>
                                        <p>
                                             Get round-the-clock customer support to assist with any queries or issues.
                                        </p>
                                   </div>
                              </div>
                         </div>
                    </section>
               </main>
               <Footer />
          </div>
     );
}

export default Features;
