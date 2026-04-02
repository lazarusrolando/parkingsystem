import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom';
import search from '../search.json';
import Header from './Header'
import './Hero.css'
import FAQ from './FAQ'
import Footer from './Footer'

function Hero() {
     const [searchResults, setSearchResults] = useState([]);
     const [showAuth, setShowAuth] = useState(false);
     const [displayedText, setDisplayedText] = useState('');
     const canvasRef = useRef(null);

     // 1. Search Logic
     const handleSearch = (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const vin = formData.get('vin').toUpperCase();
          const option = formData.get('option');
          let results = search.vehicles.filter(vehicle => vehicle.vin.includes(vin));
          if (option === 'parking') {
               results = results.filter(vehicle => vehicle.parkingStatus === 'Available');
          }
          setSearchResults(results);
     };

     // 2. Intersection Observer for Scroll Animations
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

     // 3. Typing Effect Animation
     useEffect(() => {
          const fullText = 'Smart Parking System';
          let index = 0;
          const timer = setInterval(() => {
               setDisplayedText(fullText.slice(0, index + 1));
               index++;
               if (index >= fullText.length) clearInterval(timer);
          }, 100);
          return () => clearInterval(timer);
     }, []);

     // 4. Background Particle Animation
     useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          let particles = [];
          let animationFrameId;

          const resize = () => {
               canvas.width = window.innerWidth;
               canvas.height = window.innerHeight;
          };

          class Particle {
               constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 2;
                    this.speedX = (Math.random() - 0.5) * 0.5;
                    this.speedY = (Math.random() - 0.5) * 0.5;
               }
               update() {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
               }
               draw() {
                    ctx.fillStyle = '#00e5ff';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
               }
          }

          const init = () => {
               resize();
               particles = Array.from({ length: 50 }, () => new Particle());
          };

          const animate = () => {
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               particles.forEach(p => {
                    p.update();
                    p.draw();
               });
               animationFrameId = requestAnimationFrame(animate);
          };

          window.addEventListener('resize', resize);
          init();
          animate();

          return () => {
               window.removeEventListener('resize', resize);
               cancelAnimationFrame(animationFrameId);
          };
     }, []);

     return (
          <div className="Hero" style={{
               background: 'linear-gradient(120deg, #0f2027, #203a43, #2c5364)',
               minHeight: '100vh',
               position: 'relative'
          }}>
               <div style={{
                    content: "''",
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7))',
                    pointerEvents: 'none',
                    zIndex: 1
               }} />

               <Header />



               <main className="relative" style={{ zIndex: 2 }}>
                    <canvas
                         ref={canvasRef}
                         className="fixed pointer-events-none opacity-40"
                         style={{ zIndex: 0 }}
                    />

                    <section className="hero-section animate-on-scroll">
                         <div className="container">
                              <div className="hero-content">
                                   <div className="hero-text">
                                        <h1>{displayedText}<span className="cursor">|</span></h1>
                                        <p>
                                             Revolutionize your parking experience with our intelligent system.
                                             Find, reserve, and pay for parking spots effortlessly.
                                        </p>
                                        <div className="flex gap-4">
                                             <Link to="/booking">
                                                  <button className="btn-primary">Book Parking</button>
                                             </Link>
                                             <Link to='/About'>
                                                  <button className="btn-secondary">Learn More</button>
                                             </Link>
                                        </div>
                                   </div>
                                   <div className="hero-image">
                                        <img src="/parking-slot.png" alt="Parking Slot" />
                                        <hr className='liner' />
                                   </div>
                              </div>
                         </div>
                    </section>

                    <section id="booking" className="vehicle-search-section">
                         <div className="container">
                              <h2>Everything for your car</h2>
                              <p>Begin your journey with Parks and say goodbye to all your car worries, one service at a time.</p>
                              <form className="search-form" onSubmit={handleSearch}>
                                   <input type="text" name="vin" placeholder="VIN" required />
                                   <select name="option" required>
                                        <option value="">Option</option>
                                        <option value="parking">Parking</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="services">Services</option>
                                   </select>
                                   <button type="submit" className="btn-secondary">Submit</button>
                              </form>

                              {searchResults.length > 0 && (
                                   <div className="search-results">
                                        <h3>Search Results</h3>
                                        <ul>
                                             {searchResults.map((vehicle, index) => (
                                                  <li key={index}>
                                                       {vehicle.make} {vehicle.model} ({vehicle.year}) - Plate: {vehicle.plate} - {vehicle.parkingStatus} at {vehicle.location}
                                                  </li>
                                             ))}
                                        </ul>
                                   </div>
                              )}
                         </div>
                    </section>

                    <section className="testimonials-section animate-on-scroll">
                         <div className="container">
                              <h2>What Our Users Say</h2>
                              <div className="testimonials-grid">
                                   <div className="testimonial-card">
                                        <p>"This parking system has made my life so much easier!"</p>
                                        <span>- John Doe</span>
                                   </div>
                                   <div className="testimonial-card">
                                        <p>"Quick and reliable service. Highly recommend!"</p>
                                        <span>- Jane Smith</span>
                                   </div>
                                   <div className="testimonial-card">
                                        <p>"Love the real-time availability feature."</p>
                                        <span>- Mike Johnson</span>
                                   </div>
                              </div>
                         </div>
                    </section>

                    <section className="cta-section animate-on-scroll">
                         <div className="container">
                              <div className="cta-content">
                                   <h2>Ready to Experience Smart Parking?</h2>
                                   <p>Join thousands of satisfied users and simplify your parking today.</p>
                                   <Link to="/Auth">
                                        <button className="btn-primary">Get Started</button>
                                   </Link>
                              </div>
                         </div>
                    </section>
               </main>

               <div className="relative" style={{ zIndex: 2 }}>
                    <FAQ />
                    <Footer />
               </div>
          </div>
     )
}

export default Hero;
