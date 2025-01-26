import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addPlayer, setGamePhase, selectGameState } from '../../store/gameSlice';
import { GameRole, ROLE_DETAILS } from '../../shared/types/game.types';
import { v4 as uuidv4 } from 'uuid';

const Container = styled(motion.div)`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #E74C3C;
  text-align: center;
  margin-bottom: 2rem;
`;

const SetupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #BDC3C7;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const RoleSelect = styled.select`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Button = styled(motion.button)`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #E74C3C;
  color: white;
  cursor: pointer;
  
  &:disabled {
    background: #7F8C8D;
    cursor: not-allowed;
  }
`;

const PlayerList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const PlayerCard = styled(motion.div)`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const RoleIcon = styled.span`
  font-size: 2rem;
`;

const PlayerName = styled.span`
  color: #ECF0F1;
`;

const GameSetup: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);
  const [name, setName] = useState('');
  const [role, setRole] = useState<GameRole>('VILLAGER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    dispatch(addPlayer({
      id: uuidv4(),
      name: name.trim(),
      role,
      isAlive: true,
      isRevealed: false,
      actionTarget: null
    }));

    setName('');
  };

  const handleStartGame = () => {
    dispatch(setGamePhase('FIRST_NIGHT'));
  };

  const isValidSetup = () => {
    const roleCounts = gameState.players.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {} as Record<GameRole, number>);

    return Object.entries(roleCounts).every(([role, count]) => {
      const roleInfo = ROLE_DETAILS[role as GameRole];
      return count >= roleInfo.minPlayers && count <= roleInfo.maxPlayers;
    });
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>Vampir Köylü</Title>
      
      <SetupForm onSubmit={handleSubmit}>
        <InputGroup>
          <Label>Oyuncu Adı</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Oyuncu adını girin"
          />
        </InputGroup>

        <InputGroup>
          <Label>Rol</Label>
          <RoleSelect
            value={role}
            onChange={(e) => setRole(e.target.value as GameRole)}
          >
            {Object.entries(ROLE_DETAILS).map(([role, info]) => (
              <option key={role} value={role}>
                {info.icon} {info.name}
              </option>
            ))}
          </RoleSelect>
        </InputGroup>

        <Button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!name.trim()}
        >
          Oyuncu Ekle
        </Button>
      </SetupForm>

      <PlayerList>
        {gameState.players.map((player, index) => (
          <PlayerCard
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <RoleIcon>{ROLE_DETAILS[player.role].icon}</RoleIcon>
            <PlayerName>{player.name}</PlayerName>
            <small>{ROLE_DETAILS[player.role].name}</small>
          </PlayerCard>
        ))}
      </PlayerList>

      {gameState.players.length > 0 && (
        <Button
          onClick={handleStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!isValidSetup()}
          style={{ marginTop: '2rem' }}
        >
          Oyunu Başlat
        </Button>
      )}
    </Container>
  );
};

export default GameSetup; 