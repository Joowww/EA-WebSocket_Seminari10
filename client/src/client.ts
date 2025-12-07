import { io, Socket } from "socket.io-client";
import { IMessage } from "./models/message";

const SERVER_URL = "http://localhost:3000";

// Function to define socket events
const initializeSocketEvents = (socket: Socket): void => {
    socket.on("connect", () => {
        console.info(`Connected to server with id: ${socket.id}`);
        // Send user info on connect
        const userInfo = {
            userId: `user_${socket.id}`,
            name: "Client User"
        };
        socket.emit("userConnected", userInfo);
    });

    socket.on("disconnect", () => {
        console.info("Disconnected from server.");
    });

    socket.on("message", (msg: IMessage) => {
        const date = new Date(msg.timestamp);
        const time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        console.info(`[${time}] ${msg.from}: ${msg.content}`);
        if (msg.userId) {
            console.info(`   User ID: ${msg.userId}`);
        }
    });

    // Listen for system messages (connections/disconnections)
    socket.on("systemMessage", (msg: { content: string, timestamp: string }) => {
        const time = new Date(msg.timestamp).toLocaleTimeString('en-US');
        console.info(`[${time}] System: ${msg.content}`);
    });

    // Listen for user list
    socket.on("userList", (users: Array<{id: string, name: string}>) => {
        console.info("Connected users:");
        users.forEach(user => {
            console.info(`   - ${user.name} (${user.id})`);
        });
    });
};

// Function to send a message to the server
const sendMessage = (socket: Socket, content: string, author: string = "Client"): void => {
    const message: IMessage = {
        from: author,
        content: content,
        timestamp: new Date().toISOString(),
        userId: `user_${socket.id}`
    };
    socket.emit("message", message);
};

// Initialize connection
const socket = io(SERVER_URL);
initializeSocketEvents(socket);

// Example usage: Send messages with different authors and times
console.info("Starting WebSocket client...");
console.info(`Start time: ${new Date().toLocaleString('en-US')}`);

setTimeout(() => {
    sendMessage(socket, "Hello from the client!", "Main Client");
}, 2000);

setTimeout(() => {
    sendMessage(socket, "This message has date and author", "User 1");
}, 4000);

setTimeout(() => {
    sendMessage(socket, "Testing time system", "User 2");
}, 6000);

// Simulate receiving messages from other users
setTimeout(() => {
    const simulatedMessage: IMessage = {
        from: "Other User",
        content: "Hello, I am another connected user",
        timestamp: new Date().toISOString(),
        userId: "user_abc123"
    };
    console.info("\nSimulated received message:");
    const time = new Date(simulatedMessage.timestamp).toLocaleTimeString('en-US');
    console.info(`[${time}] ${simulatedMessage.from}: ${simulatedMessage.content}`);
    console.info(`   User ID: ${simulatedMessage.userId}`);
}, 8000);
