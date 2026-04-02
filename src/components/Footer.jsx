import logo from '../sps.png'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import './Footer.css'

function Footer() {
     return (
          <div>
               <footer className="footer">
                    <div className="footer-container">
                         <div className="footer-section footer-brand">
                              <img src={logo} className='sps' alt="Smart Parking System Logo" />
                              <h2>Smart Parking System</h2>
                              <p>Your Parking Solution</p>
                              <div className="social-icons">
                                   <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><span className="social-icon"><FaFacebook /></span></a>
                                   <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><span className="social-icon"><FaTwitter /></span></a>
                                   <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><span className="social-icon"><FaInstagram /></span></a>
                                   <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><span className="social-icon"><FaYoutube /></span></a>
                              </div>
                         </div>

                         <div className="footer-section">
                              <h3>Quick Links</h3>
                              <ul className="footer-list">
                                   <li><a href="/contact" className="footer-link">Contact Us</a></li>
                                   <li><a href="/blog" className="footer-link">Blogs</a></li>
                              </ul>
                         </div>

                         <div className="footer-section">
                              <h3>Products</h3>
                              <ul className="footer-list">
                                   <li><a href="/parking" className="footer-link">Parking Solutions</a></li>
                                   <li><a href="/fuel" className="footer-link">Fuel Price</a></li>
                                   <li><a href="/search" className="footer-link">Vehicle Search</a></li>
                                   <li><a href="/loans" className="footer-link">Loans</a></li>
                              </ul>
                         </div>

                         <div className="footer-section">
                              <h3>Reach Us</h3>
                              <p>support@smartpark.com</p>
                              <p>sales@smartpark.com</p>
                              <p>Chennai, India</p>
                         </div>

                    </div>
               </footer>
               <footer>
                    <div className='footer-container last-footer' style={{display: "flex", justifyContent: "center", alignItems: "center", textAlign: "center"}}>
                         <p>&copy; 2025 - 2026 Lazarus Rolando</p>
                    </div>
               </footer>
          </div>
     )
}

export default Footer;
