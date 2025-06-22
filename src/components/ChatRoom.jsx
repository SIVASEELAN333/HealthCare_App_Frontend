import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import "./ChatRoom.css";
import { groups } from "./groups";
import EmojiPicker from 'emoji-picker-react';


const socket = io("http://localhost:8082", { transports: ["websocket"] });

const ChatRoom = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef();
  const chatAreaRef = useRef();
  const [replyTo, setReplyTo] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [allUsers, setAllUsers] = useState([]);
const [privateTo, setPrivateTo] = useState(null);
const [showEmojiPicker, setShowEmojiPicker] = useState(false);

const handleEmojiClick = (emojiData) => {
  setNewMsg((prev) => prev + emojiData.emoji);
};


  const group = groups.find((g) => g.slug === roomName);
  if (!group) return <div>❌ Invalid chat room</div>;

  const addPollOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, ""]);
  };

  const handlePollSend = () => {
    const validOptions = pollOptions.filter((opt) => opt.trim());
    if (!pollQuestion.trim() || validOptions.length < 2) {
      alert("Please enter a question and at least two options.");
      return;
    }

    const msgObj = {
      room: roomName,
      sender: username,
      timestamp: new Date(),
      poll: {
        question: pollQuestion,
        options: validOptions.map((opt) => ({ text: opt, votes: [] })),
      },
    };

    socket.emit("chatMessage", msgObj);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowPollModal(false);
  };

  const handleDeleteMessage = (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;

    socket.emit("deleteMessage", { index, room: roomName });
  
  };

  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;

    const checkScroll = () => {
      const scrollTop = chatArea.scrollTop;
      const scrollHeight = chatArea.scrollHeight;
      const clientHeight = chatArea.clientHeight;
      const atBottom = scrollHeight - scrollTop - clientHeight < 10;
      setShowScrollToBottom(!atBottom);
    };

    chatArea.addEventListener("scroll", checkScroll);
    checkScroll();

    return () => chatArea.removeEventListener("scroll", checkScroll);
  }, [step]);

  useEffect(() => {
  if (step !== "chat") return;

  socket.emit("joinRoom", roomName);
  socket.emit("getRoomUsers", roomName); // 👈 request user list
  socket.emit("setUsername", username); 

  socket.on("roomUsers", (users) => setAllUsers(users));
  socket.on("chatHistory", (history) => setMessages(history));

  socket.on("chatMessage", (msg) => {
    if (msg.privateTo) {
  if (msg.privateTo !== username && msg.sender !== username) return;
}
    setMessages((prev) => [...prev, msg]);
    const chatArea = chatAreaRef.current;
    if (chatArea) {
      const atBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 10;
      if (atBottom) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        setShowScrollToBottom(true);
      }
    }
  });

  socket.on("pollVoteUpdate", ({ index, poll }) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index].poll = poll;
      return updated;
    });
  });

  socket.on("messageDeleted", (index) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  });

  return () => {
    socket.emit("leaveRoom", roomName);
    socket.off("chatMessage");
    socket.off("chatHistory");
    socket.off("pollVoteUpdate");
    socket.off("messageDeleted");
    socket.off("roomUsers");
  };
}, [step, roomName]);

  const votePollOption = (msgIndex, optionIndex) => {
    setMessages((prev) => {
      const updated = [...prev];
      const msg = updated[msgIndex];
      if (msg && msg.poll) {
        msg.poll.options = msg.poll.options.map((opt) => ({
          ...opt,
          votes: opt.votes.filter((voter) => voter !== username),
        }));
        msg.poll.options[optionIndex].votes.push(username);

        socket.emit("pollVoteUpdate", {
          index: msgIndex,
          poll: msg.poll,
          room: roomName,
        });
      }
      return updated;
    });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8081/api/auth/login", { email, password });
      const user = res.data;
      localStorage.setItem("chat_email", email);
      if (user.username) {
        setUsername(user.username);
        setStep("chat");
      } else {
        setStep("username");
      }
    } catch {
      alert("❌ Invalid email or password");
    }
  };

  const handleUsernameConfirm = async () => {
    if (!username.trim()) return;
    try {
      await axios.post("http://localhost:8081/api/auth/set-username", {
        email: localStorage.getItem("chat_email"),
        username,
      });
      setStep("chat");
    } catch {
      alert("❌ Failed to save username");
    }
  };

  const sendMessage = () => {
  const trimmed = newMsg.trim();
  if (!trimmed) return;

  const msgObj = {
    room: roomName,
    text: trimmed,
    sender: username,
    timestamp: new Date(),
    replyTo: replyTo || null,
    privateTo: privateTo || null,
  };

  socket.emit("chatMessage", msgObj);
  setNewMsg("");
  setReplyTo(null);
  setPrivateTo(null);
};


  if (step === "login") {
    return (
      <div className="name-entry-page">
        <h2>🔐 Enter Email & Password to join {group.name}</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="login-btn" onClick={handleLogin}>Login</button>
      </div>
    );
  }

  if (step === "username") {
    return (
      <div className="name-entry-page">
        <h2>📝 Choose a chat username</h2>
        <input type="text" placeholder="Chat username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <button onClick={handleUsernameConfirm}>Continue</button>
      </div>
    );
  }

  return (
    <div className="chatroom-page">
      <button className="back-btn" onClick={() => navigate(-1)}>⬅ Back</button>
      <h2>{group.icon} {group.name}</h2>
      <p>{group.desc}</p>

      <div className="chat-area" ref={chatAreaRef}>
        {messages.map((msg, i) => {
          const isSelf = msg.sender === username;
          const totalVotes = msg.poll?.options?.reduce((sum, opt) => sum + opt.votes.length, 0);
          return (
            <div key={i} className={`chat-msg ${isSelf ? "self" : "other"} bounce-in`}>
              <div className="meta">
  <strong>{msg.sender}</strong>

  {msg.privateTo && (
    <span className="private-tag">🔒 Private to {msg.privateTo}</span>
  )}

  <div className="msg-actions">
    <button className="reply-btn" onClick={() => setReplyTo(msg)}>↩</button>
    {!isSelf && (
      <button className="private-btn" onClick={() => setPrivateTo(msg.sender)}>🔒</button>
    )}
    {isSelf && (
      <button className="delete-btn" onClick={() => handleDeleteMessage(i)}>🗑️</button>
    )}
  </div>
</div>


              {msg.replyTo && (
                <div className="reply-box">
                  <strong>{msg.replyTo.sender}</strong>: <em>{msg.replyTo.text}</em>
                </div>
              )}

              {msg.text && <p>{msg.text}</p>}

              {msg.poll && msg.poll.question && msg.poll.options?.length >= 2 && (
                <div className="poll-box">
                  <strong>{msg.poll.question}</strong>
                  {msg.poll.options.map((opt, j) => {
                    const isVotedOption = opt.votes.includes(username);
                    const percentage = totalVotes ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                    return (
                      <div
                        key={j}
                        onClick={() => votePollOption(i, j)}
                        className={isVotedOption ? "voted" : ""}
                        style={{
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: `${percentage}%`,
                            background: "linear-gradient(90deg, #00cec9, #74b9ff)",
                            borderRadius: "10px",
                            opacity: 0.4,
                            zIndex: 0,
                            transition: "width 0.5s ease",
                          }}
                        />
                        <span style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between" }}>
                          {opt.text}
                          <span>{percentage}% ({opt.votes.length})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {showScrollToBottom && (
        <button className="scroll-bottom-btn" onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}>⬇ Scroll to Latest</button>
      )}

      <div className="send-area">
  {replyTo && (
    <div className="reply-preview">
      <span>Replying to <strong>{replyTo.sender}</strong>: {replyTo.text}</span>
      <button onClick={() => setReplyTo(null)}>✖</button>
    </div>
  )}
  {privateTo && (
    <div className="reply-preview">
      <span>Private message to <strong>{privateTo}</strong></span>
      <button onClick={() => setPrivateTo(null)}>✖</button>
    </div>
  )}

  <div style={{ position: "relative" }}>
    <textarea
      rows={2}
      placeholder="Type your message..."
      value={newMsg}
      onChange={(e) => setNewMsg(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }}
    />
    {/* Emoji Picker Toggle Button */}
    <button
      onClick={() => setShowEmojiPicker((prev) => !prev)}
      style={{ position: "absolute", right: "10px", bottom: "10px" }}
    >
      😊
    </button>
    {/* Emoji Picker */}
    {showEmojiPicker && (
  <div style={{ position: "absolute", bottom: "60px", zIndex: 999, background: "white", border: "1px solid #ccc", borderRadius: "10px", padding: "5px" }}>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button
        onClick={() => setShowEmojiPicker(false)}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          marginBottom: "5px"
        }}
      >
        ❌
      </button>
    </div>
    <EmojiPicker onEmojiClick={(e) => handleEmojiClick(e)} />
  </div>
)}

  </div>

  <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
    <button onClick={() => setShowPollModal(true)} className="cp">📊 Create Poll</button>
    <button onClick={sendMessage}>Send</button>
  </div>
</div>


      {showPollModal && (
        <div className="poll-modal">
          <h3>Create a Poll</h3>
          <input type="text" placeholder="Poll Question" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
          {pollOptions.map((opt, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const updated = [...pollOptions];
                  updated[i] = e.target.value;
                  setPollOptions(updated);
                }}
                style={{ flex: 1 }}
              />
              {pollOptions.length > 2 && (
                <button
                  onClick={() => {
                    const updated = pollOptions.filter((_, index) => index !== i);
                    setPollOptions(updated);
                  }}
                  style={{ marginLeft: "8px", color: "red" }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
          {pollOptions.length < 5 && <button onClick={addPollOption}>➕ Add Option</button>}
          <button onClick={handlePollSend}>📤 Send Poll</button>
          <button onClick={() => setShowPollModal(false)}>❌ Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
