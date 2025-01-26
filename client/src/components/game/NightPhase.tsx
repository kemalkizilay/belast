import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { GameRole, ROLE_DETAILS } from '../../../../shared/types/game.types';
import { selectGameState, nextTurn, setGamePhase, addNightAction } from '../../store/gameSlice';
import RoleCard from './RoleCard';

const Container = styled(motion.div)`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #E74C3C;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  margin-bottom: 2rem;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ActionArea = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

const PlayerCard = styled(motion.div)<{ isSelectable: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: ${({ isSelectable }) => isSelectable ? 'pointer' : 'not-allowed'};
  opacity: ${({ isSelectable }) => isSelectable ? 1 : 0.5};
  
  &:hover {
    transform: ${({ isSelectable }) => isSelectable ? 'translateY(-2px)' : 'none'};
    background: ${({ isSelectable }) => isSelectable ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const RoleIcon = styled.span`
  font-size: 2rem;
`;

const Button = styled(motion.button)`
  background: #E74C3C;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  
  &:disabled {
    background: #7F8C8D;
    cursor: not-allowed;
  }
`;

const ActionDescription = styled.p`
  text-align: center;
  font-size: 1.2rem;
  margin: 1rem 0;
  color: #E74C3C;
`;

const VampireInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(139, 0, 0, 0.3);
  border-radius: 8px;
`;

const RoleActionResult = styled(motion.div)`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(65, 105, 225, 0.3);
  border-radius: 8px;
  text-align: center;
`;

const WarningText = styled.p`
  color: #E74C3C;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const FadeOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TransitionText = styled(motion.h1)`
  color: white;
  font-size: 3rem;
  text-align: center;
`;

const NightPhase: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [vampireTargets, setVampireTargets] = useState<Record<string, string>>({});
  const [doctorSelfHeals, setDoctorSelfHeals] = useState<Record<string, number>>({});
  const [lastDoctorTarget, setLastDoctorTarget] = useState<string | null>(null);
  const [seerResult, setSeerResult] = useState<{playerId: string, isVampire: boolean} | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentPlayer = gameState.players[gameState.currentTurn];
  const roleInfo = ROLE_DETAILS[currentPlayer.role];

  const canSelectPlayer = (targetId: string): boolean => {
    // Oyuncu kendisini seçemez (Doktor hariç)
    if (targetId === currentPlayer.id && currentPlayer.role !== 'DOCTOR') {
      return false;
    }

    const target = gameState.players.find(p => p.id === targetId);
    if (!target?.isAlive) return false;

    // Vampirler diğer vampirleri seçemez
    if (currentPlayer.role === 'VAMPIRE' && target.role === 'VAMPIRE') {
      return false;
    }

    // Doktor aynı kişiyi üst üste iyileştiremez
    if (currentPlayer.role === 'DOCTOR' && targetId === lastDoctorTarget) {
      return false;
    }

    return true;
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!canSelectPlayer(playerId)) return;
    setSelectedPlayer(playerId);
  };

  const handleAction = () => {
    if (!selectedPlayer) return;

    if (currentPlayer.role === 'VAMPIRE') {
      setVampireTargets(prev => ({
        ...prev,
        [currentPlayer.id]: selectedPlayer
      }));
    }

    if (currentPlayer.role === 'DOCTOR') {
      // Doktor kendini iyileştirirse sayacı artır
      if (selectedPlayer === currentPlayer.id) {
        setDoctorSelfHeals(prev => ({
          ...prev,
          [currentPlayer.id]: (prev[currentPlayer.id] || 0) + 1
        }));
      }
      setLastDoctorTarget(selectedPlayer);
    }

    if (currentPlayer.role === 'SEER') {
      const target = gameState.players.find(p => p.id === selectedPlayer);
      if (target) {
        setSeerResult({
          playerId: selectedPlayer,
          isVampire: target.role === 'VAMPIRE'
        });
        // Kahin sonucu görmeden geçemesin
        return;
      }
    }

    dispatch(addNightAction({
      playerId: currentPlayer.id,
      targetId: selectedPlayer
    }));

    handleNextTurn();
  };

  const handlePhaseTransition = async () => {
    setIsTransitioning(true);
    
    // Gece fazından çıkış animasyonu
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    dispatch(setGamePhase('DAY'));
  };

  const handleNextTurn = () => {
    if (gameState.currentTurn === gameState.players.length - 1) {
      handlePhaseTransition();
    } else {
      dispatch(nextTurn());
      setSelectedPlayer(null);
      setSeerResult(null);
    }
  };

  return (
    <>
      <Container
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Title>🌙 Gece Fazı</Title>
        
        <PlayerInfo>
          <RoleIcon>{roleInfo.icon}</RoleIcon>
          <h2>{currentPlayer.name}</h2>
          <span>({roleInfo.name})</span>
        </PlayerInfo>

        <ActionArea
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ActionDescription>
            {roleInfo.actionDescription || 'Bu gece yapabileceğin bir aksiyon yok.'}
          </ActionDescription>

          {currentPlayer.role === 'VAMPIRE' && (
            <VampireInfo>
              <h3>Diğer Vampirlerin Hedefleri:</h3>
              {Object.entries(vampireTargets).map(([vampireId, targetId]) => {
                const vampire = gameState.players.find(p => p.id === vampireId);
                const target = gameState.players.find(p => p.id === targetId);
                if (vampire && target && vampire.id !== currentPlayer.id) {
                  return (
                    <p key={vampireId}>
                      {vampire.name} ➡️ {target.name}
                    </p>
                  );
                }
                return null;
              })}
            </VampireInfo>
          )}

          {currentPlayer.role === 'DOCTOR' && (
            <>
              <WarningText>
                {lastDoctorTarget && 'Aynı kişiyi üst üste iyileştiremezsin!'}
                {doctorSelfHeals[currentPlayer.id] >= 1 && 'Kendini sadece bir kere iyileştirebilirsin!'}
              </WarningText>
            </>
          )}

          {currentPlayer.role === 'SEER' && seerResult && (
            <RoleActionResult
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3>Kahin Görüşü</h3>
              <p>
                {gameState.players.find(p => p.id === seerResult.playerId)?.name}
                {seerResult.isVampire ? ' bir vampir! 🧛' : ' bir vampir değil ✨'}
              </p>
              <Button onClick={handleNextTurn}>Anladım</Button>
            </RoleActionResult>
          )}

          {roleInfo.canActAtNight && !seerResult && (
            <PlayerGrid>
              {gameState.players.map(player => (
                <PlayerCard
                  key={player.id}
                  isSelectable={canSelectPlayer(player.id)}
                  onClick={() => handlePlayerSelect(player.id)}
                  whileHover={{ scale: canSelectPlayer(player.id) ? 1.05 : 1 }}
                  whileTap={{ scale: canSelectPlayer(player.id) ? 0.95 : 1 }}
                  style={{
                    border: selectedPlayer === player.id ? '2px solid #E74C3C' : 'none'
                  }}
                >
                  <RoleIcon>{player.isRevealed ? ROLE_DETAILS[player.role].icon : '❓'}</RoleIcon>
                  <span>{player.name}</span>
                  {player.isRevealed && <small>{ROLE_DETAILS[player.role].name}</small>}
                  {currentPlayer.role === 'DOCTOR' && player.id === lastDoctorTarget && (
                    <small style={{ color: '#E74C3C' }}>Son iyileştirilen</small>
                  )}
                </PlayerCard>
              ))}
            </PlayerGrid>
          )}

          {!seerResult && (
            <Button
              onClick={roleInfo.canActAtNight ? handleAction : handleNextTurn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={roleInfo.canActAtNight && !selectedPlayer}
            >
              {roleInfo.canActAtNight ? 'Aksiyonu Uygula' : 'Devam Et'}
            </Button>
          )}
        </ActionArea>
      </Container>

      {isTransitioning && (
        <FadeOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <TransitionText
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: [0, 1, 1],
              rotate: [0, 0, 360]
            }}
            transition={{ duration: 2 }}
          >
            🌅 Güneş Doğuyor...
          </TransitionText>
        </FadeOverlay>
      )}
    </>
  );
};

export default NightPhase; 