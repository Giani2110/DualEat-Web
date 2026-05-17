import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@hooks/useAuth";
import { useSocket } from "@context/other/SocketContext";
import {
  getAdminTickets,
  getTicketMessages,
  addSupportMessage,
  updateTicketStatus,
  markTicketMessagesAsRead,
} from "@/services/support.api";
import type { SupportTicket, SupportMessage } from "@/interface/support";
import { Send, CheckCircle, Clock, AlertCircle } from "lucide-react";

export const AdminSupportTickets: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("admin_new_ticket", (ticket: SupportTicket) => {
        setTickets((prev) => [ticket, ...prev]);
      });

      socket.on("admin_ticket_updated", (updatedTicket: SupportTicket) => {
        setTickets((prev) =>
          prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
        );
        if (activeTicket?.id === updatedTicket.id) {
          setActiveTicket(updatedTicket);
        }
      });

      return () => {
        socket.off("admin_new_ticket");
        socket.off("admin_ticket_updated");
      };
    }
  }, [socket, activeTicket]);

  useEffect(() => {
    if (activeTicket && socket) {
      loadMessages(activeTicket.id);
      socket.emit("join_ticket", activeTicket.id);

      // Mark as read when opening
      markTicketMessagesAsRead(activeTicket.id, "LOCAL").then(() => {
        setTickets((prev) =>
          prev.map((t) => (t.id === activeTicket.id ? { ...t, _count: { messages: 0 } } : t))
        );
      });

      const handleNewMessage = (msg: SupportMessage) => {
        if (msg.ticket_id === activeTicket.id) {
          setMessages((prev) => [...prev, msg]);
          if (msg.sender_role === 'LOCAL') {
              markTicketMessagesAsRead(activeTicket.id, "LOCAL");
          }
        }
      };

      socket.on("new_support_message", handleNewMessage);

      return () => {
        socket.emit("leave_ticket", activeTicket.id);
        socket.off("new_support_message", handleNewMessage);
      };
    }
  }, [activeTicket, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadTickets = async () => {
    const res = await getAdminTickets();
    if (res?.success) {
      setTickets(res.tickets);
    }
  };

  const loadMessages = async (ticketId: string) => {
    const res = await getTicketMessages(ticketId);
    if (res?.success) {
      setMessages(res.messages);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || !user) return;

    const res = await addSupportMessage(
      activeTicket.id,
      user.id,
      "ADMIN",
      newMessage.trim()
    );

    if (res?.success) {
      setNewMessage("");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!activeTicket) return;
    const res = await updateTicketStatus(activeTicket.id, status);
    if (res?.success) {
      // Optimistic update handled by socket
    }
  };

  return (
    <div className="flex h-[calc(100vh-60px)] bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Lista de Tickets */}
      <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Tickets de Soporte
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {tickets.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No hay tickets.</p>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTicket(t)}
                className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors border ${
                  activeTicket?.id === t.id
                    ? "bg-blue-50 dark:bg-gray-700 border-blue-400"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {t.local?.image_url ? (
                      <img
                        src={t.local.image_url}
                        alt="Local"
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 mr-2 flex items-center justify-center text-xs">
                        {t.local?.name?.charAt(0) || "L"}
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {t.local?.name || "Local Desconocido"}
                    </h3>
                  </div>
                  {t._count?.messages ? (
                     <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                       {t._count.messages}
                     </span>
                  ) : null}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">#{t.id} - {t.type}</span>
                  <span
                    className={`flex items-center text-xs px-2 py-1 rounded-full ${
                      t.status === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : t.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t.status === 'OPEN' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {t.status === 'IN_PROGRESS' && <Clock className="w-3 h-3 mr-1" />}
                    {(t.status === 'RESOLVED' || t.status === 'CLOSED') && <CheckCircle className="w-3 h-3 mr-1" />}
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Area de Chat */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {activeTicket ? (
          <>
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  Ticket #{activeTicket.id}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeTicket.local?.name} - {activeTicket.type}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 mr-2">Estado:</span>
                <select
                  value={activeTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="OPEN">Abierto</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="RESOLVED">Resuelto</option>
                  <option value="CLOSED">Cerrado</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => {
                const isAdmin = msg.sender_role === "ADMIN";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col max-w-[70%] ${isAdmin ? "items-end" : "items-start"}`}>
                        <div
                        className={`rounded-2xl px-5 py-3 shadow-sm ${
                            isAdmin
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                        }`}
                        >
                        {!isAdmin && (
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                {activeTicket.local?.name || 'Local'}
                            </p>
                        )}
                        <p className="text-[15px]">{msg.content}</p>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 px-1">
                            {isAdmin ? 'Tú (Soporte DualEat)' : msg.sender.name} • {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {(activeTicket.status !== "CLOSED" && activeTicket.status !== "RESOLVED") ? (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                    <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe una respuesta como Soporte DualEat..."
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white rounded-full p-3 flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
                    >
                    <Send className="w-5 h-5" />
                    </button>
                </form>
                </div>
            ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
                    No puedes enviar mensajes porque el ticket está {activeTicket.status === 'CLOSED' ? 'cerrado' : 'resuelto'}.
                </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium">Selecciona un ticket para comenzar a chatear</p>
          </div>
        )}
      </div>
    </div>
  );
};
