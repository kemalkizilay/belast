import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { GamePhase, Player } from '../shared/types/game.types';

interface GameState {
  phase: GamePhase;
  players: Player[];
  currentTurn: number;
  votes: Record<string, string>;
  nightActions: Array<{
    playerId: string;
    targetId: string;
  }>;
  winner: 'VILLAGERS' | 'VAMPIRES' | null;
  dayCount: number;
  isNightActionRequired: boolean;
  selectedPlayer: string | null;
}

const initialState: GameState = {
  phase: 'SETUP',
  players: [],
  currentTurn: 0,
  votes: {},
  nightActions: [],
  winner: null,
  dayCount: 1,
  isNightActionRequired: false,
  selectedPlayer: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGamePhase: (state, action: PayloadAction<GamePhase>) => {
      state.phase = action.payload;
    },
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter(p => p.id !== action.payload);
    },
    updatePlayer: (state, action: PayloadAction<{ id: string; updates: Partial<Player> }>) => {
      const index = state.players.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.players[index] = { ...state.players[index], ...action.payload.updates };
      }
    },
    addVote: (state, action: PayloadAction<{ voterId: string; targetId: string }>) => {
      state.votes[action.payload.voterId] = action.payload.targetId;
    },
    clearVotes: (state) => {
      state.votes = {};
    },
    addNightAction: (state, action: PayloadAction<{ playerId: string; targetId: string }>) => {
      state.nightActions.push(action.payload);
    },
    clearNightActions: (state) => {
      state.nightActions = [];
    },
    setWinner: (state, action: PayloadAction<'VILLAGERS' | 'VAMPIRES'>) => {
      state.winner = action.payload;
    },
    nextTurn: (state) => {
      state.currentTurn = (state.currentTurn + 1) % state.players.length;
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
    },
  },
});

export const {
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
  shufflePlayers,
} = gameSlice.actions;

export const selectGameState = (state: RootState) => state.game;

export default gameSlice.reducer;
