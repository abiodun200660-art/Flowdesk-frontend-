// flowdesk-frontend/components/tasks/TaskComments.jsx

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777","#0284c7",
];

function avatarColor(name = "") {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 32 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        backgroundColor: user?.avatar ? "transparent" : avatarColor(user?.name),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 700, color: "#fff",
        flexShrink: 0, overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.1)",
      }}
    >
      {user?.avatar
        ? <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : getInitials(user?.name)}
    </div>
  );
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
const EMOJIS = ["👍","👎","❤️","😂","😮","😢","🔥","🎉","✅","⚡","💡","🚀","👀","🙏","💯","🤔"];

function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute", bottom: "calc(100% + 8px)", left: 0,
        background: "#1e1e2e", border: "1px solid #2d2d3f", borderRadius: 10,
        padding: 8, display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
        gap: 4, zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
      }}
    >
      {EMOJIS.map((em) => (
        <button
          key={em}
          onClick={() => { onSelect(em); onClose(); }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, padding: 4, borderRadius: 6, transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2d2d3f")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          {em}
        </button>
      ))}
    </div>
  );
}

// ─── Reaction Bar ─────────────────────────────────────────────────────────────
function ReactionBar({ reactions = {}, currentUser, onToggle, onOpenPicker }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
      {Object.entries(reactions).map(([emoji, users]) =>
        users.length > 0 ? (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            title={users.join(", ")}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 12,
              border: users.includes(currentUser?.name)
                ? "1px solid #4f46e5" : "1px solid #2d2d3f",
              background: users.includes(currentUser?.name)
                ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.04)",
              cursor: "pointer", fontSize: 13, color: "#c9d1d9",
              transition: "all 0.15s",
            }}
          >
            <span>{emoji}</span>
            <span style={{ fontWeight: 600 }}>{users.length}</span>
          </button>
        ) : null
      )}
      <button
        onClick={onOpenPicker}
        style={{
          padding: "2px 8px", borderRadius: 12,
          border: "1px dashed #2d2d3f", background: "none",
          cursor: "pointer", fontSize: 13, color: "#6e7681",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2d2d3f")}
      >
        + 😀
      </button>
    </div>
  );
}

// ─── Mention Suggestion Dropdown ──────────────────────────────────────────────
function MentionDropdown({ suggestions, onSelect }) {
  if (!suggestions.length) return null;
  return (
    <div
      style={{
        position: "absolute", top: "calc(100% + 4px)", left: 0,
        background: "#1e1e2e", border: "1px solid #2d2d3f", borderRadius: 8,
        overflow: "hidden", zIndex: 200, minWidth: 180,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {suggestions.map((u) => (
        <div
          key={u.id}
          onClick={() => onSelect(u)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 12px", cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2d2d3f")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <Avatar user={u} size={24} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3" }}>{u.name}</div>
            <div style={{ fontSize: 11, color: "#6e7681" }}>{u.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Single Comment ───────────────────────────────────────────────────────────
function Comment({
  comment, currentUser, allUsers,
  onEdit, onDelete, onReact, onReply, depth = 0,
}) {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const reactionRef = useRef();

  const isOwner = currentUser?.name === comment.author?.name;

  function saveEdit() {
    if (editText.trim()) { onEdit(comment.id, editText.trim()); setEditing(false); }
  }

  function submitReply() {
    if (replyText.trim()) {
      onReply(comment.id, replyText.trim());
      setReplyText("");
      setShowReplyBox(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, marginLeft: depth * 32 }}>
      <Avatar user={comment.author} size={32} />
      <div style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#e6edf3" }}>{comment.author?.name}</span>
          <span style={{ fontSize: 11, color: "#6e7681" }}>{timeAgo(comment.createdAt)}</span>
          {comment.edited && <span style={{ fontSize: 11, color: "#6e7681", fontStyle: "italic" }}>(edited)</span>}
        </div>

        {/* Body */}
        {editing ? (
          <div style={{ position: "relative" }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              rows={3}
              style={{
                width: "100%", boxSizing: "border-box", padding: "8px 10px",
                background: "#161622", border: "1px solid #4f46e5", borderRadius: 8,
                color: "#e6edf3", fontSize: 13, resize: "vertical", outline: "none",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <button onClick={saveEdit} style={btnStyle("#4f46e5")}>Save</button>
              <button onClick={() => { setEditing(false); setEditText(comment.text); }} style={btnStyle("#2d2d3f")}>Cancel</button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: 13, color: "#c9d1d9", lineHeight: 1.6,
              background: "rgba(255,255,255,0.03)", borderRadius: 8,
              padding: "8px 12px", position: "relative",
            }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
          >
            <span dangerouslySetInnerHTML={{ __html: highlightMentions(comment.text) }} />

            {/* Inline actions */}
            {showActions && (
              <div
                style={{
                  position: "absolute", top: 6, right: 8,
                  display: "flex", gap: 4, alignItems: "center",
                }}
              >
                <ActionBtn title="Reply" onClick={() => setShowReplyBox((v) => !v)}>↩</ActionBtn>
                <div style={{ position: "relative" }} ref={reactionRef}>
                  <ActionBtn title="React" onClick={() => setShowEmojiPicker((v) => !v)}>😀</ActionBtn>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onSelect={(em) => onReact(comment.id, em)}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </div>
                {isOwner && (
                  <>
                    <ActionBtn title="Edit" onClick={() => setEditing(true)}>✏️</ActionBtn>
                    <ActionBtn title="Delete" onClick={() => onDelete(comment.id)} danger>🗑</ActionBtn>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reactions */}
        {!editing && (
          <div style={{ position: "relative" }}>
            <ReactionBar
              reactions={comment.reactions || {}}
              currentUser={currentUser}
              onToggle={(em) => onReact(comment.id, em)}
              onOpenPicker={() => setShowEmojiPicker((v) => !v)}
            />
          </div>
        )}

        {/* Reply Box */}
        {showReplyBox && (
          <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Avatar user={currentUser} size={24} />
            <div style={{ flex: 1 }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                autoFocus
                style={{
                  width: "100%", boxSizing: "border-box", padding: "6px 10px",
                  background: "#161622", border: "1px solid #2d2d3f", borderRadius: 8,
                  color: "#e6edf3", fontSize: 13, resize: "none", outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitReply(); }}
              />
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                <button onClick={submitReply} style={btnStyle("#4f46e5")}>Reply</button>
                <button onClick={() => setShowReplyBox(false)} style={btnStyle("#2d2d3f")}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies?.map((reply) => (
          <Comment
            key={reply.id}
            comment={reply}
            currentUser={currentUser}
            allUsers={allUsers}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
            onReply={onReply}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function ActionBtn({ children, onClick, title, danger }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: danger ? "rgba(220,38,38,0.12)" : "rgba(255,255,255,0.07)",
        border: "none", borderRadius: 6, padding: "2px 6px",
        cursor: "pointer", fontSize: 12, color: danger ? "#f87171" : "#8b949e",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </button>
  );
}

function btnStyle(bg) {
  return {
    padding: "4px 12px", borderRadius: 6, border: "none",
    background: bg, color: "#fff", fontSize: 12,
    cursor: "pointer", fontWeight: 600, transition: "opacity 0.15s",
  };
}

function highlightMentions(text = "") {
  return text.replace(/@(\w+)/g, '<span style="color:#818cf8;font-weight:600;">@$1</span>');
}

// ─── Composer ─────────────────────────────────────────────────────────────────
function CommentComposer({ currentUser, allUsers, onSubmit }) {
  const [text, setText] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef();

  function handleChange(e) {
    const val = e.target.value;
    setText(val);
    const match = val.slice(0, e.target.selectionStart).match(/@(\w*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      setMentionQuery(q);
      setMentionSuggestions(
        allUsers.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 5)
      );
    } else {
      setMentionSuggestions([]);
    }
  }

  function insertMention(user) {
    const cursor = textareaRef.current.selectionStart;
    const before = text.slice(0, cursor).replace(/@\w*$/, `@${user.name.replace(" ", "")} `);
    const after = text.slice(cursor);
    setText(before + after);
    setMentionSuggestions([]);
    textareaRef.current.focus();
  }

  function handleSubmit() {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid #2d2d3f",
        borderRadius: 10, padding: 12, position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Avatar user={currentUser} size={32} />
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            placeholder="Add a comment... Use @ to mention teammates"
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box", padding: "8px 10px",
              background: "#161622", border: "1px solid #2d2d3f", borderRadius: 8,
              color: "#e6edf3", fontSize: 13, resize: "none", outline: "none",
              fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
            onBlur={(e) => (e.target.style.borderColor = "#2d2d3f")}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          />
          <MentionDropdown suggestions={mentionSuggestions} onSelect={insertMention} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <div style={{ display: "flex", gap: 6, position: "relative" }}>
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            style={{
              background: "none", border: "1px solid #2d2d3f", borderRadius: 6,
              padding: "4px 8px", cursor: "pointer", fontSize: 14, color: "#8b949e",
            }}
            title="Add emoji"
          >😀</button>
          {showEmojiPicker && (
            <EmojiPicker
              onSelect={(em) => { setText((t) => t + em); setShowEmojiPicker(false); }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
          <span style={{ fontSize: 11, color: "#6e7681", alignSelf: "center" }}>
            ⌘↵ to send
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          style={{
            padding: "6px 16px", borderRadius: 8, border: "none",
            background: text.trim() ? "#4f46e5" : "#2d2d3f",
            color: text.trim() ? "#fff" : "#6e7681",
            fontSize: 13, fontWeight: 600, cursor: text.trim() ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          Comment
        </button>
      </div>
    </div>
  );
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: "Alice Johnson", role: "Designer" },
  { id: 2, name: "Bob Smith", role: "Engineer" },
  { id: 3, name: "Carol White", role: "PM" },
  { id: 4, name: "David Lee", role: "Engineer" },
];

const CURRENT_USER = MOCK_USERS[0];

function makeComment(id, authorIdx, text, repliesArr = []) {
  return {
    id,
    author: MOCK_USERS[authorIdx],
    text,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    edited: false,
    reactions: { "👍": ["Bob Smith"], "🔥": [] },
    replies: repliesArr,
  };
}

const INITIAL_COMMENTS = [
  makeComment(1, 1, "Hey @AliceJohnson, can you check the design for the modal header?", [
    makeComment(11, 0, "Sure! I'll update the Figma file today.", []),
  ]),
  makeComment(2, 2, "This task is blocking the release. Let's prioritize it for sprint 22."),
  makeComment(3, 3, "I've pushed a fix for the overflow bug. Ready for review 🚀"),
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TaskComments({ taskId, currentUser = CURRENT_USER }) {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [filter, setFilter] = useState("all"); // all | mentions | mine
  const [sortDesc, setSortDesc] = useState(true);

  // Add top-level comment
  function handleAddComment(text) {
    const newComment = {
      id: Date.now(),
      author: currentUser,
      text,
      createdAt: new Date().toISOString(),
      edited: false,
      reactions: {},
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
  }

  // Edit any comment (top-level or reply)
  function handleEdit(id, newText) {
    setComments((prev) => editInTree(prev, id, newText));
  }

  function editInTree(list, id, newText) {
    return list.map((c) => {
      if (c.id === id) return { ...c, text: newText, edited: true };
      if (c.replies?.length) return { ...c, replies: editInTree(c.replies, id, newText) };
      return c;
    });
  }

  // Delete
  function handleDelete(id) {
    setComments((prev) => deleteInTree(prev, id));
  }

  function deleteInTree(list, id) {
    return list
      .filter((c) => c.id !== id)
      .map((c) => ({ ...c, replies: deleteInTree(c.replies || [], id) }));
  }

  // React (toggle)
  function handleReact(commentId, emoji) {
    setComments((prev) => reactInTree(prev, commentId, emoji));
  }

  function reactInTree(list, id, emoji) {
    return list.map((c) => {
      if (c.id === id) {
        const current = c.reactions?.[emoji] || [];
        const hasReacted = current.includes(currentUser.name);
        return {
          ...c,
          reactions: {
            ...c.reactions,
            [emoji]: hasReacted
              ? current.filter((n) => n !== currentUser.name)
              : [...current, currentUser.name],
          },
        };
      }
      if (c.replies?.length) return { ...c, replies: reactInTree(c.replies, id, emoji) };
      return c;
    });
  }

  // Reply
  function handleReply(parentId, text) {
    const reply = {
      id: Date.now(),
      author: currentUser,
      text,
      createdAt: new Date().toISOString(),
      edited: false,
      reactions: {},
      replies: [],
    };
    setComments((prev) => addReplyInTree(prev, parentId, reply));
  }

  function addReplyInTree(list, parentId, reply) {
    return list.map((c) => {
      if (c.id === parentId) return { ...c, replies: [...(c.replies || []), reply] };
      if (c.replies?.length) return { ...c, replies: addReplyInTree(c.replies, parentId, reply) };
      return c;
    });
  }

  // Filter + sort
  const filtered = comments
    .filter((c) => {
      if (filter === "mentions") return c.text.includes(`@${currentUser.name.replace(" ", "")}`);
      if (filter === "mine") return c.author?.name === currentUser.name;
      return true;
    })
    .sort((a, b) =>
      sortDesc
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  const totalCount = countAll(comments);

  function countAll(list) {
    return list.reduce((acc, c) => acc + 1 + countAll(c.replies || []), 0);
  }

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
        background: "#0d0d1a",
        color: "#e6edf3",
        minHeight: "100vh",
        padding: 24,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          💬 Comments <span style={{ color: "#6e7681", fontWeight: 400, fontSize: 14 }}>({totalCount})</span>
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "mentions", "mine"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                background: filter === f ? "#4f46e5" : "rgba(255,255,255,0.06)",
                color: filter === f ? "#fff" : "#8b949e",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setSortDesc((v) => !v)}
            style={{
              padding: "4px 10px", borderRadius: 20, border: "1px solid #2d2d3f",
              cursor: "pointer", fontSize: 12, background: "none", color: "#8b949e",
            }}
            title="Toggle sort order"
          >
            {sortDesc ? "↓ Newest" : "↑ Oldest"}
          </button>
        </div>
      </div>

      {/* Composer */}
      <div style={{ marginBottom: 24 }}>
        <CommentComposer
          currentUser={currentUser}
          allUsers={MOCK_USERS}
          onSubmit={handleAddComment}
        />
      </div>

      {/* Comments list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6e7681" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
          <div>No comments yet. Start the conversation!</div>
        </div>
      ) : (
        filtered.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            allUsers={MOCK_USERS}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReact={handleReact}
            onReply={handleReply}
            depth={0}
          />
        ))
      )}
    </div>
  );
}