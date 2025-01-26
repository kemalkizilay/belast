import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { GameRole, ROLE_DETAILS } from '../../../../shared/types/game.types';
import { addPlayer, removePlayer, startGame, shufflePlayers, selectGameState } from '../../store/gameSlice';

const Container = styled.div`
  min-height: 100vh;
  background: #1A1A2E;
  padding: 2rem;
  color: white;
`;

const SetupForm = styled.form`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  text-align: center;
  color: #E74C3C;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: 2px solid #E74C3C;
  }
`;

const RoleSelect = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  
  option {
    background: #1A1A2E;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  background: #E74C3C;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  
  &:disabled {
    background: #7F8C8D;
    cursor: not-allowed;
  }
`;

const PlayerList = styled.div`
  margin-top: 2rem;
`;

const PlayerCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const RoleIcon = styled.span`
  font-size: 1.5rem;
`;

const PlayerName = styled.span`
  flex: 1;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #E74C3C;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.2rem;
  
  &:hover {
    color: #C0392B;
  }
`;

const RoleSummary = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  color: #E74C3C;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const GameSetup: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector(selectGameState);
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState<GameRole>('VILLAGER');
  const [error, setError] = useState<string | null>(null);

  const countRoles = () => {
    return {
      vampires: gameState.players.filter(p => p.role === 'VAMPIRE').length,
      doctors: gameState.players.filter(p => p.role === 'DOCTOR').length,
      hunters: gameState.players.filter(p => p.role === 'HUNTER').length,
      seers: gameState.players.filter(p => p.role === 'SEER').length,
      villagers: gameState.players.filter(p => p.role === 'VILLAGER').length,
    };
  };

  const validateRoleSelection = (role: GameRole): boolean => {
    const roles = countRoles();
    const totalPlayers = gameState.players.length;
    const maxVampires = Math.floor((totalPlayers + 1) / 3);

    switch (role) {
      case 'VAMPIRE':
        if (roles.vampires >= maxVampires) {
          setError(`Maksimum ${maxVampires} vampir olabilir`);
          return false;
        }
        break;
      case 'DOCTOR':
        if (roles.doctors >= 1) {
          setError('Sadece 1 doktor olabilir');
          return false;
        }
        break;
      case 'HUNTER':
        if (roles.hunters >= 1) {
          setError('Sadece 1 avcı olabilir');
          return false;
        }
        break;
      case 'SEER':
        if (roles.seers >= 1) {
          setError('Sadece 1 kahin olabilir');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && validateRoleSelection(selectedRole)) {
      dispatch(addPlayer({ name: playerName.trim(), role: selectedRole }));
      setPlayerName('');
      setSelectedRole('VILLAGER');
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    dispatch(removePlayer(playerId));
  };

  const handleStartGame = () => {
    dispatch(shufflePlayers());
    dispatch(startGame());
  };

  const roles = countRoles();
  const totalPlayers = gameState.players.length;
  const minPlayers = 4;
  const maxPlayers = 15;
  const canAddMorePlayers = totalPlayers < maxPlayers;
  
  const canStartGame = 
    totalPlayers >= minPlayers && 
    roles.vampires >= 1 &&
    roles.vampires <= Math.floor(totalPlayers / 3) &&
    roles.doctors <= 1 &&
    roles.hunters <= 1 &&
    roles.seers <= 1;

  return (
    <Container>
      <SetupForm onSubmit={handleSubmit}>
        <Title>Vampir Köylü - Oyun Kurulumu</Title>
        
        <InputGroup>
          <Label>Oyuncu Adı</Label>
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Oyuncu adını girin"
            disabled={!canAddMorePlayers}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Rol</Label>
          <RoleSelect
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as GameRole)}
            disabled={!canAddMorePlayers}
          >
            {Object.entries(ROLE_DETAILS).map(([role, info]) => (
              <option key={role} value={role}>
                {info.icon} {info.name}
              </option>
            ))}
          </RoleSelect>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputGroup>

        <Button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!canAddMorePlayers}
        >
          Oyuncu Ekle
        </Button>

        <RoleSummary>
          <h3>Rol Dağılımı:</h3>
          <p>🧛 Vampirler: {roles.vampires}</p>
          <p>👨‍⚕️ Doktor: {roles.doctors}</p>
          <p>🏹 Avcı: {roles.hunters}</p>
          <p>🔮 Kahin: {roles.seers}</p>
          <p>👨‍🌾 Köylüler: {roles.villagers}</p>
          <p>Toplam: {totalPlayers}/{maxPlayers} Oyuncu</p>
        </RoleSummary>

        <Button
          type="button"
          onClick={handleStartGame}
          disabled={!canStartGame}
          whileHover={canStartGame ? { scale: 1.02 } : {}}
          whileTap={canStartGame ? { scale: 0.98 } : {}}
          style={{ marginTop: '1rem' }}
        >
          Oyunu Başlat ({totalPlayers}/{minPlayers} Oyuncu)
        </Button>

        <PlayerList>
          {gameState.players.map(player => (
            <PlayerCard key={player.id}>
              <RoleIcon>{ROLE_DETAILS[player.role].icon}</RoleIcon>
              <PlayerName>{player.name}</PlayerName>
              <span>{ROLE_DETAILS[player.role].name}</span>
              <RemoveButton onClick={() => handleRemovePlayer(player.id)}>
                ✖
              </RemoveButton>
            </PlayerCard>
          ))}
        </PlayerList>
      </SetupForm>
    </Container>
  );
};

export default GameSetup; 