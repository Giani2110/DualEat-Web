import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import dotenv from "dotenv";

dotenv.config();

// Creamos una variable para almacenar la instancia de IO
let io: SocketServer | null = null;

/**
 * Inicializa el servidor Socket.io y configura la lógica de conexión.
 * @param httpServer La instancia del servidor HTTP de Node.js.
 */
export function initializeSocket(httpServer: HttpServer) {
    // 1. Inicialización de Socket.io
    const socketIoServer = new SocketServer(httpServer, {
        // Configuración de CORS para permitir la conexión desde el frontend
        cors: {
            origin: process.env.FRONTEND_URL, // Debe coincidir con tu frontend
            methods: ["GET", "POST"]
        }
    });

    io = socketIoServer;

    // 2. Lógica de Conexión y Asignación de Salas (Rooms)
    io.on('connection', (socket) => {
        // El user_id debe ser pasado desde el cliente en el handshake (ej. io('url', { auth: { userId: '...' } }))
        const userId = socket.handshake.auth.userId as string; 

        if (userId) {
            // Cada usuario se une a una sala nombrada con su propio ID.
            // Esto permite el envío dirigido: socketServer.to('user123').emit(...)
            socket.join(userId); 
            console.log(`[Socket] Usuario conectado: ${userId}. Sala asignada: ${userId}`);
        } else {
            console.log('[Socket] Usuario conectado sin ID. Conexión limitada.');
        }

        socket.on('disconnect', () => {
            if (userId) {
                console.log(`[Socket] Usuario desconectado: ${userId}`);
            }
        });
    });

    console.log("✅ Socket.io OK - Servidor de tiempo real inicializado.");
}

/**
 * Devuelve la instancia de Socket.io. 
 * Esta es la instancia que usarás en tus servicios (PostService, OrderService, etc.)
 * para enviar notificaciones dirigidas.
 */
export function getSocketServer(): SocketServer {
    if (!io) {
        throw new Error("Socket.io no ha sido inicializado. Llama a initializeSocket(httpServer) primero.");
    }
    return io;
}