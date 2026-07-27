import React, { useState, useEffect, useRef } from "react";
import { Headphones, X, Send, ChevronLeft } from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { useSocket } from "@context/other/SocketContext";
import {
  getLocalTickets,
  createSupportTicket,
  getTicketMessages,
  addSupportMessage,
  markTicketMessagesAsRead,
} from "@/services/support.api";
import type { SupportTicket, SupportMessage } from "@/interface/support";

export const LocalSupportWidget: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [localId, setLocalId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTicketType, setNewTicketType] = useState<string>("QUERY");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLocalId = async () => {
      if (user?.id) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users/${user.id}/local`);
          const data = await res.json();
          if (data?.id) {
            setLocalId(data.id);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchLocalId();
  }, [user]);

  useEffect(() => {
    if (isOpen && localId) {
      loadTickets();
    }
  }, [isOpen, localId]);

  useEffect(() => {
    if (activeTicket && socket) {
      loadMessages(activeTicket.id);
      socket.emit("join_ticket", activeTicket.id);

      socket.on("new_support_message", (msg: SupportMessage) => {
        if (msg.ticket_id === activeTicket.id) {
          setMessages((prev) => [...prev, msg]);
          if (msg.sender_role === "ADMIN") {
            markTicketMessagesAsRead(activeTicket.id, "ADMIN");
          }
        } else {
          // Si el mensaje es para otro ticket, recargamos la lista para actualizar el contador
          loadTickets();
        }
      });

      socket.on("ticket_status_updated", (ticket: SupportTicket) => {
        if (ticket.id === activeTicket.id) {
          setActiveTicket(ticket);
        }
      });

      return () => {
        socket.emit("leave_ticket", activeTicket.id);
        socket.off("new_support_message");
        socket.off("ticket_status_updated");
      };
    }
  }, [activeTicket, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadTickets = async () => {
    if (!localId) return;
    const res = await getLocalTickets(localId);
    if (res?.success) {
      setTickets(res.tickets);
    }
  };

  const loadMessages = async (ticketId: string) => {
    const res = await getTicketMessages(ticketId);
    if (res?.success) {
      setMessages(res.messages);
      await markTicketMessagesAsRead(ticketId, "ADMIN");
      loadTickets(); // Recargar para limpiar el contador
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketType || !localId) return;
    const res = await createSupportTicket(localId, newTicketType);
    if (res?.success) {
      setIsCreating(false);
      setTickets([res.ticket, ...tickets]);
      setActiveTicket(res.ticket);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || !user) return;

    const res = await addSupportMessage(
      activeTicket.id,
      user.id,
      "LOCAL",
      newMessage.trim()
    );

    if (res?.success) {
      setNewMessage("");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[550px] bg-white dark:bg-[#1e1e24] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 flex justify-between items-center shrink-0 shadow-sm relative z-10">
            {activeTicket ? (
              <button
                onClick={() => setActiveTicket(null)}
                className="flex items-center text-sm font-semibold text-white/90 hover:text-white transition-colors group cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 mr-1 transform group-hover:-translate-x-1 transition-transform" />
                Volver
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg tracking-tight">Soporte DualEat</h3>
              </div>
            )}
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#16161a] relative custom-scrollbar">
            {!activeTicket ? (
              <div className="p-5 h-full flex flex-col">
                {isCreating ? (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                      Nuevo Ticket
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">¿En qué podemos ayudarte hoy?</p>
                    <select
                      value={newTicketType}
                      onChange={(e) => setNewTicketType(e.target.value)}
                      className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e24] text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all shadow-sm font-medium cursor-pointer"
                    >
                      <option value="PAYMENT">Problema con pagos</option>
                      <option value="WEB">Problema con la Web</option>
                      <option value="QUERY">Consulta general</option>
                      <option value="OTHER">Otro</option>
                    </select>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setIsCreating(false)}
                        className="flex-1 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateTicket}
                        className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        Crear Ticket
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 h-full animate-in fade-in duration-300">
                    <button
                      onClick={() => setIsCreating(true)}
                      className="w-full py-4 border-2 border-dashed border-orange-500/50 bg-orange-50/50 dark:bg-orange-500/5 text-orange-500 font-bold rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-500/10 hover:border-orange-500 transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span className="text-xl group-hover:scale-125 transition-transform">+</span> Abrir Nuevo Ticket
                    </button>

                    <div className="flex justify-between items-center mt-2 px-1">
                      <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Tus Tickets</h4>
                      {tickets.length > 0 && (
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          {tickets.length}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 pb-4">
                      {tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                          <Headphones className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-sm font-medium">No tienes tickets activos.</p>
                          <p className="text-xs mt-1 text-gray-500 text-center px-4">Si necesitas ayuda, abre un ticket arriba.</p>
                        </div>
                      ) : (
                        tickets.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => setActiveTicket(t)}
                            className="p-4 bg-white dark:bg-[#1e1e24] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all group relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-orange-500 transition-colors" />
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-800 dark:text-gray-100">
                                  Ticket #{t.id.slice(-4)}
                                </span>
                                {t._count && t._count.messages > 0 && (
                                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                    {t._count.messages} nuevo
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                                  t.status === "OPEN"
                                    ? "bg-green-100/80 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                                    : t.status === "IN_PROGRESS"
                                    ? "bg-blue-100/80 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                                    : "bg-gray-100/80 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400"
                                }`}
                              >
                                {t.status === "OPEN" ? "Abierto" : t.status === "IN_PROGRESS" ? "En Progreso" : t.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t.type}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#16161a]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map((msg) => {
                    const isLocal = msg.sender_role === "LOCAL";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isLocal ? "items-end" : "items-start"
                        } animate-in fade-in slide-in-from-bottom-2`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                            isLocal
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm"
                              : "bg-white dark:bg-[#1e1e24] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                          }`}
                        >
                          {!isLocal && (
                            <p className="text-[11px] font-black uppercase text-orange-500 mb-1 tracking-wider">
                              Soporte DualEat
                            </p>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1.5 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} className="h-1" />
                </div>
                
                {/* Chat Input Area */}
                <div className="bg-white dark:bg-[#1e1e24] border-t border-gray-100 dark:border-gray-800 p-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] relative z-10">
                  {activeTicket.status !== "CLOSED" && activeTicket.status !== "RESOLVED" ? (
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                      <div className="flex-1 bg-gray-50 dark:bg-[#16161a] border border-gray-200 dark:border-gray-700 rounded-2xl focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all overflow-hidden flex">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Escribe tu mensaje aquí..."
                          className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none resize-none max-h-32 min-h-[44px] text-gray-800 dark:text-gray-200 placeholder-gray-400"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-orange-500 text-white rounded-xl h-[44px] w-[44px] flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Send className="w-5 h-5 -ml-0.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Este ticket ha sido cerrado.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full p-4 shadow-[0_8px_30px_rgba(249,115,22,0.3)] transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center z-50 group cursor-pointer"
      >
        {tickets.some((t) => t._count && t._count.messages > 0) && !isOpen && (
          <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-500 border-2 border-white dark:border-[#1e1e24] rounded-full w-4 h-4 shadow-sm animate-bounce" />
        )}
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <Headphones className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
        )}
      </button>
    </div>
  );
};
