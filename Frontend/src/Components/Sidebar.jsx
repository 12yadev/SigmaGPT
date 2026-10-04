import "../Sidebar.css"; // <-- Yeh "../" hona chahiye kyunki file bahar src/ me hai
import { useContext, useEffect, useState, useCallback } from "react";
import { MyContext } from "../MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setCurrThreadId,
        prevChats,
        setPrevChats,
        setPrompt,
        setNewChat,
        user,
        logout,
        setShowLoginModal,
        setShowUpgradeModal
    } = useContext(MyContext);

    const [isOpen, setIsOpen] = useState(true);
    const [showRecentChats, setShowRecentChats] = useState(true);
    const [showMenu, setShowMenu] = useState(false);

    const fetchThreads = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:8080/api/thread");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAllThreads(data);
                }
            }
        } catch (err) {
            console.error("Fetch threads error:", err);
        }
    }, [setAllThreads]);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads, currThreadId, prevChats?.length]);

    const handleNewChat = () => {
        const newId = uuidv1();
        setCurrThreadId(newId);
        setPrevChats([]);
        setPrompt("");
        setNewChat(true);
    };

    const handleSelectThread = async (id) => {
        if (id === currThreadId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/thread/${id}`);
            if (res.ok) {
                const messages = await res.json();
                if (Array.isArray(messages)) {
                    setCurrThreadId(id);
                    setPrevChats(messages);
                    setNewChat(false);
                }
            }
        } catch (err) {
            console.error("Error loading chat messages:", err);
        }
    };

    const handleDeleteThread = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:8080/api/thread/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setAllThreads(prev => prev.filter(t => (t.threadId || t._id) !== id));
                if (currThreadId === id) handleNewChat();
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <aside className={`chatgpt-sidebar ${isOpen ? "open" : "collapsed"}`}>
            <div className="sidebar-top-bar">
                <button className="sidebar-icon-btn" onClick={handleNewChat} title="New chat">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                </button>
                <button className="sidebar-icon-btn toggle-btn" onClick={() => setIsOpen(!isOpen)} title="Toggle sidebar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="history-section">
                    <div className="history-heading-wrapper" onClick={() => setShowRecentChats(p => !p)}>
                        <span className="history-heading">Recent Chats</span>
                        <svg className={`chevron-arrow ${showRecentChats ? "rotated" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </div>

                    {showRecentChats && (
                        <div className="history-list">
                            {allThreads && allThreads.length > 0 ? (
                                allThreads.map((thread) => {
                                    const threadKey = thread.threadId || thread._id;
                                    return (
                                        <div
                                            key={threadKey}
                                            className={`chat-item ${threadKey === currThreadId ? "active" : ""}`}
                                            onClick={() => handleSelectThread(threadKey)}
                                        >
                                            <span className="thread-title">{thread.title || "New Chat"}</span>
                                            <button className="thread-del-btn" onClick={(e) => handleDeleteThread(e, threadKey)} title="Delete">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="empty-history">No chats yet</div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Profile / Auth Menu */}
            <div className="sidebar-footer-wrapper">
                {showMenu && (
                    <div className="profile-popup-menu">
                        {user ? (
                            <>
                                <div className="menu-user-info">
                                    <strong>{user.name}</strong>
                                    <small>{user.email}</small>
                                </div>
                                <button className="menu-action-btn" onClick={() => { setShowUpgradeModal(true); setShowMenu(false); }}>
                                    ✨ Upgrade to Pro
                                </button>
                                <button className="menu-action-btn logout-btn" onClick={() => { logout(); setShowMenu(false); }}>
                                    Log out
                                </button>
                            </>
                        ) : (
                            <button className="menu-action-btn login-btn" onClick={() => { setShowLoginModal(true); setShowMenu(false); }}>
                                Log in / Sign up
                            </button>
                        )}
                    </div>
                )}

                <div className="sidebar-footer" onClick={() => setShowMenu(p => !p)}>
                    <div className="avatar">{user ? getInitials(user.name) : "?"}</div>
                    {isOpen && (
                        <div className="user-details">
                            <span className="profile-name">{user ? user.name : "Guest User"}</span>
                            <span className="profile-badge">{user ? user.plan || "Free" : "Click to Login"}</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;