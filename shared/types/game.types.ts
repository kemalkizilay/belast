export type GamePhase = 'SETUP' | 'FIRST_NIGHT' | 'NIGHT' | 'DAY' | 'VOTING' | 'ENDED';
export type GameRole = 'VAMPIRE' | 'VILLAGER' | 'DOCTOR' | 'SEER' | 'HUNTER';

export interface Player {
  id: string;
  name: string;
  role: GameRole;
  isAlive: boolean;
  isRevealed: boolean;
  actionTarget: string | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentTurn: number;
  votes: Record<string, string>;
  nightActions: Record<string, string>;
  winner: 'VAMPIRES' | 'VILLAGERS' | null;
  dayCount: number;
  isNightActionRequired: boolean;
  selectedPlayer: string | null;
}

export interface RoleInfo {
  name: string;
  icon: string;
  description: string;
  canActAtNight: boolean;
  actionDescription?: string;
  minPlayers: number;
  maxPlayers: number;
}

export const ROLE_DETAILS: Record<GameRole, RoleInfo> = {
  VAMPIRE: {
    name: 'Vampir',
    icon: '🧛',
    description: 'Her gece bir köylüyü öldürür.',
    canActAtNight: true,
    actionDescription: 'Öldürmek istediğin köylüyü seç',
    minPlayers: 2,
    maxPlayers: 3
  },
  VILLAGER: {
    name: 'Köylü',
    icon: '👨‍🌾',
    description: 'Gündüz vampirleri bulmaya çalışır.',
    canActAtNight: false,
    minPlayers: 3,
    maxPlayers: 8
  },
  DOCTOR: {
    name: 'Doktor',
    icon: '👨‍⚕️',
    description: 'Her gece bir kişiyi iyileştirir.',
    canActAtNight: true,
    actionDescription: 'İyileştirmek istediğin kişiyi seç',
    minPlayers: 1,
    maxPlayers: 1
  },
  SEER: {
    name: 'Kahin',
    icon: '🔮',
    description: 'Her gece bir kişinin vampir olup olmadığını görür.',
    canActAtNight: true,
    actionDescription: 'Rolünü görmek istediğin kişiyi seç',
    minPlayers: 1,
    maxPlayers: 1
  },
  HUNTER: {
    name: 'Avcı',
    icon: '🔫',
    description: 'Öldürüldüğünde %50 şansla başka birini de öldürür.',
    canActAtNight: false,
    minPlayers: 1,
    maxPlayers: 1
  }
}; 