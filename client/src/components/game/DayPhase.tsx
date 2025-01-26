import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectGameState, setGamePhase, addVote, revealRole } from '../../store/gameSlice';
import { ROLE_DETAILS } from '../../../../shared/types/game.types';

const Container = styled(motion.div)`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled(motion.h1)`
  color: #F1C40F;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  margin-bottom: 2rem;
`;

const PlayerGrid = styled(motion.div)`
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
`;

const Button = styled(motion.button)`
  background: #F1C40F;
  color: black;
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

const ExecutionOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ExecutionScene = styled(motion.div)`
  text-align: center;
  color: white;
`;

const Rope = styled(motion.div)`
  width: 4px;
  height: 100px;
  background: #8B4513;
  margin: 0 auto;
  transform-origin: top center;
`;

const VoteResults = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
`;

const HunterOverlay = styled(ExecutionOverlay)``;

const HunterScene = styled(ExecutionScene)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const GunAnimation = styled(motion.div)`
  font-size: 4rem;
  margin: 2rem 0;
`;

const PlayerSelection = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const DayPhase: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showExecution, setShowExecution] = useState(false);
  const [executedPlayer, setExecutedPlayer] = useState<string | null>(null);
  const [showHunterAction, setShowHunterAction] = useState(false);
  const [hunterTarget, setHunterTarget] = useState<string | null>(null);
  const [isHunterSuccessful, setIsHunterSuccessful] = useState(false);

  const handlePlayerSelect = (playerId: string) => {
    if (!gameState.players.find(p => p.id === playerId)?.isAlive) return;
    setSelectedPlayer(playerId);
  };

  const handleVote = () => {
    if (!selectedPlayer) return;
    dispatch(addVote({
      voterId: gameState.currentTurn.toString(),
      targetId: selectedPlayer
    }));
  };

  const handleHunterAction = async (targetId: string) => {
    setHunterTarget(targetId);
    
    // %50 şans hesaplama
    const isSuccessful = Math.random() < 0.5;
    setIsHunterSuccessful(isSuccessful);

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isSuccessful) {
      // Hedefi öldür ve rolünü göster
      dispatch(revealRole(targetId));
      // TODO: Hedefi öldürmek için gerekli action'ı ekle
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowHunterAction(false);
    dispatch(setGamePhase('NIGHT'));
  };

  const handleExecution = async () => {
    // En çok oy alan oyuncuyu bul
    const voteCount: Record<string, number> = {};
    Object.values(gameState.votes).forEach(targetId => {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1;
    });
    
    const mostVotedPlayer = Object.entries(voteCount).reduce((a, b) => 
      (voteCount[a[0]] > voteCount[b[0]] ? a : b))[0];

    setExecutedPlayer(mostVotedPlayer);
    setShowExecution(true);

    // Dramatik bir bekleme
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Rolü ortaya çıkar
    dispatch(revealRole(mostVotedPlayer));
    
    // Eğer öldürülen kişi avcı ise
    const executedPlayerData = gameState.players.find(p => p.id === mostVotedPlayer);
    if (executedPlayerData?.role === 'HUNTER') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowExecution(false);
      setShowHunterAction(true);
    } else {
      // Biraz daha bekle ve gece fazına geç
      await new Promise(resolve => setTimeout(resolve, 2000));
      dispatch(setGamePhase('NIGHT'));
    }
  };

  return (
    <>
      <Container
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Title
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          ☀️ Köy Meydanı
        </Title>

        <PlayerGrid
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {gameState.players.map((player, index) => (
            <PlayerCard
              key={player.id}
              isSelectable={player.isAlive}
              onClick={() => handlePlayerSelect(player.id)}
              whileHover={{ scale: player.isAlive ? 1.05 : 1 }}
              whileTap={{ scale: player.isAlive ? 0.95 : 1 }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                border: selectedPlayer === player.id ? '2px solid #F1C40F' : 'none'
              }}
            >
              <span>{player.name}</span>
              {player.isRevealed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {ROLE_DETAILS[player.role].icon}
                  <div>{ROLE_DETAILS[player.role].name}</div>
                </motion.div>
              )}
              {!player.isAlive && <span>💀</span>}
            </PlayerCard>
          ))}
        </PlayerGrid>

        <VoteResults
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3>Oylar:</h3>
          {Object.entries(gameState.votes).map(([voterId, targetId]) => {
            const voter = gameState.players.find(p => p.id === voterId);
            const target = gameState.players.find(p => p.id === targetId);
            return (
              <div key={voterId}>
                {voter?.name} ➡️ {target?.name}
              </div>
            );
          })}
        </VoteResults>

        <Button
          onClick={Object.keys(gameState.votes).length === gameState.players.filter(p => p.isAlive).length 
            ? handleExecution 
            : handleVote}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!selectedPlayer}
        >
          {Object.keys(gameState.votes).length === gameState.players.filter(p => p.isAlive).length 
            ? "İnfazı Gerçekleştir" 
            : "Oy Ver"}
        </Button>
      </Container>

      <AnimatePresence>
        {showExecution && executedPlayer && (
          <ExecutionOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ExecutionScene>
              <Rope
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ 
                  y: 0,
                  opacity: 1,
                  rotate: [0, -5, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  delay: 1
                }}
              >
                <h2>Köylüler kararını verdi...</h2>
                <h1>{gameState.players.find(p => p.id === executedPlayer)?.name}</h1>
                <h3>asılıyor...</h3>
              </motion.div>
            </ExecutionScene>
          </ExecutionOverlay>
        )}

        {showHunterAction && (
          <HunterOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HunterScene>
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                Avcı son nefesinde silahına uzanıyor...
              </motion.h2>

              {!hunterTarget ? (
                <>
                  <motion.h3>Kimi vurmak istiyor?</motion.h3>
                  <PlayerSelection>
                    {gameState.players
                      .filter(p => p.isAlive && p.id !== executedPlayer)
                      .map((player, index) => (
                        <PlayerCard
                          key={player.id}
                          isSelectable={true}
                          onClick={() => handleHunterAction(player.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span>{player.name}</span>
                        </PlayerCard>
                      ))}
                  </PlayerSelection>
                </>
              ) : (
                <>
                  <GunAnimation
                    initial={{ rotate: -45, x: -100 }}
                    animate={{ 
                      rotate: 0,
                      x: 0,
                      scale: isHunterSuccessful ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 1 }}
                  >
                    🔫
                  </GunAnimation>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <h2>
                      {isHunterSuccessful 
                        ? `${gameState.players.find(p => p.id === hunterTarget)?.name} vuruldu!` 
                        : 'Avcı son atışını kaçırdı...'}
                    </h2>
                  </motion.div>
                </>
              )}
            </HunterScene>
          </HunterOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default DayPhase; 