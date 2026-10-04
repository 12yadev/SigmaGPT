import "../ChatWindow.css"; 
import Chat from "../Chat.jsx";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useRef, useEffect } from "react";

const API_BASE_URL = "https://sigmagpt-27ef.onrender.com";

function ChatWindow() {
    const {
        prompt, 
        setPrompt, 
        setReply, 
        currThreadId, 
        prevChats, 
        setPrevChats, 
        setNewChat,
        setAllThreads,
        setShowUpgradeModal
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [prevChats, loading]);

    const getReply = async () => {
        if (!prompt.trim() || loading) return;

        const currentMessage = prompt;
        setPrompt("");
        setLoading(true);
        setNewChat(false);

        // 1. Add User message
        setPrevChats(prev => [
            ...(prev || []),
            { role: "user", content: currentMessage }
        ]);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: currentMessage,
                    threadId: currThreadId
                })
            });

            const res = await response.json();

            if (response.ok && res.reply) {
                setPrevChats(prev => [
                    ...(prev || []),
                    { role: "assistant", content: res.reply }
                ]);
                setReply(res.reply);

                // Refresh recent threads
                try {
                    const threadRes = await fetch(`${API_BASE_URL}/api/thread`);
                    if (threadRes.ok) {
                        const threadData = await threadRes.json();
                        if (Array.isArray(threadData)) {
                            setAllThreads(threadData);
                        }
                    }
                } catch (tErr) {
                    console.error("Thread refresh failed:", tErr);
                }
            } else {
                setPrevChats(prev => [
                    ...(prev || []),
                    { role: "assistant", content: res.error || "Failed to generate reply." }
                ]);
            }
        } catch (err) {
            console.error("Chat Error:", err);
            setPrevChats(prev => [
                ...(prev || []),
                { role: "assistant", content: "Error connecting to server. Please check backend connection." }
            ]);
        }
        setLoading(false);
    };

    return (
        <div className="chatWindow">
            <div className="chat-topbar">
                <div 
                    className="upgrade-btn" 
                    onClick={() => setShowUpgradeModal(true)} 
                    style={{ cursor: "pointer" }}
                    title="View subscription plans"
                >
                    <span>Upgrade</span>
                </div>
                <div 
                    className="refresh-icon" 
                    onClick={() => window.location.reload()} 
                    title="Reload Page"
                >
                    <i className="fa-solid fa-arrows-rotate"></i>
                </div>
            </div>

            <div className="chatContainer">
                {prevChats && prevChats.length > 0 ? (
                    <div className="chatMessagesWrapper">
                        <Chat />
                        {loading && (
                            <div className="thinking-indicator" style={{ color: "#10a37f", padding: "12px 20px", fontSize: "14px" }}>
                                SigmaGPT is thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="welcomeScreen">
                        <h1 className="mainHeading">What’s on your mind today?</h1>
                    </div>
                )}
            </div>

            <div className="chatInput">
                <div className="inputBox">
                    <button className="pill-btn" type="button" title="Add Attachment">
                        <i className="fa-solid fa-plus"></i>
                    </button>

                    <input 
                        placeholder="Ask anything..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                getReply();
                            }
                        }}
                    />

                    <div 
                        className={`send-circle-btn ${prompt.trim() ? "active" : "disabled"}`} 
                        onClick={getReply}
                        title="Send Message"
                    >
                        <i className="fa-solid fa-arrow-up"></i>
                    </div>
                </div>
                <p className="info">SigmaGPT can make mistakes. Verify important info.</p>
            </div>
        </div>
    );
}

export default ChatWindow;