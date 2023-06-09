import express from 'express';
import socketio from 'socket.io';
import http from 'http';
import path from 'path';

const app = express();
const httpServer = http.createServer(app);
const io = new socketio.Server(httpServer);

app.use(express.static(path.resolve(__dirname, '..', 'public')));

let countdownInterval: NodeJS.Timeout;
let count = 10;

// função para iniciar o contador
function startCountdown() {
  countdownInterval = setInterval(function() {
    if (count >= 0) {
      io.emit('countdown', count); // enviar atualização do contador para todos os clientes conectados
      count--;
    } else {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('getCountdown', function() {
    // enviar o contador atual para o cliente recém-conectado
    socket.emit('countdown', count);

    // iniciar o contador se ainda não estiver em andamento
    if (!countdownInterval) {
      startCountdown();
    }
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
  });
});

httpServer.listen(3333);
