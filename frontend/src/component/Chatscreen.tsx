import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getSocket, getOnlineUsersSnapshot } from "../lib/socket";
import { useNavigate } from "react-router-dom";
import type { Socket } from "socket.io-client";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
}

interface Conversation extends User {
  lastMessageAt: string;
  unreadCount?: number;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  video?: string;
  createdAt: string;
}

export default function Chatscreen() {
  const { user: me } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"conversations" | "users">("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!me) return;
    const sock = getSocket(me.id);
    socketRef.current = sock;

    setOnlineUsers(getOnlineUsersSnapshot());
    const onOnlineUsers = (ids: string[]) => setOnlineUsers(ids);
    sock.on("getOnlineUsers", onOnlineUsers);
    sock.on("newMessage", (msg: Message) => {
      if (
        selectedUser &&
        ((msg.senderId === selectedUser._id && msg.receiverId === me.id) ||
          (msg.senderId === me.id && msg.receiverId === selectedUser._id))
      ) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.senderId || c._id === msg.receiverId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        );
      }
    });
    sock.on("messagesRead", ({ readBy }: { readBy: string }) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === readBy ? { ...c, unreadCount: 0 } : c))
      );
    });

    return () => { sock.off("getOnlineUsers", onOnlineUsers); sock.off("newMessage"); sock.off("messagesRead"); };
  }, [me, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    fetch("/api/messages/conversation", { credentials: "include" })
      .then((r) => r.json())
      .then(setConversations)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/messages/user", { credentials: "include" })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, []);

  const openChat = async (user: User) => {
    setSelectedUser(user);
    setTab("conversations");
    setConversations((prev) =>
      prev.map((c) => (c._id === user._id ? { ...c, unreadCount: 0 } : c))
    );
    try {
      const res = await fetch(`/api/messages/${user._id}`, { credentials: "include" });
      const data = await res.json();
      setMessages(data);
    } catch {
      setMessages([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async () => {
    if (!text.trim() && !file) return;
    if (!selectedUser) return;
    setSending(true);

    const formData = new FormData();
    if (text.trim()) formData.append("text", text);
    if (file) formData.append("media", file);

    try {
      const res = await fetch(`/api/messages/send/${selectedUser._id}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setText("");
      removeFile();
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const messageDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
    <div className="min-h-screen bg-black flex items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-5xl h-dvh md:h-[85vh] bg-zinc-900 md:rounded-2xl border-zinc-800 md:border shadow-2xl shadow-blue-500/5 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${selectedUser ? "hidden md:flex" : "flex"} md:flex w-full md:w-80 border-r border-zinc-800 flex-col shrink-0`}>
          {/* Sidebar header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
                 {theme === "dark"?<img src="/favicon.png" className="w-7 h-7" />:<img src="/favicondark.png" className="w-7 h-7" />}
                
             
              <div className="flex items-center gap-2">
                {me?.role === "admin" && (
                  <button onClick={() => navigate("/admin")} className="text-zinc-500 hover:text-yellow-400 transition cursor-pointer" title="Admin Dashboard">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <circle cx="12" cy="10" r="2" />
                      <path d="M7 18c0-2.2 2.2-4 5-4s5 1.8 5 4" />
                    </svg>
                  </button>
                )}
                <button onClick={toggleTheme} className="text-zinc-500 hover:text-yellow-400 transition cursor-pointer" title="Toggle theme">
                  {theme === "dark" ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <button onClick={() => navigate("/profile")} className="text-zinc-500 hover:text-blue-400 transition cursor-pointer" title="Edit profile">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Toggle buttons */}
            <div className="flex bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setTab("conversations")}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition cursor-pointer ${
                  tab === "conversations" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                Chats
              </button>
              <button
                onClick={() => setTab("users")}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition cursor-pointer ${
                  tab === "users" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                Users
              </button>
            </div>
          </div>

          {/* Sidebar list */}
          <div className="flex-1 overflow-y-auto">
            {tab === "conversations"
              ? conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => openChat(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition cursor-pointer text-left ${
                      selectedUser?._id === conv._id ? "bg-zinc-700" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {conv.profilePic ? (
                        <img src={conv.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-zinc-400 font-medium text-sm">{conv.name[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${
                        selectedUser?._id === conv._id
                          ? "text-zinc-100"
                          : "text-zinc-100"
                      }`}>{conv.name}</p>
                      <p className="text-zinc-500 text-xs truncate">{conv.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {conv.unreadCount && conv.unreadCount > 0 ? (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      ) : null}
                      {onlineUsers.includes(conv._id) && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </button>
                ))
              : users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => openChat(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition cursor-pointer text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {u.profilePic ? (
                        <img src={u.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-zinc-400 font-medium text-sm">{u.name[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-100 text-sm font-medium truncate">{u.name}</p>
                      <p className="text-zinc-500 text-xs truncate">{u.email}</p>
                    </div>
                    {onlineUsers.includes(u._id) && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </button>
                ))}
            {tab === "conversations" && conversations.length === 0 && (
              <p className="text-zinc-500 text-sm text-center mt-8">No conversations yet</p>
            )}
            {tab === "users" && users.length === 0 && (
              <p className="text-zinc-500 text-sm text-center mt-8">No other users found</p>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1 flex-col md:flex`}>
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 md:px-5 py-3 border-b border-zinc-800">
                <button onClick={() => setSelectedUser(null)} className="md:hidden text-zinc-400 hover:text-zinc-100 transition cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedUser.profilePic ? (
                    <img src={selectedUser.profilePic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-400 font-medium">{selectedUser.name[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-zinc-100 font-medium text-sm">{selectedUser.name}</p>
                  <p className={`text-xs ${onlineUsers.includes(selectedUser._id) ? "text-emerald-400" : "text-zinc-500"}`}>
                    {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === me?.id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMine ? "bg-blue-600 text-white rounded-br-md" : "bg-zinc-800 text-zinc-200 rounded-bl-md"
                        }`}
                      >
                        {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                        {msg.image && (
                          <img src={msg.image} alt="" className="max-w-full rounded-lg mt-1" />
                        )}
                        {msg.video && (
                          <video src={msg.video} controls className="max-w-full rounded-lg mt-1 max-h-60" />
                        )}
                        <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-zinc-500"}`}>
                          {messageDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 md:p-4 border-t border-zinc-800">
                {filePreview && (
                  <div className="mb-2 relative inline-block">
                    {file?.type.startsWith("video/") ? (
                      <video src={filePreview} className="h-20 rounded-lg" />
                    ) : (
                      <img src={filePreview} alt="" className="h-20 rounded-lg" />
                    )}
                    <button
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center cursor-pointer"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-zinc-400 hover:text-blue-400 transition cursor-pointer"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none max-h-32"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || (!text.trim() && !file)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl p-2.5 transition cursor-pointer"
                  >
                    {sending ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3 text-zinc-500">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
  );
}
