import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CheckCheck, MessageCircle, Send, UserRound } from "lucide-react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function MessagesPanel() {
  const me = trpc.auth.me.useQuery();
  const inbox = trpc.chat.inbox.useQuery(undefined, { enabled: Boolean(me.data) });
  const [selectedId, setSelectedId] = useState<number | null>(() => { const value = new URLSearchParams(window.location.search).get("conversation"); return value ? Number(value) : null; });
  const selected = inbox.data?.find((conversation) => conversation.id === selectedId) ?? inbox.data?.[0];
  const thread = trpc.chat.messages.useQuery({ conversationId: selected?.id ?? 0 }, { enabled: Boolean(selected?.id), refetchInterval: 8000 });
  const sendMessage = trpc.chat.sendMessage.useMutation({ onSuccess: () => { thread.refetch(); inbox.refetch(); } });

  useEffect(() => { if (!selectedId && inbox.data?.[0]) setSelectedId(inbox.data[0].id); }, [inbox.data, selectedId]);
  if (me.isLoading) return <div className="messages-loading">Loading messages…</div>;
  if (!me.data) return <section className="messages-login"><MessageCircle size={28} /><h2>Chat securely inside A&O</h2><p>Only signed-in buyers and sellers can message each other. Your conversations stay attached to the property and never require sharing personal contact details first.</p><button className="gold-btn" onClick={() => startLogin()}>Sign in to view messages <ArrowRight size={15} /></button></section>;

  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const body = String(form.get("body") || "").trim(); if (!selected?.id || !body) return; sendMessage.mutate({ conversationId: selected.id, body }); event.currentTarget.reset(); };
  return <section className="messages-workspace"><div className="messages-sidebar"><div className="messages-sidebar-head"><div><p className="eyebrow">PRIVATE INBOX</p><h2>Messages</h2></div><MessageCircle size={20} /></div>{inbox.data?.map((conversation) => <button key={conversation.id} className={selected?.id === conversation.id ? "conversation-row active" : "conversation-row"} onClick={() => setSelectedId(conversation.id)}><span className="conversation-avatar"><UserRound size={14} /></span><span className="conversation-copy"><strong>{conversation.otherParticipant.name}</strong><small>{conversation.listingTitle}</small><em>{conversation.lastMessage?.body || "Conversation started"}</em></span>{conversation.unreadCount ? <b>{conversation.unreadCount}</b> : null}</button>)}{!inbox.data?.length && <div className="messages-empty"><MessageCircle size={20} /><p>Your conversations will appear here when you contact a signed-in seller or a buyer messages you.</p><a href="/">Browse listings <ArrowRight size={13} /></a></div>}</div><div className="message-thread">{selected ? <><header className="message-thread-head"><div><p className="eyebrow">{selected.listingLocation}</p><h2>{selected.listingTitle}</h2><small>Conversation with {selected.otherParticipant.name}</small></div><span className="secure-chip"><CheckCheck size={13} /> Signed-in members</span></header><div className="message-list">{thread.data?.map((message) => <div className={message.senderUserId === me.data?.id ? "message-bubble mine" : "message-bubble"} key={message.id}><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleString()}</small></div>)}</div><form className="message-compose" onSubmit={submit}><input name="body" required maxLength={4000} placeholder="Write a message about this property…" /><button className="gold-btn" disabled={sendMessage.isPending}><Send size={15} /> Send</button></form></> : <div className="thread-empty"><MessageCircle size={31} /><h2>Select a conversation</h2><p>Choose a conversation to read messages and reply.</p></div>}</div></section>;
}
