const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 8080;

const { addUser, removeUser, getUser, getUsersInRoom, disconnectSocket, getKey } = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//app.get('/', (req, res) => {
//  res.sendFile(__dirname + '/newJoin.html');
//});

// use the express-static middleware
app.use(express.static("public"))

// define the first route
app.get("/", function (req, res) {
  res.send("<h1>Hello World!</h1>")
})

io.on('connection', (socket) => {
//    console.log('a user connected: ',socket.id);
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];
    const userAgent = socket.handshake.headers['user-agent'];
    console.log(`New ${userAgent} at ${ip} with ${socket.id}...`);
    const uniqueID = ip + userAgent;
    let channelCode = null;
    let socketName = '';
    let socketRoom = '';
    
    socket.on('join', (name, room) => {
//        console.log(`${name} is joining ${room}!`);
        let theUser = addUser(uniqueID, name, room, socket.id);
        if (theUser === null) {
            io.to(socket.id).emit('enter','Error: this name is taken. Please try again',null);
        } else {
            channelCode = getKey(uniqueID, name, room, socket.id);
            if (channelCode !== null) {
//                console.log(`Channel code not a null value, it's: ${channelCode}`);
                socket.join(channelCode);
                io.to(channelCode).emit('updatePlayerList', getUsersInRoom(room));
                io.to(socket.id).emit('enter',name,room);
                socketName = name;
                socketRoom = room;
            } else {
                console.log(`Channel code is a NULL VALUE for ${name} joining ${room}`);
                io.to(socket.id).emit('enter',null,null);
            }
        }
    })
    socket.on('clientToServerBuzz', (name, sound) => {
//        console.log(`New buzz from ${name}, sending to channel ${channelCode}`);
        io.to(channelCode).emit('serverToClientBuzz',name, sound);
    })
    socket.on('clientToServerReset', (name) => {
//        console.log(`New reset from ${name}, sending to channel ${channelCode}`);
        io.to(channelCode).emit('serverToClientReset',name);
    })
    socket.on('kickPlayer', (name, room, kickID, kickSocket) => {
        console.log(`Request to kick player ${name} received in ${room}...`);
        user = getUser(kickID, kickSocket);
//        console.log(`User: ${user.name}, ${user.id}, ${user.socket}, ${user.room}`);
        if (user !== null) {
            let leavingSocket = io.sockets.connected[user.socket];
//            console.log(`ChannelCode is:${channelCode}, and my ID is:${socket.id}, and lsID is:${leavingSocket.id}, and usID is:${user.socket}`);
            io.to(leavingSocket.id).emit('serverToClientDisconnect');
//            io.to(user.socket).emit('serverToClientDisconnect');
            leavingSocket.leave(channelCode);
            removeUser(user.id, user.name, user.room);
            let remainingPlayers = getUsersInRoom(room);
            if (!remainingPlayers || remainingPlayers == [] || typeof remainingPlayers === 'undefined') {
                removeRoom(room);
            } else {
                io.to(channelCode).emit('updatePlayerList',remainingPlayers);
            }
        } else {
            console.log(`ISSUE: COULD NOT FIND ${name} in ${room}...`);
        }
//        setTimeout(function(){ disconnectSocket(uniqueID, socket.id); }, 5000);
    })
    socket.on('playerPing', () => {
//        console.log(`Received a ping from ${uniqueID}`);
        setTimeout(function(){ io.to(socket.id).emit('serverPing',''); }, 5000);
//        console.log(`Sending a ping back!`);
    })
    socket.on('disconnect', () => {
//        console.log("User has left...",socket.id);
        console.log(`User leaving (name|room: ${socketName}|${socketRoom}) is ${userAgent} at ${ip} with ${socket.id}...`);
        io.to(socket.id).emit('serverToClientDisconnect');
        let room = disconnectSocket(uniqueID, socket.id);
        if (room !== null || typeof room !== 'undefined') {
            room = socketRoom;
        }
        if (room !== null || typeof room !== 'undefined') {
            let remainingPlayers = getUsersInRoom(room);
            if (!remainingPlayers || remainingPlayers == [] || typeof remainingPlayers === 'undefined') {
                removeRoom(room);
            } else {
                io.to(channelCode).emit('updatePlayerList',remainingPlayers);
            }
        }
//        setTimeout(function(){ disconnectSocket(uniqueID, socket.id); }, 5000);
    })
});

server.listen(PORT, () => {
  console.log('Server is listening on port: ',PORT);
});