import "./Chat.css";
import { useContext, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chat() {
    const { prevChats } = useContext(MyContext);
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats]);

    return (
        <div className="chatFeed">
            {prevChats?.map((chat, idx) => (
                <div 
                    key={idx} 
                    className={`messageRow ${chat.role === "user" ? "userRow" : "assistantRow"}`}
                >
                    <div className="messageContent">
                        {chat.role === "assistant" ? (
                            <div className="markdownBody">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {chat.content}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="userBubble">
                                {chat.content}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div ref={chatEndRef} />
        </div>
    );
}

export default Chat;