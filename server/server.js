
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active games
const games = new Map();
const players = new Map();

// Game state structure
function createGameState() {
  return {
    board: [
      [{ type: "rook", color: "black" }, { type: "knight", color: "black" }, { type: "bishop", color: "black" }, { type: "queen", color: "black" }, { type: "king", color: "black" }, { type: "bishop", color: "black" }, { type: "knight", color: "black" }, { type: "rook", color: "black" }],
      [{ type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }, { type: "pawn", color: "black" }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [{ type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }, { type: "pawn", color: "white" }],
      [{ type: "rook", color: "white" }, { type: "knight", color: "white" }, { type: "bishop", color: "white" }, { type: "queen", color: "white" }, { type: "king", color: "white" }, { type: "bishop", color: "white" }, { type: "knight", color: "white" }, { type: "rook", color: "white" }]
    ],
    currentPlayer: "white",
    moves: [],
    isCheck: false,
    isCheckmate: false,
    whiteTime: 600000, // 10 minutes
    blackTime: 600000,
    gameMode: "online"
  };
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create a new game
  socket.on('create-game', (callback) => {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gameState = createGameState();
    
    games.set(gameId, {
      ...gameState,
      players: { white: socket.id, black: null },
      spectators: [],
      gameId
    });
    
    players.set(socket.id, { gameId, color: 'white' });
    socket.join(gameId);
    
    callback({ success: true, gameId, color: 'white' });
  });

  // Join an existing game
  socket.on('join-game', (gameId, callback) => {
    const game = games.get(gameId);
    
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    if (game.players.black === null) {
      // Join as black player
      game.players.black = socket.id;
      players.set(socket.id, { gameId, color: 'black' });
      socket.join(gameId);
      
      // Notify both players that game is ready
      io.to(gameId).emit('game-ready', game);
      callback({ success: true, gameId, color: 'black' });
    } else {
      // Join as spectator
      game.spectators.push(socket.id);
      players.set(socket.id, { gameId, color: 'spectator' });
      socket.join(gameId);
      
      socket.emit('game-state', game);
      callback({ success: true, gameId, color: 'spectator' });
    }
  });

  // Handle moves
  socket.on('make-move', (moveData) => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;
    
    const game = games.get(playerInfo.gameId);
    if (!game) return;
    
    // Verify it's the player's turn
    if (game.currentPlayer !== playerInfo.color) return;
    
    // Update game state
    game.board = moveData.board;
    game.currentPlayer = moveData.currentPlayer;
    game.moves.push(moveData.move);
    game.isCheck = moveData.isCheck;
    game.isCheckmate = moveData.isCheckmate;
    
    // Broadcast move to all players in the game
    io.to(playerInfo.gameId).emit('move-made', moveData);
  });

  // Handle time updates
  socket.on('time-update', (timeData) => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;
    
    const game = games.get(playerInfo.gameId);
    if (!game) return;
    
    game.whiteTime = timeData.whiteTime;
    game.blackTime = timeData.blackTime;
    
    // Broadcast time update
    socket.to(playerInfo.gameId).emit('time-updated', timeData);
  });

  // Handle game over
  socket.on('game-over', (result) => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;
    
    io.to(playerInfo.gameId).emit('game-ended', result);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    const playerInfo = players.get(socket.id);
    if (playerInfo) {
      const game = games.get(playerInfo.gameId);
      if (game) {
        // Notify other players about disconnection
        socket.to(playerInfo.gameId).emit('player-disconnected', {
          color: playerInfo.color
        });
        
        // If it's a player (not spectator), mark game as abandoned
        if (playerInfo.color !== 'spectator') {
          game.abandoned = true;
          setTimeout(() => {
            games.delete(playerInfo.gameId);
          }, 300000); // Clean up after 5 minutes
        }
      }
      
      players.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
