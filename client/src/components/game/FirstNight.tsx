import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { GameRole, ROLE_DETAILS } from '../../../../shared/types/game.types';
import { selectGameState, nextTurn, setGamePhase, revealRole } from '../../store/gameSlice';
import RoleCard from './RoleCard';

const Container = styled.div`
  min-height: 100vh;
  background: #1A1A2E;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
`;

const Title = styled.h1`
  color: #E74C3C;
  font-family: 'Poppins', sans-serif;
  text-align: center;
  margin-bottom: 2rem;
`;

const Instruction = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const CardContainer = styled(motion.div)`
  margin: 2rem 0;
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
  margin-top: 2rem;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RoleDescription = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
  max-width: 600px;
  text-align: center;
`;

const FirstNight: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const currentPlayer = gameState.players[gameState.currentTurn];
  const roleInfo = ROLE_DETAILS[currentPlayer.role];

  const handleReveal = () => {
    setIsCardRevealed(true);
    dispatch(revealRole(currentPlayer.id));
  };

  const handleNext = () => {
    if (gameState.currentTurn === gameState.players.length - 1) {
      // Son oyuncuya gelindiğinde normal gece fazına geç
      dispatch(setGamePhase('NIGHT'));
    } else {
      // Sıradaki oyuncuya geç
      dispatch(nextTurn());
      setIsCardRevealed(false);
      setShowDescription(false);
    }
  };

  const handleUnderstand = () => {
    setShowDescription(true);
  };

  return (
    <Container>
      <Title>İlk Gece</Title>
      
      <PlayerInfo>
        <h2>{currentPlayer.name}</h2>
        <span>rolünü öğreniyor...</span>
      </PlayerInfo>

      <Instruction>
        {!isCardRevealed 
          ? 'Rolünü görmek için kartı çevir'
          : !showDescription 
            ? 'Rolünü ve özelliklerini oku'
            : 'Hazır olduğunda devam et'
        }
      </Instruction>

      <CardContainer>
        <RoleCard
          role={currentPlayer.role}
          isRevealed={isCardRevealed}
          onReveal={handleReveal}
          size="large"
        />
      </CardContainer>

      <AnimatePresence>
        {isCardRevealed && !showDescription && (
          <Button
            onClick={handleUnderstand}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            Anladım
          </Button>
        )}

        {showDescription && (
          <RoleDescription
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h3>Rol Özellikleri</h3>
            <p>{roleInfo.description}</p>
            {roleInfo.actionDescription && (
              <p>Aksiyon: {roleInfo.actionDescription}</p>
            )}
            <Button onClick={handleNext} style={{ marginTop: '1rem' }}>
              Devam Et
            </Button>
          </RoleDescription>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default FirstNight; 