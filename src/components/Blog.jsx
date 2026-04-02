import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Blog.css";

const Blog = () => {

  const tags = [
    "SmartParking",
    "HTML",
    "CSS",
    "JS",
    "ReactJS",
    "Python",
    "SQLite",
    "IoT"
  ];

  useEffect(() => {
    const counters = document.querySelectorAll(".counter");

    counters.forEach(counter => {
      const target = +counter.dataset.target;
      let count = 0;
      const increment = target / 80;

      const updateCount = () => {
        count += increment;
        if (count < target) {
          counter.innerText = Math.ceil(count);
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target;
        }
      };

      updateCount();
    });
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".animate");

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="site-cover site-cover-sm">
        <div className="blog-container text-center">
          <h1>How Smart Parking Systems Are Revolutionizing Urban Mobility</h1>
          <p className="post-meta">
            By Smart Parking Team · 2025 · 8 min read
          </p>
        </div>
      </section>

      <section className="site-section">
        <div className="blog-container">
          <div className="row">

            <div className="col-lg-8 single-content">
              <h2>The Parking Problem in Modern Cities</h2>
              <p>
                Rapid urbanization has increased vehicle density, leading to
                congestion, fuel wastage, and frustration while searching for parking.
              </p>

              <h2>How Smart Parking Systems Work</h2>
              <ul className="sps-work">
                <li>IoT sensors detect slot availability</li>
                <li>Real-time data updates</li>
                <li>Mobile and web access</li>
                <li>Digital booking and payments</li>
              </ul>

              <blockquote>
                “Smart Parking is about reshaping how cities move.”
              </blockquote>

              <h2>Technology Stack</h2>
              <ul className="ts">
                <li>Frontend: HTML, CSS, ReactJS</li>
                <li>Backend: Python</li>
                <li>Database: SQLite</li>
              </ul>

              <div className="post-footer">
                Categories:
                <Link to="/categories/smart-cities"> Smart Cities</Link>,
                <Link to="/categories/iot"> IoT</Link>,
                <Link to="/categories/automation"> Automation</Link>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="col-lg-4">
              <div className="sidebar-box">
                <h3>About</h3>
                <p>
                  Smart Parking System optimizes parking usage using real-time data
                  and automation.
                </p>
              </div>

              <div className="sidebar-box">
                <h3>Tags</h3>
                <div className="tagcloud">
                  {tags.map((tags, index) => (
                    <button key={index}>#{tags}</button>
                  )
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="site-section sps-count">
        <div className="container">
          <div className="row text-white text-center">
            <div className="col-md-3 animate">
              <h2 className="counter" data-target="40">0</h2>
              <p>Time Saved (%)</p>
            </div>
            <div className="col-md-3 animate">
              <h2 className="counter" data-target="30">0</h2>
              <p>Traffic Reduced (%)</p>
            </div>
            <div className="col-md-3 animate">
              <h2 className="counter" data-target="24">0</h2>
              <p>Live Monitoring</p>
            </div>
            <div className="col-md-3 animate">
              <h2 className="counter" data-target="100">0</h2>
              <p>Automation</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Blog;
