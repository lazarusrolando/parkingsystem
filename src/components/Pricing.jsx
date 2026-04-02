import React, { useEffect, useState } from 'react';
import './Pricing.css';
import Header from './Header';
import Footer from './Footer';

function Pricing() {
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
          const cards = document.querySelectorAll('.pricing-card');

          sections.forEach(section => observer.observe(section));
          cards.forEach(card => observer.observe(card));

          return () => {
               sections.forEach(section => observer.unobserve(section));
               cards.forEach(card => observer.unobserve(card));
          };
     }, []);

     const [isYearly, setIsYearly] = useState(false);

     const pricing = {
          monthly: {
               basic: "₹0",
               pro: "₹448/month",
               max: "₹898/month"
          },
          yearly: {
               basic: "₹0",
               pro: "₹4,485/year",
               max: "₹8,980/year"
          }
     }

     const togglePricing = () => {
          setIsYearly(!isYearly);
     };

     return (
          <div className="Pricing">
               <Header />
               <main>
                    <section className="pricing-hero-section animate-on-scroll">
                         <div className="container">
                              <div className="pricing-hero-content">
                                   <h2>Membership Pricing</h2>
                                   <p>
                                        Choose the perfect membership plan for your parking needs. Enjoy seamless access to our smart parking system with flexible options tailored for everyone.
                                   </p>
                                   <div className="pricing-toggle">
                                        <button className={`toggle-btn ${!isYearly ? 'active' : ''}`} onClick={togglePricing}>Monthly</button>
                                        <button className={`toggle-btn ${isYearly ? 'active' : ''}`} onClick={togglePricing}>Yearly</button>
                                        <div className="toggle-slider" style={{ transform: `translateX(${isYearly ? '100%' : '0'})` }}></div>
                                   </div>
                              </div>
                         </div>

                         <div className="container">
                              <div className="pricing-grid">
                                   <div className="pricing-card">
                                        <h3>Free</h3>
                                        <div className="price">
                                             <span className="price-text">{isYearly ? pricing.yearly.basic : pricing.monthly.basic}</span>
                                        </div>
                                        <ul>
                                             <li>Limited access to parking spots</li>
                                             <li>Basic booking features</li>
                                             <li>Standard support</li>
                                             <li>Up to 5 bookings per month</li>
                                        </ul>
                                        <button className="btn-pricing">Get Started</button>
                                   </div>
                                   <div className="pricing-card popular">
                                        <h3>Pro</h3>
                                        <div className="price">
                                             <span className="price-text">{isYearly ? pricing.yearly.pro : pricing.monthly.pro}</span>
                                        </div>
                                        <ul>
                                             <li>Half access to parking spots</li>
                                             <li>Advanced booking features</li>
                                             <li>Priority support</li>
                                             <li>Up to 20 bookings per month</li>
                                             <li>Real-time notifications</li>
                                        </ul>
                                        <button className="btn-pricing">Choose Pro</button>
                                   </div>
                                   <div className="pricing-card">
                                        <h3>Max</h3>
                                        <div className="price">
                                             <span className="price-text">{isYearly ? pricing.yearly.max : pricing.monthly.max}</span>
                                        </div>
                                        <ul>
                                             <li>Full access to all parking spots</li>
                                             <li>Premium booking features</li>
                                             <li>24/7 dedicated support</li>
                                             <li>Unlimited bookings</li>
                                             <li>Exclusive discounts</li>
                                             <li>Early access to new features</li>
                                        </ul>
                                        <button className="btn-pricing">Go Max</button>
                                   </div>
                              </div>
                         </div>
                    </section>
               </main>
               <Footer />
          </div>
     );
}

export default Pricing;
