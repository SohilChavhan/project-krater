import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './InspectorDashboard.css';

export default function InspectorDashboard({ user, db, onSignOut, onAddAccount, onSwitchAccount, onGoHome }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const colors = isDarkMode ? {
        bg: '#0f172a', panel: '#1e293b', text: '#e2e8f0', subtext: '#94a3b8',
        border: '#334155', accent: '#0D9488', header: '#0D9488',
    } : {
        bg: '#f1f5f9', panel: '#ffffff', text: '#1e293b', subtext: '#64748b',
        border: '#e2e8f0', accent: '#0D9488', header: '#0D9488',
    };

    useEffect(() => {
        const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTickets(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db]);

    useEffect(() => {
        const handleClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleUpdateStatus = async (ticketId, newStatus) => {
        try {
            await updateDoc(doc(db, "tickets", ticketId), { status: newStatus });
        } catch (error) {
            console.error("Error updating ticket:", error);
            alert("Failed to update status.");
        }
    };

    const getSeverityBadgeColor = (severity) => {
        if (severity?.includes('CRITICAL')) return '#ef5350';
        if (severity === 'HIGH') return '#f97316';
        if (severity === 'MODERATE') return '#fbc02d';
        return '#4ade80';
    };

    const getStatusColor = (status) => {
        if (status === 'resolved') return '#4ade80';
        if (status === 'in-progress') return '#fbbf24';
        if (status === 'budget allocated') return '#60a5fa';
        if (status === 'declined') return '#ef4444';
        return '#ef4444';
    };
    
    const handleInspectorConfirm = async (ticket) => {
        try {
            
            const isFullyConfirmed = ticket.adminConfirmed === true;

            const payload = {
                inspectorConfirmed: true,
                inspectorConfirmedAt: serverTimestamp()
            };

            
            if (isFullyConfirmed) {
                payload.isConfirmed = true;
                payload.status = "open";
                payload.confirmedAt = serverTimestamp();
            }

            await updateDoc(doc(db, "tickets", ticket.id), payload);
            alert(isFullyConfirmed ? "Ticket fully confirmed and opened!" : "Field verification saved! Waiting on Admin approval.");

        } catch (error) {
            console.error("Error confirming ticket:", error);
            alert("Failed to confirm ticket.");
        }
    };

    const handleInspectorDecline = async (ticket) => {
        if (!window.confirm("Are you sure you want to decline this ticket? It will instantly reject the report.")) return;

        try {
            await updateDoc(doc(db, "tickets", ticket.id), {
                inspectorConfirmed: false,
                isConfirmed: false, 
                status: "declined",
                declinedAt: serverTimestamp()
            });
            alert(`Ticket ${ticket.ticketLabel} has been declined.`);
        } catch (error) {
            console.error("Error declining ticket:", error);
            alert("Failed to decline ticket.");
        }
    };
    const HeaderButton = ({ icon, label, onClick }) => (
        <div onClick={onClick} className="insp-header-btn">
            <div className="insp-header-btn-circle">{icon}</div>
            <span className="insp-header-btn-label">{label}</span>
        </div>
    );

    return (
        <div className="insp-root" style={{ backgroundColor: colors.bg, color: colors.text }}>
            {}
            <header className="insp-header" style={{ backgroundColor: colors.header }}>
                <div className="insp-header-left">
                    {isMobile && (
                        <div onClick={() => setShowMobileMenu(true)} style={{ cursor: 'pointer', padding: '5px', display: 'flex' }}>
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </div>
                    )}
                    <div className="insp-logo">KRATER</div>
                    {!isMobile && <div className="insp-subtitle">Inspector Command Center</div>}
                </div>

                <div className="insp-header-right">
                    {!isMobile && (
                        <>
                            <HeaderButton
                                label={isDarkMode ? 'LIGHT MODE?' : 'DARK MODE?'}
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff">{isDarkMode ? <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /> : <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />}</svg>}
                            />
                            <div ref={userMenuRef} style={{ position: 'relative' }}>
                                <HeaderButton
                                    label={user?.displayName || 'Inspector'}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
                                />
                                {showUserMenu && (
                                    <div className="insp-user-dropdown" style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}>
                                        <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}`, textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', color: colors.subtext }}>Welcome,</div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.text }}>{user?.displayName || 'Inspector'}!</div>
                                        </div>
                                        <div className="insp-dropdown-item" onClick={() => { onGoHome(); setShowUserMenu(false); }} style={{ color: colors.text }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                            Home
                                        </div>
                                        <div className="insp-dropdown-item" onClick={() => { onAddAccount(); setShowUserMenu(false); }} style={{ color: colors.text }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>
                                            Add another account
                                        </div>
                                        <div className="insp-dropdown-item" onClick={() => { onSwitchAccount(); setShowUserMenu(false); }} style={{ color: colors.text }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
                                            Switch Accounts
                                        </div>
                                        <div className="insp-dropdown-item" onClick={onSignOut} style={{ color: '#ef5350' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                                            Sign Out
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </header>

            {}
            {isMobile && (
                <div className="insp-mobile-overlay" style={{ pointerEvents: showMobileMenu ? 'auto' : 'none' }}>
                    <div className="insp-mobile-backdrop" style={{ opacity: showMobileMenu ? 1 : 0 }} onClick={() => setShowMobileMenu(false)} />
                    <div className="insp-mobile-drawer" style={{ transform: showMobileMenu ? 'translateX(0)' : 'translateX(-100%)', backgroundColor: isDarkMode ? '#1e293b' : '#fff' }}>
                        <div className="insp-mobile-drawer-header" style={{ borderBottom: `1px solid ${colors.border}` }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: '"Engravers MT", serif', letterSpacing: '1px', color: isDarkMode ? '#fff' : colors.accent }}>KRATER</div>
                            <button onClick={() => setShowMobileMenu(false)} style={{ background: 'none', border: 'none', padding: '10px', cursor: 'pointer', color: colors.text }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <div className="insp-mobile-drawer-content">
                            <div className="insp-mobile-menu-item" style={{ color: colors.text }} onClick={() => { setIsDarkMode(!isDarkMode); setShowMobileMenu(false); }}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">{isDarkMode ? <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /> : <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />}</svg>
                                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                            </div>
                        </div>
                        <div className="insp-mobile-drawer-footer" style={{ borderTop: `1px solid ${colors.border}` }}>
                            <div className="insp-mobile-menu-item" style={{ color: colors.text }} onClick={() => { setShowMobileMenu(false); }}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                {user?.displayName || 'Inspector'}
                            </div>
                            <div className="insp-mobile-menu-item" style={{ color: colors.text }} onClick={() => { onGoHome(); setShowMobileMenu(false); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                Home
                            </div>
                            <div className="insp-mobile-menu-item" style={{ color: colors.text }} onClick={() => { onAddAccount(); setShowMobileMenu(false); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="17" y1="11" x2="23" y2="11" /></svg>
                                Add another account
                            </div>
                            <div className="insp-mobile-menu-item" style={{ color: colors.text }} onClick={() => { onSwitchAccount(); setShowMobileMenu(false); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
                                Switch Accounts
                            </div>
                            <div className="insp-mobile-menu-item" style={{ color: '#ef5350' }} onClick={() => { onSignOut(); setShowMobileMenu(false); }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                                Sign Out
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {}
            <main className="insp-main" style={{ backgroundColor: colors.bg }}>
                <div className="insp-content-header">
                    <div>
                        <h1 style={{ color: colors.text }}>Active Work Orders</h1>
                        <p style={{ color: colors.subtext }}>Review AI-verified road damage and update repair statuses.</p>
                    </div>
                    <div className="insp-total-badge" style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}>
                        <strong style={{ color: colors.text }}>Total Reports:</strong>
                        <span style={{ color: colors.accent, fontSize: '1.2rem', marginLeft: '5px' }}>{tickets.length}</span>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: colors.subtext }}>Loading Krater Database...</div>
                ) : (
                    <div className="insp-ticket-grid">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="insp-ticket-card" style={{ backgroundColor: colors.panel, border: `1px solid ${colors.border}` }}>
                                <div className="insp-ticket-image" style={{ backgroundColor: isDarkMode ? '#334155' : '#e2e8f0' }}>
                                    {ticket.image ? (
                                        <img src={ticket.image} alt="Road Damage" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.subtext }}>No Image Provided</div>
                                    )}
                                    <div className="insp-severity-badge" style={{ backgroundColor: getSeverityBadgeColor(ticket.severity) }}>
                                        {ticket.severity || 'UNKNOWN'}
                                    </div>
                                </div>

                                <div className="insp-ticket-details" style={{ color: colors.text }}>
                                    <div className="insp-ticket-title-row">
                                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: colors.text }}>{ticket.ticketLabel}</span>
                                        <span className="insp-ticket-date" style={{ color: colors.subtext, backgroundColor: isDarkMode ? '#334155' : '#f1f5f9' }}>
                                            {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>

                                    <div style={{ color: colors.subtext, fontSize: '0.95rem' }}>
                                        <div style={{ marginBottom: '8px' }}><strong>Location: </strong> {ticket.road || 'Pending GPS Data'}</div>
                                        <div style={{ marginBottom: '8px' }}><strong>AI Detection:</strong> {ticket.potholes} Pothole(s) Found</div>
                                        {}
                                        {ticket.isConfirmed !== false && ticket.inspectorConfirmed !== true && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '10px' }}>
                                            <button
                                                onClick={() => handleInspectorDecline(ticket)}
                                                style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: '#ef4444', border: '2px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleInspectorConfirm(ticket)}
                                                style={{ flex: 1, padding: '12px', backgroundColor: '#4ade80', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxShadow: '0 4px 10px rgba(74, 222, 128, 0.3)' }}
                                            >
                                                {ticket.adminConfirmed ? 'Finalize & Open Ticket' : 'Verify (Wait for Admin)'}
                                            </button>
                                        </div>
                                    )}

                                        {}
                                       {}
                                    <div className="insp-status-row" style={{ 
                                        borderTop: `1px dashed ${colors.border}`, 
                                        marginTop: '10px',
                                        opacity: ticket.isConfirmed === true ? 1 : 0.5, 
                                        pointerEvents: ticket.isConfirmed === true ? 'auto' : 'none' 
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getStatusColor(ticket.status) }} />
                                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: colors.text, textTransform: 'uppercase' }}>
                                                {ticket.isConfirmed === false ? 'DECLINED' : (ticket.status || 'open')}
                                            </span>
                                        </div>
                                        <select
                                            value={ticket.status || 'open'}
                                            onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                                            className="insp-status-select"
                                            style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', color: colors.accent, border: `1px solid ${colors.border}` }}
                                        >
                                            <option value="open">Open</option>
                                            <option value="budget allocated">Budget Allocated</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="declined">Declined</option>
                                        </select>
                                    </div>
                                </div>
                                    
                                </div>
                            </div>
                        ))}

                        {tickets.length === 0 && !loading && (
                            <div className="insp-empty" style={{ backgroundColor: colors.panel, border: `1px dashed ${colors.border}`, color: colors.subtext }}>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🛣️</div>
                                All clear! There are no open road damage tickets in the system.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
