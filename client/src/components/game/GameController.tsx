import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import useGameLogic from '../../hooks/useGameLogic';
import { ROLE_DETAILS } from '../../../../shared/types/game.types';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: white;
`;

const PhaseInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PhaseTitle = styled.h2`
  margin: 0;
  font-family: 'Poppins', sans-serif;
  color: #E74C3C;
`;

const ActionButton = styled(motion.button)`
  background: #E74C3C;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  
  &:disabled {
    background: #7F8C8D;
    cursor: not-allowed;
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RoleIcon = styled.span`
  font-size: 1.5rem;
`;

const GameController: React.FC = () => {
  const {
    handleNightPhase,
    handleDayPhase,
    handleVotePhase,
    gameState
  } = useGameLogic();

  const currentPlayer = gameState.players[gameState.currentTurn];

  useEffect(() => {
    // Otomatik faz geçişleri için kontroller
    if (gameState.phase === 'NIGHT' && Object.keys(gameState.nightActions).length === gameState.players.filter(p => ROLE_DETAILS[p.role].canActAtNight).length) {
      handleDayPhase();
    }
  }, [gameState.phase, gameState.nightActions, gameState.players, handleDayPhase]);

  const getPhaseAction = () => {
    switch (gameState.phase) {
      case 'DAY':
        return {
          text: 'Oylama Başlat',
          action: handleVotePhase
        };
      case 'VOTING':
        return {
          text: 'Geceye Geç',
          action: handleNightPhase
        };
      case 'NIGHT':
        return {
          text: 'Gündüze Geç',
          action: handleDayPhase
        };
      default:
        return null;
    }
  };

  const phaseAction = getPhaseAction();

  return (
    <Container>
      <PhaseInfo>
        <div>
          <PhaseTitle>
            {gameState.phase === 'NIGHT' ? '🌙 Gece Fazı' :
             gameState.phase === 'DAY' ? '☀️ Gündüz Fazı' :
             gameState.phase === 'VOTING' ? '🗳️ Oylama Fazı' :
             '🎮 Oyun'}
          </PhaseTitle>
          {currentPlayer && (
            <PlayerInfo>
              <RoleIcon>{ROLE_DETAILS[currentPlayer.role].icon}</RoleIcon>
              <span>{currentPlayer.name} ({ROLE_DETAILS[currentPlayer.role].name})</span>
            </PlayerInfo>
          )}
        </div>
        {phaseAction && (
          <ActionButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={phaseAction.action}
          >
            {phaseAction.text}
          </ActionButton>
        )}
      </PhaseInfo>
    </Container>
  );
};

export default GameController; 