"use client";

import { Check, CornerUpLeft, Crown, Dice5, MessageCircle, Pencil, Pin, Search, Send, Shield, Trash2, UserRound, VenetianMask, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Character, ChatFilter, DiceRequest, Message, Npc, RoomTyping } from "@/lib/types";
import { cn, shortTime } from "@/lib/utils";

const TECHNICAL_MESSAGE_PREFIXES = ["__gdr_map_sync__:"];

type ChatPanelProps = {
  messages: Message[];
  value: string;
  onChange: (value: string) => void;
  onSend: (text?: string) => void;
  disabled?: boolean;
  disabledReason?: string;
  onDeleteMessage?: (message: Message) => void;
  onEditMessage?: (message: Message, content: string) => void;
  onTogglePin?: (message: Message) => void;
  onTyping?: () => void;
  onLoadOlder?: () => void;
  hasOlderMessages?: boolean;
  currentUserId?: string;
  isMaster?: boolean;
  typing?: RoomTyping[];
  characters?: Character[];
  npcs?: Npc[];
  showAvatars?: boolean;
  diceRequests?: DiceRequest[];
  onRollDice?: (request: DiceRequest) => void;
  identityId?: string;
  onIdentityChange?: (id: string) => void;
};

export function ChatPanel({
  messages,
  value,
  onChange,
  onSend,
  disabled = false,
  disabledReason,
  onDeleteMessage,
  onEditMessage,
  onTogglePin,
  onTyping,
  onLoadOlder,
  hasOlderMessages = false,
  currentUserId,
  isMaster = false,
  typing = [],
  characters = [],
  npcs = [],
  showAvatars = false,
  diceRequests = [],
  onRollDice,
  identityId,
  onIdentityChange
}: ChatPanelProps) {
  const [filter, setFilter] = useState<ChatFilter>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const visibleMessages = useMemo(() => messages.filter((message) => !isTechnicalMessage(message)), [messages]);
  const latestOwnMessageId = [...visibleMessages].reverse().find((message) => message.sender_user_id === currentUserId)?.id;

  const feedItems = useMemo(() => {
    const msgs = visibleMessages.map((m) => ({ ...m, feedType: "message" as const }));
    const reqs = (diceRequests || [])
      .filter((req) => {
        const isTarget = !req.target_user_id || req.target_user_id === currentUserId;
        return isMaster || isTarget;
      })
      .map((req) => ({
        id: `dice-request-${req.id}`,
        created_at: req.created_at,
        feedType: "dice-request" as const,
        request: req
      }));
    return [...msgs, ...reqs].sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [visibleMessages, diceRequests, currentUserId, isMaster]);

  const filteredFeed = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return feedItems.filter((item) => {
      if (item.feedType === "message") {
        const message = item;
        if (filter === "master" && message.sender_type !== "master") return false;
        if (filter === "npc" && message.sender_type !== "npc") return false;
        if (filter === "player" && message.sender_type !== "player") return false;
        if (filter === "dice" && !message.content.toLowerCase().includes("tira d")) return false;
        if (filter === "pinned" && !message.is_pinned) return false;
        if (normalized && !`${message.sender_display_name} ${message.content}`.toLowerCase().includes(normalized)) return false;
        return true;
      } else {
        const req = item.request;
        if (filter === "master") return true;
        if (filter === "npc") return false;
        if (filter === "player") return true;
        if (filter === "dice") return true;
        if (filter === "pinned") return false;
        if (normalized && !`richiesta tiro dadi ${req.reason}`.toLowerCase().includes(normalized)) return false;
        return true;
      }
    });
  }, [feedItems, filter, search]);

  const activeTyping = typing.filter((item) => item.user_id !== currentUserId && item.channel === "gdr" && Date.now() - new Date(item.updated_at).getTime() < 6000);
  const prevMessagesLength = useRef(messages.length);

  // Sound effects trigger for incoming messages
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        const text = lastMessage.content.toLowerCase();
        const elapsed = Date.now() - new Date(lastMessage.created_at).getTime();
        const isRecent = elapsed < 5000;

        if (isRecent) {
          import("@/lib/sound-generator").then((mod) => {
            const hasKeyword = (kw: string) => text.includes(`*${kw}*`);
            if (hasKeyword("esplosione")) {
              mod.playUiCinematicDanger();
            } else if (hasKeyword("magia") || hasKeyword("incantesimo")) {
              mod.playUiCinematicReveal();
            } else if (hasKeyword("terremoto") || hasKeyword("crollo")) {
              mod.playUiCinematicEarthquake();
            } else if (hasKeyword("visione") || hasKeyword("silenzio")) {
              mod.playUiCinematicVision();
            } else if (hasKeyword("sussurro") || hasKeyword("segreto")) {
              mod.playUiWhisper();
            } else if (text.includes("risultato:") || text.includes("tira d")) {
              if (text.includes("critico") || text.includes("successo critico") || text.includes("20 critico")) {
                mod.playUiCriticalSuccess();
              } else if (text.includes("fallimento") || text.includes("fallimento critico") || text.includes(" 1 ") || text.includes("1 critico")) {
                mod.playUiCriticalFailure();
              } else {
                mod.playUiDiceRoll();
              }
            } else if (lastMessage.is_private) {
              mod.playUiWhisper();
            } else {
              mod.playUiClick();
            }
          });
        }
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  return (
    <section className="story-chat-panel glass-panel flex min-h-[34rem] flex-col rounded-lg">
      <header className="story-chat-header flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-brass" />
          <div>
            <h2 className="font-serif text-base text-white">Chat comune</h2>
            <p className="text-xs text-stone-500">Registro narrativo della sessione</p>
          </div>
        </div>
        <span className="story-status-badge rounded-md border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
          {disabled ? "chat bloccata" : "realtime ready"}
        </span>
      </header>

      <div className="grid gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "Tutti"],
            ["master", "Master"],
            ["npc", "NPC"],
            ["player", "Giocatori"],
            ["dice", "Dadi"],
            ["pinned", "Pin"]
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onMouseEnter={() => {
                import("@/lib/sound-generator").then((mod) => mod.playUiHover());
              }}
              onClick={() => {
                import("@/lib/sound-generator").then((mod) => mod.playUiClick());
                setFilter(id as ChatFilter);
              }}
              className={cn("story-filter-pill", filter === id ? "is-active" : "")}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300">
          <Search size={15} />
          <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Cerca nella chat..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>

      <div className="scrollbar-soft flex-1 space-y-3 overflow-y-auto p-4">
        {hasOlderMessages && onLoadOlder ? (
          <button
            type="button"
            onClick={onLoadOlder}
            className="mx-auto flex rounded-md border border-brass/25 bg-brass/10 px-3 py-2 text-xs font-medium text-brass hover:bg-brass/15"
          >
            Carica messaggi precedenti
          </button>
        ) : null}
        {filteredFeed.map((item) => {
          if (item.feedType === "dice-request") {
            const req = item.request;
            const isPending = req.status === "pending";
            const canRoll = isPending && onRollDice && !isMaster;
            const isTargetMe = !req.target_user_id || req.target_user_id === currentUserId;

            let outcomeClass = "dice-request-card--rolled";
            if (req.status === "rolled" && req.result !== undefined && req.result !== null) {
              if (req.dice_sides === 20 && req.result === 20) outcomeClass = "dice-request-card--crit-success";
              else if (req.dice_sides === 20 && req.result === 1) outcomeClass = "dice-request-card--crit-failure";
            } else if (isPending) {
              outcomeClass = "dice-request-card--pending";
            }

            return (
              <article
                key={item.id}
                className={cn("dice-request-card", outcomeClass)}
                role="status"
              >
                <div className="flex flex-col gap-2 pl-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1.5 font-serif">
                      <Dice5 size={12} /> Richiesta Regia
                    </span>
                    <time className="text-xs text-slate-500">{shortTime(req.created_at)}</time>
                  </div>
                  <p className="text-sm font-medium text-stone-100">
                    Richiesto tiro di <strong className="text-brass">d{req.dice_sides}</strong> per: &ldquo;{req.reason}&rdquo;
                  </p>
                  
                  {isPending ? (
                    <div className="mt-1">
                      {canRoll && isTargetMe ? (
                        <button
                          type="button"
                          onClick={() => onRollDice(req)}
                          className="dice-request-btn flex items-center gap-1.5"
                        >
                          <Dice5 size={14} />
                          Lancia d{req.dice_sides}
                        </button>
                      ) : (
                        <span className="text-xs italic text-stone-500 font-serif">In attesa del tiro...</span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <span>Tiro eseguito:</span>
                      <strong className="text-sm border border-emerald-400/30 rounded bg-emerald-500/10 px-2 py-0.5">
                        {req.result}
                      </strong>
                      {req.dice_sides === 20 && req.result === 20 && <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold animate-pulse">Critico!</span>}
                      {req.dice_sides === 20 && req.result === 1 && <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold animate-pulse">Fallimento Critico!</span>}
                    </div>
                  )}
                </div>
              </article>
            );
          }

          const message = item;
          const avatar = resolveChatAvatar(message, characters, npcs);
          const meta = messageMeta(message);
          const replyInfo = parseMessageReplies(message.content);
          const narrative = parseNarrativeContent(replyInfo.content);

          return (
            <article
              key={message.id}
              className={cn(
                "story-message",
                `story-message--${message.sender_type}`,
                meta.isDice ? "story-message--dice" : "",
                narrative.kind ? `story-message--narrative-${narrative.kind}` : "",
                message.is_private ? "story-message--private" : "",
                message.is_pinned ? "story-message--pinned" : "",
                showAvatars ? "grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3" : ""
              )}
            >
              {showAvatars ? (
                <div
                  className="chat-message-avatar"
                  style={avatar.url ? { backgroundImage: `url(${avatar.url})`, color: message.sender_color } : { color: message.sender_color }}
                  aria-hidden="true"
                >
                  {avatar.url ? "" : avatar.fallback}
                </div>
              ) : null}
              <div className="min-w-0">
                <div className="story-message-top flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="story-message-type">{meta.icon}{meta.label}</span>
                    <strong className="truncate text-sm" style={{ color: message.sender_color }}>
                      {message.sender_display_name}
                    </strong>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {message.is_pinned ? <Pin size={13} className="text-ember-200" /> : null}
                    <time className="text-xs text-slate-500">{shortTime(message.created_at)}</time>

                    {!message.is_private && message.sender_type !== "system" ? (
                      <button
                        type="button"
                        onClick={() => {
                          import("@/lib/sound-generator").then((mod) => mod.playUiClick());
                          setReplyTo(message);
                        }}
                        className="text-stone-400 hover:text-white"
                        title="Rispondi a questo messaggio"
                        aria-label="Rispondi"
                      >
                        <CornerUpLeft size={14} />
                      </button>
                    ) : null}

                    {onTogglePin && isMaster ? (
                      <button type="button" onClick={() => onTogglePin(message)} className="text-ember-200 hover:text-ember-100" title="Fissa messaggio" aria-label="Fissa messaggio">
                        <Pin size={14} />
                      </button>
                    ) : null}
                    {onEditMessage && message.id === latestOwnMessageId ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(message.id);
                          setEditingText(message.content);
                        }}
                        className="text-sky-200 hover:text-sky-100"
                        title="Modifica ultimo messaggio"
                        aria-label="Modifica ultimo messaggio"
                      >
                        <Pencil size={14} />
                      </button>
                    ) : null}
                    {onDeleteMessage && (isMaster || message.id === latestOwnMessageId) ? (
                      <button type="button" onClick={() => onDeleteMessage(message)} className="text-rose-200 hover:text-rose-100" title="Elimina messaggio" aria-label="Elimina messaggio">
                        <Trash2 size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
                {editingId === message.id ? (
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      onEditMessage?.(message, editingText);
                      setEditingId(null);
                    }}
                  >
                    <input className="field flex-1 px-3 py-2 text-sm" value={editingText} onChange={(event) => setEditingText(event.target.value)} />
                    <button className="rounded-md bg-emerald-500 px-2 text-ink-900" title="Salva modifica" aria-label="Salva modifica">
                      <Check size={15} />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="rounded-md border border-white/10 px-2 text-slate-200" title="Annulla modifica" aria-label="Annulla modifica">
                      <X size={15} />
                    </button>
                  </form>
                ) : (
                  <div className="story-message-content mt-1">
                    {replyInfo.replyToId ? (() => {
                      const parentMsg = messages.find((m) => m.id === replyInfo.replyToId);
                      const parentText = parentMsg
                        ? parentMsg.content.replace(/^\[(azione|pensiero|evento|reply-to)[^\]]*\]\s*/i, "").replace(/^\[reply-to:[^\]]+\]\s*/i, "")
                        : "[Messaggio non trovato]";
                      return (
                        <div className="mb-1.5 flex items-center gap-1.5 rounded chat-reply-quote border-l-2 px-2 py-1 text-xs text-stone-400 select-none">
                          <span className="font-semibold text-stone-300">
                            {replyInfo.replyToSender}:
                          </span>
                          <span className="truncate italic">
                            &ldquo;{parentText}&rdquo;
                          </span>
                        </div>
                      );
                    })() : null}

                    <p className="whitespace-pre-wrap text-sm leading-6 text-white">
                      {!meta.isDice && narrative.label ? <span className="story-narrative-label">{narrative.label}</span> : null}
                      {meta.isDice ? message.content : narrative.wrap ? <>“{narrative.content}”</> : narrative.content} {message.edited_at ? <span className="text-xs text-slate-500">(modificato)</span> : null}
                    </p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
        {!filteredFeed.length ? (
          <div className="story-empty-state">
            <MessageCircle size={24} />
            <p>Nessun messaggio da mostrare.</p>
            <span>La scena e ancora silenziosa: il primo intervento aprira il registro narrativo.</span>
          </div>
        ) : null}
      </div>
      {activeTyping.length ? (
        <p className="border-t border-white/10 px-4 py-2 text-xs text-slate-400">
          {activeTyping.map((item) => item.display_name).join(", ")} sta scrivendo...
        </p>
      ) : null}

      <form
        className="border-t border-white/10 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          let finalContent = value;
          if (replyTo) {
            finalContent = `[reply-to:${replyTo.id}:${replyTo.sender_display_name}] ${finalContent}`;
            setReplyTo(null);
          }
          onSend(finalContent);
        }}
      >
        {replyTo ? (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-stone-400">
            <span className="truncate">
              Risposta a <strong style={{ color: replyTo.sender_color }}>{replyTo.sender_display_name}</strong>: &ldquo;{replyTo.content.replace(/^\[(azione|pensiero|evento|reply-to)[^\]]*\]\s*/i, "").replace(/^\[reply-to:[^\]]+\]\s*/i, "").slice(0, 45)}&rdquo;
            </span>
            <button
              type="button"
              onClick={() => {
                import("@/lib/sound-generator").then((mod) => mod.playUiClick());
                setReplyTo(null);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        ) : null}

        {isMaster && npcs && npcs.length > 0 && onIdentityChange && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5 border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase font-bold text-stone-500 mr-1">Scrivi come:</span>
            <button
              type="button"
              onClick={() => onIdentityChange("master")}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold transition border",
                identityId === "master"
                  ? "bg-brass/20 text-brass border-brass/45"
                  : "bg-white/[0.02] text-stone-400 border-white/5 hover:bg-white/[0.06]"
              )}
            >
              Master
            </button>
            {npcs.map((npc) => (
              <button
                key={npc.id}
                type="button"
                onClick={() => onIdentityChange(npc.id)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-semibold transition border",
                  identityId === npc.id
                    ? "border-brass/45 bg-brass/20 text-brass"
                    : "bg-white/[0.02] text-stone-400 border-white/5 hover:bg-white/[0.06]"
                )}
                style={identityId === npc.id ? {} : { color: npc.color }}
              >
                {npc.name}
              </button>
            ))}
          </div>
        )}

        <div className="mb-2 flex flex-wrap gap-2">
          {narrativeModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className="story-compose-mode"
              onClick={() => onChange(applyNarrativePrefix(value, mode.prefix))}
              disabled={disabled}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            className="field min-h-12 flex-1 resize-none px-3 py-3 text-sm"
            placeholder={disabled ? (disabledReason ?? "Chat disattivata dal Master") : "Scrivi in scena... Shift+Invio va a capo"}
            value={value}
            onChange={(event) => {
              onChange(event.target.value);
              if (event.target.value.trim()) onTyping?.();
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) return;
              event.preventDefault();
              
              let finalContent = value;
              if (replyTo) {
                finalContent = `[reply-to:${replyTo.id}:${replyTo.sender_display_name}] ${finalContent}`;
                setReplyTo(null);
              }
              onSend(finalContent);
            }}
            disabled={disabled}
          />
          <button
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ember-500 text-ink-900 transition hover:bg-ember-400 disabled:cursor-not-allowed disabled:opacity-45"
            type="submit"
            aria-label="Invia messaggio"
            title="Invia messaggio"
            disabled={disabled}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

function messageMeta(message: Message) {
  const lowered = message.content.toLowerCase();
  const isDice = lowered.includes("tira d") || lowered.includes("risultato:");
  if (isDice) return { label: "Tiro", icon: <Dice5 size={13} />, isDice };
  if (message.is_private) return { label: "Sussurro", icon: <Shield size={13} />, isDice };
  if (message.sender_type === "master") return { label: "Narratore", icon: <Crown size={13} />, isDice };
  if (message.sender_type === "npc") return { label: "NPC", icon: <VenetianMask size={13} />, isDice };
  if (message.sender_type === "system") return { label: "Sistema", icon: <Shield size={13} />, isDice };
  return { label: "Giocatore", icon: <UserRound size={13} />, isDice };
}

const narrativeModes = [
  { id: "dialogue", label: "Dialogo", prefix: "" },
  { id: "action", label: "Azione", prefix: "[azione] " },
  { id: "thought", label: "Pensiero", prefix: "[pensiero] " },
  { id: "event", label: "Evento", prefix: "[evento] " }
];

function applyNarrativePrefix(value: string, prefix: string) {
  const stripped = value.replace(/^\[(azione|pensiero|evento|capitolo|sussurro)\]\s*/i, "");
  return `${prefix}${stripped}`.trimStart();
}

function parseNarrativeContent(content: string) {
  const match = content.match(/^\[(azione|pensiero|evento|capitolo|sussurro)\]\s*(.*)$/i);
  if (!match) {
    return { kind: "", label: "", content, wrap: false };
  }

  const kind = match[1].toLowerCase();
  return {
    kind,
    label: narrativeLabel(kind),
    content: match[2],
    wrap: kind === "sussurro"
  };
}

function narrativeLabel(kind: string) {
  if (kind === "azione") return "Azione";
  if (kind === "pensiero") return "Pensiero";
  if (kind === "evento") return "Evento";
  if (kind === "capitolo") return "Capitolo";
  if (kind === "sussurro") return "Sussurro";
  return "";
}

function resolveChatAvatar(message: Message, characters: Character[], npcs: Npc[]) {
  if (message.sender_type === "npc" && message.npc_id) {
    const npc = npcs.find((item) => item.id === message.npc_id);
    return { url: npc?.portrait_url ?? "", fallback: npc?.name.slice(0, 1).toUpperCase() ?? "N" };
  }

  if (message.sender_type === "player" && message.sender_user_id) {
    const character = characters.find((item) => item.user_id === message.sender_user_id);
    return {
      url: character?.portrait_url ?? "",
      fallback: (character?.character_name ?? message.sender_display_name).slice(0, 1).toUpperCase()
    };
  }

  return { url: "", fallback: "M" };
}

function isTechnicalMessage(message: Message) {
  return TECHNICAL_MESSAGE_PREFIXES.some((prefix) => message.content.startsWith(prefix));
}

function parseMessageReplies(content: string) {
  const match = content.match(/^\[reply-to:([^:]+):([^\]]+)\]\s*(.*)$/i);
  if (!match) return { replyToId: null, replyToSender: null, content };
  return {
    replyToId: match[1],
    replyToSender: match[2],
    content: match[3]
  };
}

function filterMessages(messages: Message[], filter: ChatFilter, search: string) {
  const normalized = search.trim().toLowerCase();

  return messages.filter((message) => {
    if (filter === "master" && message.sender_type !== "master") return false;
    if (filter === "npc" && message.sender_type !== "npc") return false;
    if (filter === "player" && message.sender_type !== "player") return false;
    if (filter === "dice" && !message.content.toLowerCase().includes("tira d")) return false;
    if (filter === "pinned" && !message.is_pinned) return false;
    if (normalized && !`${message.sender_display_name} ${message.content}`.toLowerCase().includes(normalized)) return false;
    return true;
  });
}
