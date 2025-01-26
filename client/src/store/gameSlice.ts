import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Player, GamePhase, GameRole } from '../../../shared/types/game.types';
import { v4 as uuidv4 } from 'uuid';

const initialState: GameState = {
  phase: 'SETUP',
  players: [],
  currentTurn: 0,
  votes: {},
  nightActions: {},
  winner: null,
  dayCount: 1,
  isNightActionRequired: false,
  selectedPlayer: null
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.phase = 'NIGHT';
      state.currentTurn = 0;
      state.dayCount = 1;
      state.votes = {};
      state.nightActions = {};
      state.winner = null;
      state.isNightActionRequired = true;
    },

    setGamePhase: (state, action: PayloadAction<GamePhase>) => {
      state.phase = action.payload;
      if (action.payload === 'NIGHT') {
        state.dayCount += 1;
      }
    },

    addPlayer: (state, action: PayloadAction<{ name: string; role: GameRole }>) => {
      const newPlayer: Player = {
        id: uuidv4(),
        name: action.payload.name,
        role: action.payload.role,
        isAlive: true,
        isRevealed: false,
        actionTarget: null
      };
      state.players.push(newPlayer);
    },

    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.id !== action.payload);
    },

    updatePlayer: (state, action: PayloadAction<{id: string, updates: Partial<Player>}>) => {
      const index = state.players.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.players[index] = { ...state.players[index], ...action.payload.updates };
      }
    },

    addVote: (state, action: PayloadAction<{voterId: string, targetId: string}>) => {
      state.votes[action.payload.voterId] = action.payload.targetId;
    },

    clearVotes: (state) => {
      state.votes = {};
    },

    addNightAction: (state, action: PayloadAction<{playerId: string, targetId: string}>) => {
      state.nightActions[action.payload.playerId] = action.payload.targetId;
      state.isNightActionRequired = false;
    },

    clearNightActions: (state) => {
      state.nightActions = {};
      state.isNightActionRequired = true;
    },

    setWinner: (state, action: PayloadAction<'VAMPIRES' | 'VILLAGERS'>) => {
      state.winner = action.payload;
      state.phase = 'ENDED';
    },

    nextTurn: (state) => {
      let nextIndex = state.currentTurn + 1;
      if (nextIndex >= state.players.length) {
        nextIndex = 0;
      }
      // Ölü oyuncuları atla
      while (!state.players[nextIndex].isAlive) {
        nextIndex = (nextIndex + 1) % state.players.length;
      }
      state.currentTurn = nextIndex;
    },

    selectPlayer: (state, action: PayloadAction<string | null>) => {
      state.selectedPlayer = action.payload;
    },

    revealRole: (state, action: PayloadAction<string>) => {
      const player = state.players.find(p => p.id === action.payload);
      if (player) {
        player.isRevealed = true;
      }
    },

    resetGame: () => initialState,

    shufflePlayers: (state) => {
      for (let i = state.players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.players[i], state.players[j]] = [state.players[j], state.players[i]];
      }
    }
  }
});

// Selectors
export const selectGameState = (state: { game: GameState }) => state.game;
export const selectCurrentPlayer = (state: { game: GameState }) => 
  state.game.players[state.game.currentTurn];
export const selectAlivePlayers = (state: { game: GameState }) =>
  state.game.players.filter(p => p.isAlive);
export const selectPlayersByRole = (state: { game: GameState }, role: GameRole) =>
  state.game.players.filter(p => p.role === role);

export const {
  startGame,
  setGamePhase,
  addPlayer,
  removePlayer,
  updatePlayer,
  addVote,
  clearVotes,
  addNightAction,
  clearNightActions,
  setWinner,
  nextTurn,
  selectPlayer,
  revealRole,
  resetGame,
  shufflePlayers
} = gameSlice.actions;

export default gameSlice.reducer; 