const rooms = [];
const users = [];

const getARoom = (room, key) => {
    room = room.trim().toLowerCase();
//    console.log(`Searching for this room, if it's not already made: ${room}`);
    const existingRoom = rooms.find((aRoom) => aRoom.room === room);
    if (!existingRoom) {
        const count = 0;
        key = key + "||--ROOM";
        const newRoom = { room, count, key};
        console.log(`NEW RoomObj [${newRoom.room}, ${newRoom.count}, ${newRoom.key}] is now made!`);
        rooms.push(newRoom);
        console.log(`Now rooms are:`);
        rooms.forEach(r => printRoom(r));
        return newRoom;
    }
    return existingRoom;
}

//const getUserByName = (name, room) => {
////    console.log(`Looking for ${name} in ${room}...`);
//    for (let i = 0; i < users.length; i++) {
////        console.log(`Looking at ${users[i].name} in ${users[i].room}`);
//        if (users[i].room === room && users[i].name === name) {
//            console.log(`Got a ${name} in ${room} already.`);
//            return users[i];
//        }
//    }
////    console.log(`*** Could not find ${name} ***`);
//    return null;
//}

//const changeUserConnectionStatus = (id, name, room) => {
//    for (let i = 0; i < users.length; i++) {
//        if (users[i].room === room && users[i].name === name && users[i].id === id) {
//            console.log(`Conn status: ${users[i].connected}`);
//            users[i].connected = !users[i].connected;
//            console.log(`New conn status: ${users[i].connected}`);
//            return users[i];
//        }
//    }
//    return null;
//}

//const setConnection = (id, socket) => {
//    for (let i = 0; i < users.length; i++) {
//        if (users[i].id === id && users[i].connected === false) {
//            const old = users[i].connected;
//            users[i].connected = !users[i].connected;
//            users[i].socket = socket;
//            console.log(`Changed ${name} to ${users[i].connected} from ${old}`);
//            return users[i];
//        }
//    }
//    return null;
//}

const changeConnection = (id, name, room, socket) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id && users[i].name === name && users[i].room === room) {
            const old = users[i].connected;
            users[i].connected = !users[i].connected;
            users[i].socket = socket;
            console.log(`Changed ${name} to ${users[i].connected} from ${old}`);
            return users[i];
        }
    }
}

const isDuplicate = ( name, room ) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].room === room.room || users[i].room.trim().toLowerCase() === room.room) {
            if (users[i].name === name || users[i].name.trim().toLowerCase() === name) {
//                console.log(`Found match for ${name} in ${room.room} --> ${users[i].name} | ${users[i].room}`);
                return true;
            }
        }
    }
    return false;
}

const addUser = ( id, name, room, socket ) => {
//    console.log(`addUser called to add ${id} named ${name} to room called ${room}`);
    //name = name.trim().toLowerCase();
    if(!name || !room) return { error: 'Username and room are required.' };
    let theRoom = getARoom(room, socket);
    room = room.trim().toLowerCase();
    const existingUser = getUser(id, socket);
    //    const existingUser = getUserByName(name, room);
    const index = rooms.findIndex((aRoom) => aRoom.room === room);
    if (index !== -1 && !doesNotExist(index, true)) {
        if (!doesNotExist(existingUser)) {
            if (existingUser.connected === false) {
                const oldSocket = existingUser.socket;
                const reconnectedUser = changeConnection(id, name, room, socket);
                console.log(`Reconnected user: ${reconnectedUser.name}, new socket ${reconnectedUser.socket} from old of ${oldSocket}`);
                return { reconnectedUser };
            }
            console.log(`You seem to be already logged in to Guzz. Please refresh and try again.`);
            return null;
        }
        if (isDuplicate(name, rooms[index])) {
            console.log(`This username is taken: ${name}`);
            return null;
        }
        const connected = true;
        const newUser = { id, name, room, connected, socket };
        users.push(newUser);
        console.log(`NEW user: ${newUser.name}, ${newUser.socket}`);
        rooms[index].count++;
        return { newUser };
    }
    console.log(`There seems to be a problem with your room. Please refresh and try again.`);
    console.log(`This is the ${index}`);
    return null;
}

const printRoom = (room) => {
    if (doesNotExist(room)) {
        console.log(`...no valid room object to print...`);
    } else {
        console.log(`Room: ${room.room}, ${room.count}, ${room.key}`);
    }
}

const printUser = (user) => {
    if (doesNotExist(user)) {
        console.log(`...no valid user object to print...`);
    } else {
        console.log(`User: ${user.id}, ${user.name}, ${user.room}, ${user.connected}, ${user.socket}`);
    }
}

const removeRoom = (room) => {
    console.log(`Before DELETE ${room}, existing are:`);
    rooms.forEach(r => printRoom(r));
    const index = rooms.findIndex((aRoom) => aRoom.room === room);
    if (index !== -1) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].room === room) {
                if (users[i].connected === true) {
                    console.log(`User ${users[i].name} is connected?`);
                }
                removeUser(users[i].id, users[i].name, users[i].room, i);
            }
        }
        console.log(`Removing ${room}. ${rooms.length - 1} rooms remain.`);
        return rooms.splice(index, 1)[0];
    }
    console.log(`Could not find ${room}?`);
    return null;
}

const disconnectSocket = (id, socket) => {
    console.log(`Check to set ${socket} to disconnected if in users.`);
    for (let i = 0; i < users.length; i++) {
//        console.log(`Looking at ${users[i].name}...`);
//        console.log(`It has ${users[i].socket} vs. socket disconnecting ${socket}`);
        if (doesNotExist(users[i])) {
            console.log(`Problem finding user with socket:${socket} and id:${id}...`);
            console.log(`These are the ${users.length} users remaining:`);
            users.forEach(u => printUser(u));
            console.log(`These are the ${rooms.length} rooms remaining:`);
            rooms.forEach(r => printRoom(r));
            return null;
        }
        if (users[i].id === id && users[i].socket === socket) {
            users[i].connected = false;
            console.log(`${socket} on ${id} has been disconnected.`);
            let removingRoom = users[i].room;
            removeUser(users[i].id, users[i].name, users[i].room);
            let index = users.findIndex((user) => user.name !== users[i].name && user.room === users[i].room && user.connected === true);
//            let index = -1;
            for (let ii = 0; ii < users.length; ii++) {
                if (users[ii].name !== users[i].name && users[ii].room === users[i].room) {
                    index = ii;
                    break;
                }
            }
            if (doesNotExist(index, true)) {
                console.log(`Problem finding user with socket:${socket} and id:${id}...`);
                return null;
            }
            if (index === -1) {
                console.log(`No users left connected in ${removingRoom}...`);
                removeRoom(removingRoom);
                return null;
            }
            return removingRoom;
        }
    }
    return null;
}

const removeUser = (id, name, room, index) => {
    console.log(`Looking to remove id:${id} name:${name} room:${room} index:${index}`);
    if (doesNotExist(index, true)) {
        for (let i=0; i<users.length; i++) {
                if (users[i].name === name){
//                    console.log(`At least name:${name} is right.`);
                    if (users[i].room === room) {
//                        console.log(`At least room:${room} is right.`);
                        if (users[i].id === id) {
//                            console.log(`At least id:${id} is right.`);
                            for (let j=0; j<rooms.length; j++) {
                                if (rooms[j].room === room) {
                                    rooms[j].count--;
                                    console.log(`Now ${rooms[j].count} users in ${room}`);
                                    break;
                                }
                                console.log(`???: Found no matching rooms: `);
                                rooms.forEach(r => printRoom(r));
                            }
                            return users.splice(i, 1)[0];
                        }
                    }
                    console.log(`Name matched but room:${room} did not match:${users[i].room} or id:${id} did not match:${users[i].id}`);
                }
            }
        console.log(`No user to remove?..: ${newUser}`);
    } else {
        return users.splice(index, 1)[0];
    }
}
//    if () {
//        
//    }
////    const index = users.findIndex((user) => user.id === id && user.room === room && user.name === name);
////    const remaningUsers = getUsersInRoom(room);
////    console.log(`Users in ${room} are now: ${remaningUsers}`);
//    if(index !== -1) {
//        console.log(`Found user at ${index}!`);
//        if (!index || typeof index === 'undefined') {
//            console.log(`Now to print each user because we could find nothing:`);
//        }
////        console.log(`Users in ${room} have become: ${remaningUsers}`);
//        return users.splice(index, 1)[0];
//    }
//    console.log(`No user to remove?..: ${newUser}`);
//}

//const removeRoom = (room) => {
//    const index = rooms.findIndex((aRoom) => aRoom === room);
//    if (index !== -1) {
//        console.log(`Found room at: ${index} and it is ${rooms[index]}`);
//        return rooms.splice(index, 1)[0];
//    }
//}

const getKey = (id, name, room, socket) => {
//    console.log(`Seeking key for room ${room}...`);
    const keyRoom = getARoom(room);
    room = room.trim().toLowerCase();
//    console.log(room);
//    const user = getUserByName(name, room);
    const user = getUser(id, socket);
    if (user === null) {
        console.log(`Fucking getUserByName for ${name} was null`);
        return null;
    }
    if (user.id !== id && user.socket !== socket) {
        return null;
    }
//    console.log(`Sending back the room key ${keyRoom.key}`);
    return String(keyRoom.key);
}

const doesNotExist = (entity, countZero) => {
    if (countZero === true && entity === 0) {
        return false;
    }
    if (entity === null || !entity || typeof entity === 'undefined') {
        return true;
    }
    return false;
}

const getUser = (id, socket) => users.find((user) => user.id === id && user.socket === socket);

const getUsersInRoom = (room) => users.filter((user) => user.room === room.trim().toLowerCase()).map((user) => [user.name, user.id, user.socket]);

module.exports = { addUser, removeUser, getUser, getUsersInRoom, disconnectSocket, getKey };