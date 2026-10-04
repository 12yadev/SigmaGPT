import { useContext, useState } from "react";
import { MyContext } from "../MyContext.jsx";
import "./Models.css";

export function Modals() {
    const { 
        showLoginModal, 
        setShowLoginModal, 
        showUpgradeModal, 
        setShowUpgradeModal, 
        login 
    } = useContext(MyContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && email.trim()) {
            login(name.trim(), email.trim());
        }
    };

    return (
        <>
            {/* 1. Login Modal */}
            {showLoginModal && (
                <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Welcome to SigmaGPT</h2>
                        <p>Sign in to save your conversation history across devices.</p>
                        <form onSubmit={handleFormSubmit}>
                            <input 
                                type="text" 
                                placeholder="Your Name" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                required 
                            />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                            />
                            <button type="submit" className="primary-modal-btn">Continue</button>
                        </form>
                        <button className="close-btn" onClick={() => setShowLoginModal(false)}>×</button>
                    </div>
                </div>
            )}

            {/* 2. Upgrade Plan Modal */}
            {showUpgradeModal && (
                <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
                    <div className="modal-content upgrade-card" onClick={e => e.stopPropagation()}>
                        <div className="upgrade-header">
                            <h2>Upgrade your plan</h2>
                            <p>Unlock high-speed models, priority response, and deep search.</p>
                        </div>
                        <div className="plans-container">
                            <div className="plan-box active-plan">
                                <h3>Free</h3>
                                <p className="price">$0 <span>/ month</span></p>
                                <ul>
                                    <li>✓ Access to fast GPT-OSS model</li>
                                    <li>✓ Standard response speed</li>
                                    <li>✓ Web search preview</li>
                                </ul>
                                <button className="plan-status-btn" disabled>Current Plan</button>
                            </div>
                            <div className="plan-box pro-plan">
                                <span className="highlight-tag">Popular</span>
                                <h3>Sigma Pro</h3>
                                <p className="price">$20 <span>/ month</span></p>
                                <ul>
                                    <li>✓ Unlimited GPT-OSS 120B reasoning</li>
                                    <li>✓ 5x Faster inference speeds</li>
                                    <li>✓ Unlimited real-time web search</li>
                                    <li>✓ Priority customer support</li>
                                </ul>
                                <button className="upgrade-action-btn" onClick={() => alert("Payment gateway integration in progress!")}>
                                    Upgrade to Plus
                                </button>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setShowUpgradeModal(false)}>×</button>
                    </div>
                </div>
            )}
        </>
    );
}