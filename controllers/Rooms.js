// لەجیاتی nanoid وەشانی نوێ، فۆرماتی دروستی لێرە دادەنێین بۆ ئەوەی کێشەی تێکچوونی نەمێنێت
const { customAlphabet } = require('nanoid');
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 15);

// لێرەدا دڵنیا دەبینەوە کە ئەگەر games لە global پێناسە نەکرابێت، دروستی بکات بۆ ئەوەی سێرڤەر نەکوژێتەوە
if (!global.games) {
    global.games = {};
}

class Room {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }

    createPrivateRoom(player) {
        const { socket } = this;
        const id = nanoid(); // دروستکردنی ئایدی ناوازە بۆ ژوورەکە
        
        global.games[id] = {
            rounds: 2,
            time: 40 * 1000,
            customWords: [],
            language: 'English',
        };
        
        global.games[id][socket.id] = {};
        global.games[id][socket.id].score = 0;
        global.games[id][socket.id].name = player.name;
        global.games[id][socket.id].avatar = player.avatar;
        
        console.log("Room Created Successfully:", global.games);
        
        socket.player = player;
        socket.roomID = id;
        socket.join(id);
        socket.emit('newPrivateRoom', { gameID: id });
    }

    async joinRoom(data) {
        const { io, socket } = this;
        const roomID = data.id;
        
        // دڵنیابوونەوە لەوەی ژوورەکە بوونی هەیە پێش ئەوەی یاریزان جۆین بکات
        if (!global.games[roomID]) {
            socket.emit('error', { message: 'ئەم ژوورە بوونی نییە یان سڕدراوەتەوە!' });
            return;
        }

        const players = Array.from(await io.in(roomID).allSockets());
        global.games[roomID][socket.id] = {};
        global.games[roomID][socket.id].score = 0;
        global.games[roomID][socket.id].name = data.player.name;
        global.games[roomID][socket.id].avatar = data.player.avatar;
        
        socket.player = data.player;
        socket.join(roomID);
        socket.roomID = roomID;
        socket.to(roomID).emit('joinRoom', data.player);
        
        socket.emit('otherPlayers',
            players.reduce((acc, id) => {
                if (socket.id !== id) {
                    const targetSocket = io.of('/').sockets.get(id);
                    if (targetSocket && targetSocket.player) {
                        acc.push(targetSocket.player);
                    }
                }
                return acc;
            }, []));
    }

    updateSettings(data) {
        const { socket } = this;
        const { customWords, ...rest } = data;
        
        if (global.games[socket.roomID]) {
            global.games[socket.roomID].time = Number(data.time) * 1000;
            global.games[socket.roomID].rounds = Number(data.rounds);
            global.games[socket.roomID].probability = Number(data.probability);
            global.games[socket.roomID].customWords = customWords;
            global.games[socket.roomID].language = data.language;
            socket.to(socket.roomID).emit('settingsUpdate', rest);
            console.log("Settings Updated:", global.games[socket.roomID]);
        }
    }
}

module.exports = Room;