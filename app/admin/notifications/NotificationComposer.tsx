"use client";

import { useState, useMemo, useTransition, useRef } from "react";
import type { UserRow } from "./page";
import { sendNotificationAction } from "./action";
import {
  Bell, Users, Search, X, CheckSquare, Square,
  Send, AlertTriangle, CheckCircle2, Loader2,
  Phone, User, Wifi, WifiOff, ChevronDown
} from "lucide-react";

// ─────────────────────────── TOAST ───────────────────────────────────────────
function Toast({ msg, success }: { msg: string; success: boolean }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
      px-5 py-3 rounded-xl shadow-xl text-sm font-medium text-white
      ${success ? "bg-green-600" : "bg-red-600"}`}>
      {success
        ? <CheckCircle2 size={16} />
        : <AlertTriangle size={16} />}
      {msg}
    </div>
  );
}

// ─────────────────────────── MAIN COMPONENT ──────────────────────────────────
export default function NotificationComposer({ users }: { users: UserRow[] }) {
  const [title,     setTitle]     = useState("");
  const [body,      setBody]      = useState("");
  const [mode,      setMode]      = useState<"all" | "selected">("all");
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [toast,     setToast]     = useState<{ msg: string; success: boolean } | null>(null);
  const [isPending, startTrans]   = useTransition();
  const formRef                   = useRef<HTMLFormElement>(null);

  function showToast(msg: string, success: boolean) {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Filter users by search ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((u) =>
      u.name?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const usersWithToken    = users.filter((u) => u.fcm_token);
  const selectedWithToken = [...selected].filter((id) =>
    users.find((u) => u.id === id)?.fcm_token
  );

  // ── Select / deselect ─────────────────────────────────────────────────────
  function toggleUser(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filtered.map((u) => u.id)));
  }

  function selectAllWithToken() {
    setSelected(new Set(filtered.filter((u) => u.fcm_token).map((u) => u.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!title.trim()) { showToast("Title is required.", false); return; }
    if (!body.trim())  { showToast("Message is required.", false); return; }
    if (mode === "selected" && selected.size === 0) {
      showToast("Select at least one user.", false);
      return;
    }

    const fd = new FormData();
    fd.set("title",  title);
    fd.set("body",   body);
    fd.set("target", mode);
    if (mode === "selected") {
      fd.set("uids", [...selected].join(","));
    }

    startTrans(async () => {
      const result = await sendNotificationAction(null, fd);
      showToast(result.message, result.success);
      if (result.success) {
        setTitle("");
        setBody("");
        setSelected(new Set());
      }
    });
  }

  const canSend = title.trim() && body.trim() &&
    (mode === "all" || selected.size > 0);

  // ── Recipient summary ──────────────────────────────────────────────────────
  const recipientCount = mode === "all"
    ? usersWithToken.length
    : selectedWithToken.length;

  return (
    <div className="space-y-6">

      {/* ── COMPOSE CARD ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EDEDED] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0D0D0D] flex items-center justify-center">
            <Bell size={15} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-[#0D0D0D] text-sm">Compose Notification</h2>
            <p className="text-xs text-[#B0B0B0]">Sent via Firebase Cloud Messaging</p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#3A3A3A] uppercase tracking-wide mb-1.5">
              Notification Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Property Available 🏠"
              maxLength={65}
              className="w-full px-4 py-2.5 text-sm border border-[#EDEDED] rounded-xl bg-[#F7F7F7] focus:bg-white focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]/10 transition-all placeholder:text-[#B0B0B0] text-[#0D0D0D]"
            />
            <p className="text-[10px] text-[#B0B0B0] mt-1 text-right">{title.length}/65</p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-[#3A3A3A] uppercase tracking-wide mb-1.5">
              Message *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. Sunrise Homes is now live on Vardaan Properties!"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-[#EDEDED] rounded-xl bg-[#F7F7F7] focus:bg-white focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]/10 transition-all placeholder:text-[#B0B0B0] text-[#0D0D0D] resize-none"
            />
            <p className="text-[10px] text-[#B0B0B0] mt-1 text-right">{body.length}/200</p>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="bg-[#0D0D0D] rounded-xl p-4">
              <p className="text-[10px] text-[#B0B0B0] uppercase tracking-widest mb-2">
                Preview
              </p>
              <div className="bg-white/10 rounded-xl px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">
                    {title || "Title..."}
                  </p>
                  <p className="text-white/70 text-xs mt-0.5 leading-relaxed">
                    {body || "Message..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Target mode toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#3A3A3A] uppercase tracking-wide mb-2">
              Send To
            </label>
            <div className="flex gap-2">
              {(["all", "selected"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    mode === m
                      ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                      : "bg-[#F7F7F7] text-[#3A3A3A] border-[#EDEDED] hover:border-[#B0B0B0]"
                  }`}
                >
                  {m === "all"
                    ? <><Users size={14} /> All Users ({usersWithToken.length})</>
                    : <><CheckSquare size={14} /> Select Users</>
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Recipient count */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
            recipientCount > 0
              ? "bg-green-50 border-green-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <Bell size={14} className={recipientCount > 0 ? "text-green-600" : "text-amber-500"} />
            <span className={`text-xs font-semibold ${recipientCount > 0 ? "text-green-700" : "text-amber-700"}`}>
              {recipientCount > 0
                ? `Will be delivered to ${recipientCount} device${recipientCount > 1 ? "s" : ""}`
                : "No reachable devices selected"}
            </span>
          </div>

        </div>

        {/* Send button */}
        <div className="px-6 py-4 border-t border-[#EDEDED] bg-[#F7F7F7] flex items-center justify-between gap-4">
          <p className="text-xs text-[#B0B0B0]">
            Only users with the app installed and notifications enabled will receive it.
          </p>
          <button
            onClick={handleSubmit}
            disabled={!canSend || isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0D0D0D] text-white rounded-xl text-sm font-bold hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {isPending
              ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
              : <><Send size={15} /> Send Notification</>
            }
          </button>
        </div>
      </div>

      {/* ── USER PICKER (only when "selected" mode) ──────────────────── */}
      {mode === "selected" && (
        <div className="bg-white rounded-2xl border border-[#EDEDED] shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-[#EDEDED]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#0D0D0D] flex items-center justify-center">
                  <Users size={12} className="text-white" />
                </div>
                <h3 className="font-semibold text-[#0D0D0D] text-sm">
                  Select Users
                </h3>
                {selected.size > 0 && (
                  <span className="text-xs font-bold text-white bg-[#0D0D0D] px-2 py-0.5 rounded-full">
                    {selected.size} selected
                  </span>
                )}
              </div>

              {/* Bulk actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllWithToken}
                  className="text-xs font-medium text-[#3A3A3A] hover:text-[#0D0D0D] px-2.5 py-1.5 rounded-lg border border-[#EDEDED] hover:border-[#B0B0B0] transition-all bg-white"
                >
                  Select reachable
                </button>
                <button
                  onClick={selectAll}
                  className="text-xs font-medium text-[#3A3A3A] hover:text-[#0D0D0D] px-2.5 py-1.5 rounded-lg border border-[#EDEDED] hover:border-[#B0B0B0] transition-all bg-white"
                >
                  Select all
                </button>
                {selected.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-xs font-medium text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-lg border border-red-200 hover:border-red-400 transition-all bg-red-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0B0]" />
              <input
                type="text"
                placeholder="Search by name or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm border border-[#EDEDED] rounded-xl bg-[#F7F7F7] focus:bg-white focus:border-[#0D0D0D] focus:outline-none focus:ring-2 focus:ring-[#0D0D0D]/10 transition-all placeholder:text-[#B0B0B0] text-[#0D0D0D]"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#0D0D0D]">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Results count */}
            <p className="text-xs text-[#B0B0B0] mt-2">
              Showing {filtered.length} of {users.length} users
              {search && <span> for &quot;{search}&quot;</span>}
            </p>
          </div>

          {/* User list */}
          <div className="divide-y divide-[#F7F7F7] max-h-[480px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <Search size={20} className="text-[#B0B0B0]" />
                <p className="text-sm font-medium text-[#0D0D0D]">No users found</p>
                <p className="text-xs text-[#B0B0B0]">Try a different name or phone number</p>
              </div>
            ) : (
              filtered.map((user) => {
                const isSelected   = selected.has(user.id);
                const hasToken     = !!user.fcm_token;

                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                      isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-[#F7F7F7]"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      isSelected
                        ? "bg-[#0D0D0D] border-[#0D0D0D]"
                        : "bg-white border-[#EDEDED]"
                    }`}>
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-[#0D0D0D]" : "bg-[#F7F7F7]"
                    }`}>
                      <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-[#3A3A3A]"}`}>
                        {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                        {user.name ?? "Unknown"}
                      </p>
                      {user.phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-[#B0B0B0]" />
                          <span className="text-xs text-[#B0B0B0]">{user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Token status */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 ${
                      hasToken
                        ? "bg-green-100 text-green-700"
                        : "bg-[#F7F7F7] text-[#B0B0B0]"
                    }`}>
                      {hasToken
                        ? <><Wifi size={10} /><span className="text-[10px] font-semibold">Reachable</span></>
                        : <><WifiOff size={10} /><span className="text-[10px]">No token</span></>
                      }
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-[#EDEDED] bg-[#F7F7F7]">
              <p className="text-xs text-[#B0B0B0] text-center">
                {selected.size} selected · {selectedWithToken.length} reachable
                {selected.size > selectedWithToken.length && (
                  <span className="text-amber-500 ml-1">
                    ({selected.size - selectedWithToken.length} without token will be skipped)
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} success={toast.success} />}
    </div>
  );
}