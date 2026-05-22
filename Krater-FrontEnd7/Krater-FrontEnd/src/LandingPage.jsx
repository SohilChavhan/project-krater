import React, { useEffect, useRef, useState } from 'react';
import './style.css';
import { translations } from './i18n.jsx';

export default function LandingPage({ onGetStarted, user, userRole, onSignOut, onAddAccount, onSwitchAccount, onGoDashboard }) {
    const canvasRef = useRef(null);
    const userMenuRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const handleClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    
    
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
        let width, height;
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            gl.viewport(0, 0, width, height);
        }
        window.addEventListener('resize', resize);
        resize();

        function compileShader(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }
        function createProgram(vs, fs) {
            const p = gl.createProgram();
            gl.attachShader(p, compileShader(gl.VERTEX_SHADER, vs));
            gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fs));
            gl.linkProgram(p);
            return p;
        }

        const vertSrc = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0,1);}`;
        const fragSrc = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_touches[5];
      uniform float u_touchAges[5];
      uniform int u_touchCount;
      vec3 turquoise = vec3(0.078, 0.722, 0.651);
      vec3 cyan = vec3(0.024, 0.714, 0.831);
      vec3 tealLight = vec3(0.369, 0.918, 0.831);
      vec3 mint = vec3(0.8, 0.98, 0.95);
      vec3 white = vec3(1.0, 1.0, 1.0);
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i), b = hash(i + vec2(1,0)), c = hash(i + vec2(0,1)), d = hash(i + vec2(1,1));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      float fbm(vec2 p){
        float v = 0.0, a = 0.5;
        for(int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.12;
        vec2 q = vec2(fbm(uv * 2.5 + t * 0.2), fbm(uv * 2.5 + vec2(5.2, 1.3) + t * 0.15));
        float f = fbm(uv * 2.5 + 3.0 * q);
        
        vec3 col = mix(white, mint, f * 0.85); 
        col = mix(col, vec3(0.85, 0.97, 0.95), length(q) * 0.5);
        
        for(int i = 0; i < 5; i++){
          if(i >= u_touchCount) break;
          vec2 tp = u_touches[i] / u_resolution;
          tp.y = 1.0 - tp.y;
          float age = u_touchAges[i];
          float fade = max(0.0, 1.0 - age * 0.3);
          float d = length(uv - tp);
          float ringRadius = age * 0.15;
          float ring = exp(-pow((d - ringRadius) * 12.0, 2.0)) * fade;
          float glow = exp(-d * 3.5) * fade;
          vec2 dir = normalize(uv - tp + 0.001);
          vec2 distUv = uv + dir * glow * 0.08;
          float df = fbm(distUv * 3.0 + t + float(i) * 1.5);
          
          vec3 splash = mix(turquoise, cyan, df * 1.2);
          splash = mix(splash, tealLight, ring);
          col = mix(col, splash, glow * 0.9 + ring * 0.8);
          col = mix(col, tealLight, ring * 0.5);
        }
        
        float vig = 1.0 - length((uv - 0.5) * 0.8) * 0.35;
        col *= vig;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

        const program = createProgram(vertSrc, fragSrc);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(program, 'u_time');
        const uRes = gl.getUniformLocation(program, 'u_resolution');
        const uTouches = gl.getUniformLocation(program, 'u_touches');
        const uTouchAges = gl.getUniformLocation(program, 'u_touchAges');
        const uTouchCount = gl.getUniformLocation(program, 'u_touchCount');

        let animationId;
        function render(t) {
            const now = t * 0.001;
            gl.useProgram(program);
            gl.uniform1f(uTime, now);
            gl.uniform2f(uRes, width, height);
            gl.uniform1i(uTouchCount, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animationId = requestAnimationFrame(render);
        }
        animationId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    
    
    
    useEffect(() => {
        const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, observerOptions);

        document.querySelectorAll('.about-card, .step-card, .feature-item').forEach((el, i) => {
            el.style.transitionDelay = `${i * 0.1}s`;
            observer.observe(el);
        });

        let statAnimated = false;
        const statNumbers = document.querySelectorAll('.stat-number');

        function animateStats() {
            if (statAnimated) return;
            statAnimated = true;
            statNumbers.forEach(num => {
                const target = parseInt(num.dataset.target);
                const duration = 2000;
                const start = Date.now();
                function tick() {
                    const elapsed = Date.now() - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    num.textContent = Math.floor(eased * target).toLocaleString();
                    if (progress < 1) requestAnimationFrame(tick);
                }
                tick();
            });
        }

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) animateStats();
            });
        }, { threshold: 0.5 });

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) statsObserver.observe(heroStats);

        return () => {
            observer.disconnect();
            statsObserver.disconnect();
        };
    }, []);

    
    
    
    useEffect(() => {
        const dict = translations[currentLang] || translations['en'];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.innerHTML = dict[key];
            }
        });
    }, [currentLang]);

    
    
    
    return (
        <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: 'transparent', fontFamily: '"Outfit", sans-serif' }}>
            <canvas ref={canvasRef} id="fluid-canvas" style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}></canvas>

            <header id="site-header">
                <div className="header-left">
                    <img src="/logo.png" alt="Krater Logo" className="header-logo" id="header-logo" />
                </div>
                <div className="header-right">
                    <select
                        id="language-select"
                        className="lang-select"
                        value={currentLang}
                        onChange={(e) => setCurrentLang(e.target.value)}
                    >
                        <option value="en">English</option>
                        <option value="hi">Hindi (भारत)</option>
                        <option value="bn">Bengali (বাংলাদেশ)</option>
                        <option value="mr">मराठी (Marathi)</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="te">తెలుగు (Telugu)</option>
                        <option value="raj">राजस्थानी (Rajasthani)</option>
                        <option value="or">ଓଡ଼ିଆ (Odia)</option>
                        <option value="bho">भोजपुरी (Bhojpuri)</option>
                        <option value="dz">Dzongkha (འབྲུག་ཡུལ)</option>
                        <option value="my">Burmese (မြန်မာ)</option>
                        <option value="ne">Nepali (नेपाल)</option>
                        <option value="si">Sinhala (ශ්‍රී ලංකා)</option>
                        <option value="th">Thai (ประเทศไทย)</option>
                    </select>

                    {user ? (
                        <div ref={userMenuRef} style={{ position: 'relative' }}>
                            <button className="landing-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </button>
                            {showUserMenu && (
                                <div className="landing-user-dropdown">
                                    <div className="landing-dropdown-header">
                                        <div className="landing-dropdown-welcome">Welcome,</div>
                                        <div className="landing-dropdown-name">{user.displayName || 'User'}!</div>
                                    </div>
                                    <div className="landing-dropdown-item" onClick={() => { setShowUserMenu(false); onGoDashboard(); }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                        {userRole === 'citizen' ? 'Chatbox' : 'Dashboard'}
                                    </div>
                                    <div className="landing-dropdown-item" onClick={() => { setShowUserMenu(false); onAddAccount(); }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                                        Add another account
                                    </div>
                                    <div className="landing-dropdown-item" onClick={() => { setShowUserMenu(false); onSwitchAccount(); }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
                                        Switch Accounts
                                    </div>
                                    <div className="landing-dropdown-item signout" onClick={onSignOut}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                                        Sign Out
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button id="report-query-btn" className="btn-report" onClick={onGetStarted}>
                            <span className="btn-report-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
                            </span>
                            <span className="btn-report-text" data-i18n="btn_report">Report</span>
                        </button>
                    )}
                </div>
            </header>

            <div id="sidebar-overlay" className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
            <nav id="sidebar" className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Krater" className="sidebar-logo" />
                    <button id="sidebar-close" className="sidebar-close" aria-label="Close menu" onClick={() => setIsSidebarOpen(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>
                <ul className="sidebar-nav-list">
                    <li><a href="#hero" className="sidebar-link active" onClick={() => setIsSidebarOpen(false)}><span className="nav-label" data-i18n="nav_home">Home</span><span className="nav-index">(01)</span></a></li>
                    <li><a href="#about" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}><span className="nav-label" data-i18n="nav_about">About</span><span className="nav-index">(02)</span></a></li>
                    <li><a href="#how-it-works" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}><span className="nav-label" data-i18n="nav_how_it_works">How It Works</span><span className="nav-index">(03)</span></a></li>
                    <li><a href="#features" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}><span className="nav-label" data-i18n="nav_features">Features</span><span className="nav-index">(04)</span></a></li>
                    <li><a href="#footer" className="sidebar-link" onClick={() => setIsSidebarOpen(false)}><span className="nav-label" data-i18n="nav_contact">Contact</span><span className="nav-index">(05)</span></a></li>
                </ul>
                <div className="sidebar-footer">
                    <a href="#footer" className="btn-sidebar-cta" data-i18n="btn_lets_talk" onClick={() => setIsSidebarOpen(false)}>Let's Talk</a>
                </div>
            </nav>

            <button id="hamburger-btn" className={`hamburger-btn ${isSidebarOpen ? 'active' : ''}`} aria-label="Open menu" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            <main>
                {/* HERO SECTION */}
                <section id="hero" className="section hero-section" style={{ paddingTop: '120px', paddingBottom: '80px', overflow: 'hidden' }}>

                    {/* 🟢 THE WIDER FLEX CONTAINER: Expanded to 1400px and using % padding to push to the edges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px', maxWidth: '2000px', margin: '0 auto', padding: '0 4%', flexWrap: 'wrap' }}>

                        {/* 🔴 LEFT COLUMN: Text anchored to the left (Takes up 45% of the space) */}
                        <div style={{ flex: '1 1 45%', maxWidth: '650px', minWidth: '350px' }}>
                            <div className="hero-badge">
                                <span className="badge-dot"></span>
                                <span data-i18n="hero_badge">Pothole Reporting Platform</span>
                            </div>
                            <h1 className="hero-title">
                                <span data-i18n="hero_title_1">Smooth Roads</span><br />
                                <span data-i18n="hero_title_2">Start With</span><br />
                                <span className="hero-title-accent" data-i18n="hero_title_accent">Your Voice</span>
                            </h1>
                            <p className="hero-description" data-i18n="hero_desc">
                                Report potholes in seconds. Track repairs in real-time. Together, we build safer streets for everyone.
                            </p>
                            <div className="hero-actions">
                                <button className="btn-primary" id="btn-get-started" onClick={onGetStarted} data-i18n="btn_get_started" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                                    Get Started
                                </button>
                                <a href="#about" className="btn-secondary" id="btn-learn-more" data-i18n="btn_learn_more">
                                    Learn More
                                </a>
                            </div>
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <span className="stat-number" data-target="12500">0</span>
                                    <span className="stat-label" data-i18n="stat_reported">Potholes Reported</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number" data-target="8700">0</span>
                                    <span className="stat-label" data-i18n="stat_resolved">Issues Resolved</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number" data-target="150">0</span>
                                    <span className="stat-label" data-i18n="stat_cities">Cities Covered</span>
                                </div>
                            </div>
                        </div>

                        {/* 🔵 RIGHT COLUMN: Image pushed hard to the right (Takes up 50% of the space) */}
                        <div style={{ flex: '1 1 50%', display: 'flex', justifyContent: 'flex-end', position: 'relative', minWidth: '400px' }}>

                            {/* Made the image significantly larger and scaled it slightly from the right edge */}
                            <img
                                src="/app-screenshot.png"
                                alt="AI Image Analysis"
                                style={{
                                    width: '100%',
                                    maxWidth: '1200px', /* Increased from 600px to 850px! */
                                    borderRadius: '16px',
                                    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4)',
                                    border: '1px solid #e2e8f0',
                                    transform: 'scale(1.05)', /* Gives it a slight pop */
                                    transformOrigin: 'right center' /* Ensures it scales towards the right, not the middle */
                                }}
                            />

                        </div>

                    </div>
                </section>

                <section id="about" className="section about-section">
                    <div className="section-badge" data-i18n="about_badge">About Krater</div>
                    <h2 className="section-title"><span data-i18n="about_title_1">Your Road,</span><br /><span className="accent" data-i18n="about_title_accent">Our Mission</span></h2>
                    <p className="section-text" data-i18n="about_desc">
                        Krater is a citizen-first platform designed to empower communities. Whether it's a small crack or a dangerous pothole, Krater gives you the power to report road damage with just a tap. Our intelligent system routes your complaint directly to the responsible municipal authority, and you can track every step — from filing to fixing.
                    </p>
                    <div className="about-cards">
                        <div className="about-card">
                            <div className="card-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            </div>
                            <h3 data-i18n="about_card1_title">Geo-Tagged Reports</h3>
                            <p data-i18n="about_card1_desc">Pinpoint exact pothole locations using GPS, making it easy for authorities to find and fix them.</p>
                        </div>
                        <div className="about-card">
                            <div className="card-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            </div>
                            <h3 data-i18n="about_card2_title">Verified & Secure</h3>
                            <p data-i18n="about_card2_desc">Every report is verified and your data stays private. We prioritize your trust and safety.</p>
                        </div>
                        <div className="about-card">
                            <div className="card-icon">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            </div>
                            <h3 data-i18n="about_card3_title">Live Tracking</h3>
                            <p data-i18n="about_card3_desc">Follow the status of your complaint in real-time. Know exactly when your road will be repaired.</p>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="section how-section">
                    <div className="section-badge" data-i18n="how_badge">How It Works</div>
                    <h2 className="section-title"><span data-i18n="how_title_1">Three Simple</span><br /><span className="accent" data-i18n="how_title_accent">Steps</span></h2>
                    <div className="steps-container">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <h3 data-i18n="how_step1_title">Report</h3>
                            <p data-i18n="how_step1_desc">Snap a photo of the pothole, add a description, and submit your report. It takes less than 30 seconds.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <h3 data-i18n="how_step2_title">Track</h3>
                            <p data-i18n="how_step2_desc">Get a unique tracking ID for your complaint. Monitor the repair progress via our live status dashboard.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <h3 data-i18n="how_step3_title">Resolve</h3>
                            <p data-i18n="how_step3_desc">Municipal authorities act on verified reports. You get notified when the pothole is filled and the road is safe again.</p>
                        </div>
                    </div>
                </section>

                <section id="features" className="section features-section">
                    <div className="section-badge" data-i18n="feat_badge">Features</div>
                    <h2 className="section-title"><span data-i18n="feat_title_1">Built For</span><br /><span className="accent" data-i18n="feat_title_accent">The People</span></h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">📸</div>
                            <h4 data-i18n="feat_1_title">Photo Evidence</h4>
                            <p data-i18n="feat_1_desc">Attach high-resolution images to strengthen your report.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📍</div>
                            <h4 data-i18n="feat_2_title">Auto Location</h4>
                            <p data-i18n="feat_2_desc">GPS auto-detects the pothole location for precise reporting.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔔</div>
                            <h4 data-i18n="feat_3_title">Notifications</h4>
                            <p data-i18n="feat_3_desc">Real-time alerts on every status change of your complaint.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🏛️</div>
                            <h4 data-i18n="feat_4_title">Direct Routing</h4>
                            <p data-i18n="feat_4_desc">Complaints go straight to the responsible municipal body.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <h4 data-i18n="feat_5_title">Community Stats</h4>
                            <p data-i18n="feat_5_desc">See how many issues your neighborhood has reported and resolved.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🛡️</div>
                            <h4 data-i18n="feat_6_title">Anonymous Mode</h4>
                            <p data-i18n="feat_6_desc">Report without revealing your identity if you prefer privacy.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer id="footer" className="site-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <img src="/logo.png" alt="Krater" className="footer-logo" />
                        <p className="footer-tagline" data-i18n="footer_tagline">Making roads safer, one report at a time.</p>
                    </div>
                </div>
                <div className="footer-columns">
                    <div className="footer-col">
                        <h4 data-i18n="footer_col1_title">Company</h4>
                        <ul>
                            <li><a href="#about" data-i18n="footer_col1_1">About Us</a></li>
                            <li><a href="#" data-i18n="footer_col1_2">Careers</a></li>
                            <li><a href="#" data-i18n="footer_col1_3">Press</a></li>
                            <li><a href="#" data-i18n="footer_col1_4">Blog</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 data-i18n="footer_col2_title">Support</h4>
                        <ul>
                            <li><a href="#" data-i18n="footer_col2_1">Help Center</a></li>
                            <li><a href="#" data-i18n="footer_col2_2">FAQs</a></li>
                            <li><a href="#" data-i18n="footer_col2_3">Contact Us</a></li>
                            <li><a href="#" data-i18n="footer_col2_4">Report a Bug</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 data-i18n="footer_col3_title">Community</h4>
                        <ul>
                            <li><a href="#" data-i18n="footer_col3_1">Give Suggestions</a></li>
                            <li><a href="#" data-i18n="footer_col3_2">Volunteer</a></li>
                            <li><a href="#" data-i18n="footer_col3_3">Partner With Us</a></li>
                            <li><a href="#" data-i18n="footer_col3_4">Events</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4 data-i18n="footer_col4_title">Legal</h4>
                        <ul>
                            <li><a href="#" data-i18n="footer_col4_1">Privacy Policy</a></li>
                            <li><a href="#" data-i18n="footer_col4_2">Terms of Service</a></li>
                            <li><a href="#" data-i18n="footer_col4_3">Cookie Policy</a></li>
                            <li><a href="#" data-i18n="footer_col4_4">Accessibility</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p data-i18n="footer_copyright">&copy; 2026 Krater. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}