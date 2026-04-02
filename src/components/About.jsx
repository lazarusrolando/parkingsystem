import React, { useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import './About.css';
import './Header.css'

export default function About() {
     const team = {
          members: [
               {
                    initial: "R",
                    username: "Lazarus Rolando",
                    role: "Founder",
               }
          ]
     }

     const heroRef = useRef(null);
     const missionRef = useRef(null);
     const teamRef = useRef(null);

     useEffect(() => {
          const observer = new IntersectionObserver(
               (entries) => {
                    entries.forEach((entry) => {
                         if (entry.isIntersecting) {
                              entry.target.classList.add('visible');
                         }
                    });
               },
               { threshold: 0.1 }
          );

          const heroElement = heroRef.current;
          const missionElement = missionRef.current;
          const teamElement = teamRef.current;

          if (heroElement) observer.observe(heroElement);
          if (missionElement) observer.observe(missionElement);
          if (teamElement) observer.observe(teamElement);

          return () => {
               if (heroElement) observer.unobserve(heroElement);
               if (missionElement) observer.unobserve(missionElement);
               if (teamElement) observer.unobserve(teamElement);
          };
     }, []);

     return (
          <div className="About">
               <Header />
               <main>
                    <section className="about-hero-section animate-on-scroll" ref={heroRef}>
                         <div className="about-hero-content">
                              <h1>
                                   About Smart Parking System
                              </h1>
                              <p>
                                   Revolutionize your parking experience with our intelligent system. Find, reserve, and pay for parking spots effortlessly.
                              </p>
                              <div className="hero-buttons">
                                   <a
                                        href="/booking"
                                        className="btn-primary"
                                   >
                                        Book a Spot
                                   </a>
                                   <a
                                        href="/features"
                                        className="btn-secondary"
                                   >
                                        Explore Features
                                   </a>
                              </div>
                         </div>
                    </section>

                    <section className="mission-section animate-on-scroll" ref={missionRef}>
                         <div className="container">
                              <div className="mission-vision-text">
                                   <div className="mission-box">
                                        <h2>Our Mission</h2>
                                        <p>
                                             To reduce time wasted searching for parking, lower city
                                             congestion and emissions, and deliver a predictable, secure
                                             parking experience for drivers and operators alike.
                                        </p>
                                   </div>

                                   <div className="vision-box">
                                        <h2>Our Vision</h2>
                                        <p>
                                             A future where intelligent parking systems create safer, more
                                             efficient cities — where finding a parking space is seamless,
                                             fair, and friction-free.
                                        </p>
                                   </div>
                              </div>
                         </div>
                    </section>

<section className="team-section animate-on-scroll" ref={teamRef}>
                         <div className="container">
                              <h2>Meet the Team</h2>
                              <p>A small, focused team building smarter city mobility tools.</p>

                              <div className="team-grid">
                                   {team.members.map((member, index) => (
                                        <div key={index} className="team-card">
                                             <div>{member.initial}</div>
                                             <h4>{member.username}</h4>
                                             <div>{member.role}</div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </section>
               </main>

               <Footer />
          </div>
     );
}
