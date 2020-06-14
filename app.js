var	express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server); 

var users = {};

server.listen(3000); 

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
 });

 io.sockets.on('connection', function(socket) {

    socket.on('new user', function(data, callback){
        if(data in users){
            callback(false);
        }else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
            updateNicknames();
           
        }
    });

    function updateNicknames() {
        io.sockets.emit('usernames', Object.keys(users));
    }

     socket.on('send message', function(data, callback){
         var msg = data.trim();
         if(msg.substr(0,3) == '/w '){
             msg= msg.substr(3);
             var ind = msg.indexOf(' ');
             if(ind != -1){
                 var name = msg.substr(0, ind);
                 var msg = msg.substr(ind+1);
                 if(name in users){
                    users[name].emit('whisper', {msg: msg, nick: socket.nickname});
                 } else{
                     callback('enter a valid user');
                 }
             } else{
                 callback('Please enter a message to your whisper');
             }
         } else {
            io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
         }
     });

     socket.on('disconnect', function(data){
         if(!socket.nickname) return;
         delete users[socket.nickname];
         updateNicknames();
     });
 });

