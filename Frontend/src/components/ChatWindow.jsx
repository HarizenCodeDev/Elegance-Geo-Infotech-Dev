import { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Search, Plus, X, Send, MoreVertical, Phone, Video, ArrowLeft, Check, CheckCheck } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ChatWindow = () => {
  const [user, setUser] = useState(null);
  const [directContacts, setDirectContacts] = useState([]);
  const [customGroups, setCustomGroups] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState({});
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData._id) {
      const token = localStorage.getItem("token");
      if (token) {
        axios.get(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        }).catch(() => {});
      }
    } else {
      setUser(userData);
    }
  }, []);

  const userId = user?._id;

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/employees`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100 },
        });
        const contacts = res.data.users
          ?.filter((u) => u._id !== userId)
          .map((u) => ({ id: u._id, name: u.name, department: u.department, avatar: u.profileImage })) || [];
        setDirectContacts(contacts);
        
        if (!activeContact && contacts.length > 0) {
          setActiveContact(contacts[0].id);
        }
      } catch {
        // ignore
      }
    };
    loadContacts();
  }, [userId]);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/chat/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setCustomGroups(res.data.groups || []);
        }
      } catch {
        // ignore
      }
    };
    loadGroups();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return directContacts;
    const query = searchQuery.toLowerCase();
    return directContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.department && c.department.toLowerCase().includes(query))
    );
  }, [searchQuery, directContacts]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return customGroups;
    const query = searchQuery.toLowerCase();
    return customGroups.filter((g) =>
      g.name.toLowerCase().includes(query)
    );
  }, [searchQuery, customGroups]);

  const loadMessages = async (contactId = activeContact) => {
    if (!contactId) return;
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem("token");
      const isGroup = contactId.startsWith("grp-");
      const res = await axios.get(`${API_BASE}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { contactId, type: isGroup ? "group" : "direct" },
      });
      setMessages((prev) => ({ ...prev, [contactId]: res.data?.messages || [] }));
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeContact) loadMessages();
  }, [activeContact]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeContact) loadMessages(activeContact);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const currentMessages = useMemo(() => {
    return messages[activeContact] || [];
  }, [messages, activeContact]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeContact) return;

    const isGroup = activeContact.startsWith("grp-");
    const newMsg = {
      _id: Date.now(),
      text: text.trim(),
      from: { _id: userId, name: user?.name || "You" },
      isYou: true,
      ts: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeContact]: [...(prev[activeContact] || []), newMsg],
    }));
    setText("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/chat`,
        { contactId: activeContact, type: isGroup ? "group" : "direct", text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadMessages(activeContact);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/api/chat/groups`,
        { name: newGroupName, description: newGroupDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCustomGroups((prev) => [res.data.group, ...prev]);
        setShowCreateGroup(false);
        setNewGroupName("");
        setNewGroupDesc("");
        toast.success("Group created!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const activeContactData = [
    ...directContacts.filter((c) => c.id === activeContact),
    ...customGroups.filter((g) => g.id === activeContact),
  ][0];

  const activeName = activeContactData?.name;
  const isGroupChat = activeContact?.startsWith("grp-");

  const getInitials = (name) => {
    return (name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getMessageDate = (ts) => {
    if (!ts) return null;
    return new Date(ts).toDateString();
  };

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    
    currentMessages.forEach((msg, idx) => {
      const msgDate = getMessageDate(msg.ts);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: "date", date: msgDate, displayDate: formatDate(msg.ts) });
      }
      groups.push({ type: "message", ...msg });
    });
    
    return groups;
  }, [currentMessages]);

  return (
    <div className="h-full flex rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Sidebar - Contact List */}
      <aside 
        className={`${showSidebar ? 'w-80' : 'w-0'} flex-shrink-0 overflow-hidden transition-all duration-300 border-r`}
        style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Chats</h2>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-9 py-2 rounded-lg text-sm"
              style={{ 
                backgroundColor: 'var(--color-bg-tertiary)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="overflow-y-auto h-[calc(100%-120px)]">
          {/* Groups */}
          {filteredGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => { setActiveContact(g.id); setShowSidebar(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 transition-colors ${
                activeContact === g.id ? '' : ''
              }`}
              style={{ 
                backgroundColor: activeContact === g.id ? 'var(--color-primary-muted)' : 'transparent'
              }}
            >
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#25D366' }}
              >
                <span className="text-white font-medium">{getInitials(g.name)}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{g.name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{g.description || 'Group'}</div>
              </div>
            </button>
          ))}

          {/* Direct Contacts */}
          {filteredContacts.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveContact(c.id); setShowSidebar(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 transition-colors`}
              style={{ 
                backgroundColor: activeContact === c.id ? 'var(--color-primary-muted)' : 'transparent'
              }}
            >
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <span className="font-medium" style={{ color: 'var(--color-bg-primary)' }}>{getInitials(c.name)}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{c.name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{c.department || 'Online'}</div>
              </div>
            </button>
          ))}

          {filteredContacts.length === 0 && filteredGroups.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              No contacts found
            </div>
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col">
        {activeContact ? (
          <>
            {/* Chat Header */}
            <header className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
              <button
                onClick={() => setShowSidebar(true)}
                className="md:lg p-1 rounded-full hover:bg-opacity-10 transition-colors"
                style={{ color: 'var(--color-primary)' }}
              >
                <ArrowLeft size={24} />
              </button>
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isGroupChat ? '#25D366' : 'var(--color-primary)' }}
              >
                <span className="font-medium text-sm" style={{ color: isGroupChat ? 'white' : 'var(--color-bg-primary)' }}>
                  {getInitials(activeName)}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{activeName}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {isGroupChat ? 'Group' : 'Online'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-opacity-10 transition-colors" style={{ color: 'var(--color-primary)' }}>
                  <Phone size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-opacity-10 transition-colors" style={{ color: 'var(--color-primary)' }}>
                  <Video size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-opacity-10 transition-colors" style={{ color: 'var(--color-primary)' }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundColor: '#E5DDD5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm" style={{ color: '#667781' }}>Loading...</div>
                </div>
              ) : groupedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div 
                    className="h-20 w-20 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    <span className="text-3xl font-medium" style={{ color: 'var(--color-bg-primary)' }}>{getInitials(activeName)}</span>
                  </div>
                  <div className="text-lg font-medium" style={{ color: '#111B21' }}>{activeName}</div>
                  <div className="text-sm" style={{ color: '#667781' }}>
                    Messages are end-to-end encrypted. No one outside of this chat can read them.
                  </div>
                </div>
              ) : (
                <>
                  {groupedMessages.map((item, idx) => {
                    if (item.type === "date") {
                      return (
                        <div key={`date-${item.date}`} className="flex justify-center my-4">
                          <span 
                            className="text-xs px-3 py-1 rounded-full"
                            style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#667781' }}
                          >
                            {item.displayDate}
                          </span>
                        </div>
                      );
                    }

                    const showAvatar = !item.isYou && (idx === 0 || groupedMessages[idx - 1]?.from?._id !== item.from?._id || groupedMessages[idx - 1]?.type === "date");
                    
                    return (
                      <div 
                        key={item._id} 
                        className={`flex ${item.isYou ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] flex gap-1 ${item.isYou ? "flex-row-reverse" : ""}`}>
                          {!item.isYou && showAvatar && (
                            <div 
                              className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 self-end mb-1"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            >
                              <span className="text-xs font-medium" style={{ color: 'var(--color-bg-primary)' }}>
                                {getInitials(item.from?.name)}
                              </span>
                            </div>
                          )}
                          <div>
                            {!item.isYou && showAvatar && (
                              <div className="text-xs mb-1 ml-1" style={{ color: '#667781' }}>{item.from?.name}</div>
                            )}
                            <div
                              className={`px-3 py-2 rounded-lg shadow-sm ${
                                item.isYou 
                                  ? "rounded-br-sm" 
                                  : "rounded-bl-sm"
                              }`}
                              style={{ 
                                backgroundColor: item.isYou ? '#DCF8C6' : '#FFFFFF',
                                color: '#111B21'
                              }}
                            >
                              <div className="text-sm break-words">{item.text}</div>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 ${item.isYou ? "justify-end" : ""}`}>
                              <span className="text-[10px]" style={{ color: '#667781' }}>
                                {formatTime(item.ts)}
                              </span>
                              {item.isYou && (
                                <CheckCheck size={14} style={{ color: '#667781' }} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={send} className="p-3 flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-opacity-10 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Plus size={24} />
              </button>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 rounded-lg text-sm"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="p-2 rounded-full transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}
              >
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#E5DDD5' }}>
            <div className="text-center">
              <div 
                className="h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <span className="text-4xl" style={{ color: 'var(--color-bg-primary)' }}>💬</span>
              </div>
              <div className="text-xl font-light" style={{ color: '#41525D' }}>WhatsApp</div>
              <div className="text-sm mt-2" style={{ color: '#667781' }}>
                Select a chat to start messaging
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Create Group</h3>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-1 rounded hover:bg-opacity-10"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Group Name *</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full rounded-lg px-3 py-2"
                  style={{ 
                    backgroundColor: 'var(--color-bg-tertiary)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Description (optional)</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Enter description"
                  className="w-full rounded-lg px-3 py-2"
                  style={{ 
                    backgroundColor: 'var(--color-bg-tertiary)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={creating || !newGroupName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
