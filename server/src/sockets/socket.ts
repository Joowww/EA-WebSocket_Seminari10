import SocketIO from "socket.io";
import * as http from "http";
import { IMessage } from "../models/message";
import { UserManager, IUser } from "../models/user";

const userManager = new UserManager();

const createSocketServer = (server: http.Server) => {
    return new SocketIO.Server(server, {
        cors: {
            origin: "*"
        }
    });
};

const initializeSocket = (server: http.Server) => {
    const io = createSocketServer(server);
    io.on('connection', (socket: SocketIO.Socket) => {
        console.log('Connected client', socket.id);
        console.log('Connection time:', new Date().toLocaleString('en-US'));

        // When a user connects
        socket.on("userConnected", (userData: {userId: string, name: string}) => {
            const user: IUser = {
                id: userData.userId,
                name: userData.name,
                socketId: socket.id,
                connectedAt: new Date()
            };
            userManager.addUser(user);

            // Send system message to all
            io.emit("systemMessage", {
                content: `${userData.name} has connected`,
                timestamp: new Date().toISOString()
            });

            // Send updated user list
            io.emit("userList", userManager.getAllUsers().map(u => ({
                id: u.id,
                name: u.name
            })));
        });

        // Receive messages
        socket.on("message", (m: IMessage) => {
            console.log('[server](message):', m.content);
            console.log('   From:', m.from);
            console.log('   Time:', new Date(m.timestamp).toLocaleString('en-US'));
            if (m.userId) {
                console.log('   User ID:', m.userId);
            }
            // Broadcast to all clients
            io.emit("message", m);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log("Client disconnected", socket.id);
            const disconnectedUser = userManager.removeUser(socket.id);
            if (disconnectedUser) {
                // Send system message
                io.emit("systemMessage", {
                    content: `${disconnectedUser.name} has disconnected`,
                    timestamp: new Date().toISOString()
                });
                // Send updated user list
                io.emit("userList", userManager.getAllUsers().map(u => ({
                    id: u.id,
                    name: u.name
                })));
            }
            socket.disconnect();
        });

        // Send user list when requested
        socket.on("getUsers", () => {
            socket.emit("userList", userManager.getAllUsers().map(u => ({
                id: u.id,
                name: u.name
            })));
        });
    });
};

export default initializeSocket;