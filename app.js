const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 8080;

const { addUser, removeUser, getUser, getUsersInRoom, disconnectSocket, getKey, setConnection, getUserByName } = require('./users');

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
    console.log('a user connected: ',socket.id);
    
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.conn.remoteAddress.split(":")[3];
    const userAgent = socket.handshake.headers['user-agent'];
    const uniqueID = ip + userAgent;
    let channelCode = null;
    
    socket.on('join', (name, room) => {
        console.log(`${name} is joining ${room}!`);
        let theUser = addUser(uniqueID, name, room, socket.id);
        if (theUser === null) {
            io.to(socket.id).emit('enter','Error: this name is taken. Please try again',null);
        } else {
            channelCode = getKey(uniqueID, name, room, socket.id);
            if (channelCode !== null) {
                console.log("Not a null value");
                console.log(`Channel code: ${channelCode}`);
                socket.join(channelCode);
                io.to(channelCode).emit('updatePlayerList',getUsersInRoom(room));
                io.to(socket.id).emit('enter',name,room);
            } else {
                io.to(socket.id).emit('enter',null,null);
            }
        }
    })
    socket.on('clientToServerBuzz', (name, sound) => {
        console.log(`New buzz from ${name}, sending to channel ${channelCode}`);
        io.to(channelCode).emit('serverToClientBuzz',name, sound);
    })
    socket.on('clientToServerReset', (name) => {
        console.log(`New reset from ${name}, sending to channel ${channelCode}`);
        io.to(channelCode).emit('serverToClientReset',name);
    })
    socket.on('kickPlayer', (name, room) => {
        console.log(`Request to kick player ${name} received...`);
        let user = getUserByName(name, room.trim().toLocaleLowerCase());
        if (user !== null) {
            removeUser(user.id, user.name, user.room);
            io.to(channelCode).emit('updatePlayerList',getUsersInRoom(room));
        }
//        setTimeout(function(){ disconnectSocket(uniqueID, socket.id); }, 5000);
    })
    socket.on('disconnect', () => {
        console.log("User has left...",socket.id);
        setTimeout(function(){ disconnectSocket(uniqueID, socket.id); }, 5000);
    })
});

server.listen(PORT, () => {
  console.log('Server is listening on port: ',PORT);
});