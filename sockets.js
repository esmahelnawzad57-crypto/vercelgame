/* global io */
const socketio = require('socket.io');

const Room = require('./controllers/Rooms');
const Canvas = require('./controllers/Canvas');
const Disconnect = require('./controllers/Disconnect');
const Game = require('./controllers/Game');

module.exports.init = (server) => {
    // 🛠️ چالاککردنی سۆکێت بە پشتگیری تەواوی CORS بۆ ئەوەی ڕێگە بە مۆبایلی هاوڕێکانت بدات جۆین بن
    const io = socketio(server, {
        cors: {
            origin: "*", // ڕێگەدان بە هەموو ناونیشانەکان
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling'] // ناچارکردنی سۆکێت بۆ بەکارهێنانی وێب سۆکێتی خێرا
    });

    io.on('connection', (socket) => {
        console.log('connected user:', socket.id);
        
        socket.on('newPrivateRoom', (player) => new Room(io, socket).createPrivateRoom(player));
        socket.on('joinRoom', async (data) => { await new Room(io, socket).joinRoom(data); });
        socket.on('settingsUpdate', (data) => new Room(io, socket).updateSettings(data));
        socket.on('drawing', (data) => new Canvas(io, socket).broadcastDrawing(data));
        socket.on('clearCanvas', () => new Canvas(io, socket).clearCanvas());
        socket.on('startGame', async () => { await new Game(io, socket).startGame(); });
        socket.on('getPlayers', async () => { await new Game(io, socket).getPlayers(); });
        socket.on('message', (data) => new Game(io, socket).onMessage(data));
        socket.on('disconnect', () => new Disconnect(io, socket).onDisconnect());
    });
};