export type GamePhase = 'SETUP' | 'NIGHT' | 'DAY' | 'VOTING' | 'ENDED';
export type GameRole = 'VAMPIRE' | 'VILLAGER' | 'DOCTOR' | 'HUNTER' | 'SEER';

export interface Player {
  id: string;
  name: string;
  role: GameRole;
  isAlive: boolean;
  isRevealed: boolean;
  actionTarget?: string;
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
  description: string;
  icon: string;
  color: string;
  canActAtNight: boolean;
  actionDescription?: string;
}

export const ROLE_DETAILS: Record<GameRole, RoleInfo> = {
  VAMPIRE: {
    name: 'Vampir',
    description: 'Her gece bir köylüyü öldürür',
    icon: '🧛',
    color: '#8B0000',
    canActAtNight: true,
    actionDescription: 'Öldürmek istediğin köylüyü seç'
  },
  VILLAGER: {
    name: 'Köylü',
    description: 'Vampirleri bulmaya çalışır',
    icon: '👨‍🌾',
    color: '#4B6F44',
    canActAtNight: false
  },
  DOCTOR: {
    name: 'Doktor',
    description: 'Her gece bir kişiyi iyileştirir',
    icon: '👨‍⚕️',
    color: '#4169E1',
    canActAtNight: true,
    actionDescription: 'İyileştirmek istediğin kişiyi seç'
  },
  HUNTER: {
    name: 'Avcı',
    description: 'Öldüğünde bir kişiyi öldürebilir',
    icon: '🏹',
    color: '#8B4513',
    canActAtNight: false,
    actionDescription: 'Öldürmek istediğin kişiyi seç'
  },
  SEER: {
    name: 'Kahin',
    description: 'Her gece bir kişinin rolünü görebilir',
    icon: '🔮',
    color: '#9932CC',
    canActAtNight: true,
    actionDescription: 'Rolünü görmek istediğin kişiyi seç'
  }
}; 