import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GameState, Player, GameRole } from '../../../shared/types/game.types';
import { 
  setGamePhase, 
  updatePlayer, 
  addNightAction, 
  clearNightActions,
  setWinner
} from '../store/gameSlice';

// Selector
const selectGameState = (state: { game: GameState }) => state.game;

export const useGameLogic = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);

  const checkWinCondition = useCallback(() => {
    const alivePlayers = gameState.players.filter(p => p.isAlive);
    const aliveVampires = alivePlayers.filter(p => p.role === 'VAMPIRE');
    const aliveVillagers = alivePlayers.filter(p => p.role !== 'VAMPIRE');

    if (aliveVampires.length === 0) {
      dispatch(setWinner('VILLAGERS'));
      dispatch(setGamePhase('ENDED'));
      return true;
    }

    if (aliveVampires.length >= aliveVillagers.length) {
      dispatch(setWinner('VAMPIRES'));
      dispatch(setGamePhase('ENDED'));
      return true;
    }

    return false;
  }, [dispatch, gameState.players]);

  const handleNightPhase = useCallback(() => {
    dispatch(setGamePhase('NIGHT'));
    dispatch(clearNightActions());

    // Gece aksiyonlarını sırayla işle
    const nightActionOrder: GameRole[] = ['VAMPIRE', 'DOCTOR', 'SEER'];
    let currentPlayerIndex = 0;

    const processNightAction = (player: Player) => {
      if (!player.isAlive) return;

      const role = player.role;
      if (nightActionOrder.includes(role)) {
        // Oyuncunun gece aksiyonu var
        dispatch(updatePlayer({
          id: player.id,
          updates: { actionTarget: null }
        }));
      }
    };

    gameState.players.forEach(processNightAction);
  }, [dispatch, gameState.players]);

  const handleDayPhase = useCallback(() => {
    // Gece aksiyonlarının sonuçlarını işle
    const vampireKills = new Set<string>();
    const doctorHeals = new Set<string>();

    // Vampir saldırılarını topla
    Object.entries(gameState.nightActions).forEach(([playerId, targetId]) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (player?.role === 'VAMPIRE') {
        vampireKills.add(targetId);
      }
    });

    // Doktor iyileştirmelerini topla
    Object.entries(gameState.nightActions).forEach(([playerId, targetId]) => {
      const player = gameState.players.find(p => p.id === playerId);
      if (player?.role === 'DOCTOR') {
        doctorHeals.add(targetId);
      }
    });

    // Ölümleri ve iyileştirmeleri uygula
    vampireKills.forEach(targetId => {
      if (!doctorHeals.has(targetId)) {
        dispatch(updatePlayer({
          id: targetId,
          updates: { isAlive: false }
        }));
      }
    });

    dispatch(setGamePhase('DAY'));
    dispatch(clearNightActions());

    // Kazanan kontrolü
    checkWinCondition();
  }, [dispatch, gameState.nightActions, gameState.players, checkWinCondition]);

  const handlePlayerAction = useCallback((playerId: string, targetId: string) => {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAlive) return;

    if (gameState.phase === 'NIGHT' && player.role !== 'VILLAGER') {
      dispatch(addNightAction({ playerId, targetId }));
    }
  }, [dispatch, gameState.phase, gameState.players]);

  const handleVotePhase = useCallback(() => {
    dispatch(setGamePhase('VOTING'));
  }, [dispatch]);

  return {
    handleNightPhase,
    handleDayPhase,
    handlePlayerAction,
    handleVotePhase,
    checkWinCondition,
    gameState
  };
};

export default useGameLogic; 