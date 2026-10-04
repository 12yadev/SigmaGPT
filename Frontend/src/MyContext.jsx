import { createContext, useState } from "react";
import { v1 as uuidv1 } from "uuid";

// Components ke andar useContext(MyContext) ke liye named export
export const MyContext = createContext();

function MyContextProvider({ children }) {
    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState("");
    const [currThreadId, setCurrThreadId] = useState(uuidv1());
    const [prevChats, setPrevChats] = useState([]);
    const [allThreads, setAllThreads] = useState([]);
    const [newChat, setNewChat] = useState(true);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("sigmagpt_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const login = (name, email) => {
        const userData = { name, email, plan: "Free" };
        setUser(userData);
        localStorage.setItem("sigmagpt_user", JSON.stringify(userData));
        setShowLoginModal(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("sigmagpt_user");
        setPrevChats([]);
        setCurrThreadId(uuidv1());
        setNewChat(true);
    };

    return (
        <MyContext.Provider
            value={{
                prompt,
                setPrompt,
                reply,
                setReply,
                currThreadId,
                setCurrThreadId,
                prevChats,
                setPrevChats,
                allThreads,
                setAllThreads,
                newChat,
                setNewChat,
                user,
                login,
                logout,
                showLoginModal,
                setShowLoginModal,
                showUpgradeModal,
                setShowUpgradeModal
            }}
        >
            {children}
        </MyContext.Provider>
    );
}

// Default export provider
export default MyContextProvider;