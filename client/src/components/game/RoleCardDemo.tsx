import React, { useState } from 'react';
import styled from 'styled-components';
import RoleCard from './RoleCard';
import { GameRole } from '../../../../shared/types/game.types';

const DemoContainer = styled.div`
  min-height: 100vh;
  background: #1A1A2E;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 2rem;
  font-family: 'Poppins', sans-serif;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
`;

const roles: GameRole[] = ['VAMPIRE', 'VILLAGER', 'DOCTOR', 'HUNTER', 'SEER'];

const RoleCardDemo: React.FC = () => {
  const [revealedCards, setRevealedCards] = useState<Record<GameRole, boolean>>({
    VAMPIRE: false,
    VILLAGER: false,
    DOCTOR: false,
    HUNTER: false,
    SEER: false
  });

  const handleReveal = (role: GameRole) => {
    setRevealedCards(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  return (
    <DemoContainer>
      <Title>Vampir Köylü - Rol Kartları</Title>
      <CardGrid>
        {roles.map(role => (
          <RoleCard
            key={role}
            role={role}
            isRevealed={revealedCards[role]}
            onReveal={() => handleReveal(role)}
            size="large"
          />
        ))}
      </CardGrid>
    </DemoContainer>
  );
};

export default RoleCardDemo; 