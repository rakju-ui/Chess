
import { useState, useEffect, useCallback } from 'react';
import { initSocket, getSocket } from '@/lib/socket';
import type { GameState, Position, Move } from '@/lib/types';

interface MultiplayerGameState extends GameState {
  gameId?: string;
  playerColor?: 'white' | 'black' | 'spectator';
  opponentConnected?: boolean;
  gameReady?: boolean;
}

export const useMultiplayer = () => {
  const [gameState, setGameState] = useState<MultiplayerGameState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = initSocket();
    
    socket.on('connect', () => {
      setConnectionStatus('connected');
      setError(null);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
      setError('Failed to connect to server');
    });

    socket.on('game-ready', (game) => {
      setGameState(prev => ({
        ...game,
        gameReady: true,
        opponentConnected: true
      }));
    });

    socket.on('move-made', (moveData) => {
      setGameState(prev => prev ? {
        ...prev,
        board: moveData.board,
        currentPlayer: moveData.currentPlayer,
        moves: [...prev.moves, moveData.move],
        isCheck: moveData.isCheck,
        isCheckmate: moveData.isCheckmate
      } : null);
    });

    socket.on('time-updated', (timeData) => {
      setGameState(prev => prev ? {
        ...prev,
        whiteTime: timeData.whiteTime,
        blackTime: timeData.blackTime
      } : null);
    });

    socket.on('game-ended', (result) => {
      setGameState(prev => prev ? {
        ...prev,
        gameResult: result
      } : null);
    });

    socket.on('player-disconnected', (data) => {
      setGameState(prev => prev ? {
        ...prev,
        opponentConnected: false
      } : null);
      setError(`${data.color} player disconnected`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('game-ready');
      socket.off('move-made');
      socket.off('time-updated');
      socket.off('game-ended');
      socket.off('player-disconnected');
    };
  }, []);

  const createGame = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;

    setConnectionStatus('connecting');
    socket.emit('create-game', (response: any) => {
      if (response.success) {
        setGameState(prev => ({
          ...prev!,
          gameId: response.gameId,
          playerColor: response.color,
          gameReady: false,
          opponentConnected: false
        }));
      } else {
        setError('Failed to create game');
      }
    });
  }, []);

  const joinGame = useCallback((gameId: string) => {
    const socket = getSocket();
    if (!socket) return;

    setConnectionStatus('connecting');
    socket.emit('join-game', gameId, (response: any) => {
      if (response.success) {
        setGameState(prev => ({
          ...prev!,
          gameId: response.gameId,
          playerColor: response.color,
          gameReady: response.color !== 'spectator',
          opponentConnected: true
        }));
      } else {
        setError(response.error || 'Failed to join game');
      }
    });
  }, []);

  const makeMove = useCallback((from: Position, to: Position, newGameState: GameState) => {
    const socket = getSocket();
    if (!socket || !gameState) return;

    const move: Move = {
      from,
      to,
      piece: newGameState.board[to.row][to.col]!,
      capturedPiece: gameState.board[to.row][to.col] || undefined
    };

    const moveData = {
      board: newGameState.board,
      currentPlayer: newGameState.currentPlayer,
      move,
      isCheck: newGameState.isCheck,
      isCheckmate: newGameState.isCheckmate
    };

    socket.emit('make-move', moveData);
    
    // Update local state immediately for responsive UI
    setGameState(prev => prev ? {
      ...prev,
      ...newGameState
    } : null);
  }, [gameState]);

  const updateTime = useCallback((whiteTime: number, blackTime: number) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('time-update', { whiteTime, blackTime });
  }, []);

  return {
    gameState,
    connectionStatus,
    error,
    createGame,
    joinGame,
    makeMove,
    updateTime
  };
};
