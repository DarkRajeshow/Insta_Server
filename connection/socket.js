import { Server } from "socket.io";
import dotenv from 'dotenv';
dotenv.config();

export default function socketIo(server) {

    const onlineUsers = {};

    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        socket.on('online', (userId) => {
            onlineUsers[userId] = socket.id;
        });

        socket.on('offline', (userId) => {
            delete onlineUsers[userId];
            socket.emit("is_online_response", { userId, isOnline: false });
        });


        socket.on('is_online', (userId) => {
            if (onlineUsers[userId]) {
                socket.emit("is_online_response", { userId, isOnline: true });
            }
        });

        socket.on("join_room", (userId) => {
            socket.join(userId);
        });

        socket.on('leave_room', (userId) => {
            socket.leave(userId);
        });

        socket.on("new_message", (messageContent) => {
            io.to(messageContent.receiver).emit("receive_message", messageContent);
        });


        socket.on("read", ({
            sentBy,
            readBy
        }) => {
            console.log(sentBy, readBy);
            io.to(sentBy).emit("read_response", { readBy });
        });

        socket.on("disconnect", () => {
            for (const userId in onlineUsers) {
                console.log(userId);
                console.log(onlineUsers[userId]);
                console.log(socket.id);
                if (onlineUsers[userId] === socket.id) {
                    socket.emit("is_online_response",
                        {
                            userId,
                            isOnline: false
                        }
                    );
                    delete onlineUsers[userId];
                    break;
                }
            }
        });
    });
}
