"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Send, Bot, UserCircle, MessageSquareOff, AlertCircle, ToggleLeft, ToggleRight, CheckCheck } from "lucide-react"
import { getMessagesAction, toggleAIStatusAction, sendHumanMessageAction } from "./actions"
// If sonner is not installed, this will fail. We'll fallback to a custom alert just in case, but usually it's `sonner` or `react-hot-toast`.
// To be safe and framework-agnostic, I will use a simple inline UI error state if toast is not guaranteed, but I'll try to use a standard one or an internal error state.
// Let's use internal error state to guarantee it never crashes the build due to missing toast library.

type Conversation = {
    id: string
    lead_phone: string
    lead_name?: string
    status: string
    created_at: string
    updated_at: string
}

type Message = {
    id: string
    conversation_id: string
    sender_type: 'lead' | 'ai' | 'human_broker'
    agent_id?: string
    content: string
    created_at: string
}

export default function InboxClient({ initialConversations }: { initialConversations: Conversation[] }) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])

    const [inputText, setInputText] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)

    const [errorToast, setErrorToast] = useState<string | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Auto-scroll inside the chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch messages when conversation changes
    useEffect(() => {
        if (!activeConversation) return

        let isMounted = true;
        setIsLoadingMessages(true)
        getMessagesAction(activeConversation.id)
            .then((data) => {
                if (isMounted) {
                    setMessages(data)
                    setIsLoadingMessages(false)
                }
            })
            .catch((err) => {
                console.error(err);
                if (isMounted) setIsLoadingMessages(false)
            });

        return () => { isMounted = false }
    }, [activeConversation?.id])

    // Supabase Real-Time WebSockets
    useEffect(() => {
        // Subscribe to New Messages
        const messageSubscription = supabase
            .channel('public:whatsapp_messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' },
                (payload) => {
                    const newMsg = payload.new as Message
                    if (activeConversation && newMsg.conversation_id === activeConversation.id) {
                        setMessages((prev) => {
                            // Prevent duplicates in strict mode
                            if (prev.find(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg]
                        })
                    }
                }
            )
            .subscribe()

        // Subscribe to Conversation Status Changes
        const conversationSubscription = supabase
            .channel('public:whatsapp_conversations')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'whatsapp_conversations' },
                (payload) => {
                    const updatedConv = payload.new as Conversation
                    setConversations(prev =>
                        prev.map(c => c.id === updatedConv.id ? { ...c, status: updatedConv.status, updated_at: updatedConv.updated_at } : c)
                    )
                    if (activeConversation?.id === updatedConv.id) {
                        setActiveConversation(prev => prev ? { ...prev, status: updatedConv.status } : null)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(messageSubscription)
            supabase.removeChannel(conversationSubscription)
        }
    }, [activeConversation, supabase])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputText.trim() || !activeConversation || isSending) return

        setIsSending(true)
        setErrorToast(null) // Clear previous errors
        try {
            await sendHumanMessageAction(activeConversation.id, activeConversation.lead_phone, inputText)
            setInputText("")
            // We don't manually append to `messages` here because the RealTime socket will pick it up and inject it! 
            // This guarantees sync with the Database.
        } catch (err: any) {
            console.error(err)
            setErrorToast(err.message || "Failed to send message")

            // Auto hide error after 6 seconds
            setTimeout(() => setErrorToast(null), 6000)
        } finally {
            setIsSending(false)
        }
    }

    const handleToggleAI = async () => {
        if (!activeConversation) return

        // Optimistic UI update
        const newStatus = activeConversation.status === 'ai_active' ? 'human_intervened' : 'ai_active'
        setActiveConversation({ ...activeConversation, status: newStatus })

        try {
            await toggleAIStatusAction(activeConversation.id, activeConversation.status)
        } catch (error) {
            console.error(error)
            // Revert on fail
            setActiveConversation({ ...activeConversation })
            setErrorToast("Error al intentar cambiar el estado del bot.")
        }
    }

    return (
        <div className="flex w-full h-full bg-zinc-950 font-sans">

            {/* Left Panel: Chat List */}
            <div className="w-80 lg:w-96 border-r border-zinc-800 flex flex-col bg-zinc-900/40">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/80">
                    <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        <MessageSquareOff className="w-5 h-5 text-zinc-400" />
                        Inbox Omnicanal
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">Supervisión en tiempo real</p>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {conversations.length === 0 ? (
                        <div className="text-center p-8 text-zinc-500 text-sm">No hay conversaciones activas</div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConversation(conv)}
                                className={`w-full text-left p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors flex flex-col gap-1
                                    ${activeConversation?.id === conv.id ? 'bg-zinc-800/80' : ''}
                                `}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <span className="font-medium text-sm text-zinc-200 truncate">
                                        {conv.lead_name}
                                    </span>
                                    {conv.status === 'ai_active' ? (
                                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            AI Active
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                            Broker
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-500 truncate">{conv.lead_phone}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Chat Thread */}
            <div className="flex-1 flex flex-col relative bg-zinc-950">

                {/* 24h Meta Error Toast */}
                {errorToast && (
                    <div className="absolute top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded-lg shadow-xl flex items-start gap-3 max-w-md backdrop-blur-md">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="text-sm font-medium leading-tight">
                                {errorToast}
                            </div>
                            <button onClick={() => setErrorToast(null)} className="opacity-50 hover:opacity-100 text-red-200 transition-opacity">✕</button>
                        </div>
                    </div>
                )}

                {activeConversation ? (
                    <>
                        {/* Thread Header */}
                        <div className="h-16 px-6 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                    <UserCircle className="w-6 h-6 text-zinc-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-zinc-100">{activeConversation.lead_name}</h3>
                                    <p className="text-xs text-zinc-500">{activeConversation.lead_phone}</p>
                                </div>
                            </div>

                            {/* Kill Switch */}
                            <div className="flex gap-4 items-center border border-zinc-800 bg-zinc-950 rounded-full pl-4 pr-2 py-1.5">
                                <span className="text-sm font-medium text-zinc-300">
                                    {activeConversation.status === 'ai_active' ? 'Autopilot ON' : 'Autopilot OFF'}
                                </span>
                                <button
                                    onClick={handleToggleAI}
                                    className={`transition-colors ${activeConversation.status === 'ai_active' ? 'text-emerald-500' : 'text-zinc-600'}`}
                                    title={activeConversation.status === 'ai_active' ? "Click to mute AI" : "Click to reactivate AI"}
                                >
                                    {activeConversation.status === 'ai_active' ? (
                                        <ToggleRight className="w-8 h-8" />
                                    ) : (
                                        <ToggleLeft className="w-8 h-8" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Thread Body */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {isLoadingMessages ? (
                                <div className="flex-1 flex items-center justify-center items-center">
                                    <span className="text-zinc-500 text-sm animate-pulse">Cargando memoria...</span>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <span className="text-zinc-600 text-sm">No hay mensajes previos.</span>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isUser = msg.sender_type === 'lead';
                                    const isAI = msg.sender_type === 'ai';
                                    const isBroker = msg.sender_type === 'human_broker';

                                    return (
                                        <div key={msg.id} className={`flex flex-col max-w-[75%] ${isUser ? 'self-start' : 'self-end'}`}>
                                            <div className={`p-3 rounded-2xl ${isUser
                                                    ? 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
                                                    : isAI
                                                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tr-sm'
                                                        : 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-50 rounded-tr-sm'
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 text-[10px] text-zinc-500 ${isUser ? 'self-start ml-1' : 'self-end mr-1'}`}>
                                                {isAI && <Bot className="w-3 h-3 text-indigo-400" />}
                                                {isBroker && <UserCircle className="w-3 h-3 text-emerald-400" />}
                                                <span>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {!isUser && <CheckCheck className="w-3 h-3 text-zinc-600 ml-1" />}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Thread Input Footer */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                            {activeConversation.status === 'ai_active' && (
                                <div className="mb-3 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs text-indigo-300">
                                        La Inteligencia Artificial está respondiendo a este cliente. Apaga el piloto automático arriba para intervenir a mano.
                                    </span>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder={activeConversation.status === 'ai_active' ? "Desactiva la IA para enviar mensajes..." : "Escribe un mensaje al cliente..."}
                                    disabled={activeConversation.status === 'ai_active' || isSending}
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-full px-5 py-3 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 disabled:opacity-50 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || activeConversation.status === 'ai_active' || isSending}
                                    className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 border-l border-zinc-900 border-dashed m-8 rounded-3xl">
                        <MessageSquareOff className="w-12 h-12 text-zinc-800 mb-4" />
                        <h3 className="text-lg font-medium text-zinc-400">Ningún chat seleccionado</h3>
                        <p className="text-sm text-zinc-600 mt-2">Haz clic en una conversación del panel izquierdo para supervisarla.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
