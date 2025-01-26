import React from 'react';
import styled from 'styled-components';
import { GameRole, ROLE_DETAILS } from '../../../../shared/types/game.types';
import { motion } from 'framer-motion';

interface RoleCardProps {
  role: GameRole;
  isRevealed: boolean;
  onReveal?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const StyledCard = styled(motion.div)<{ size: RoleCardProps['size'] }>`
  width: ${({ size }) => 
    size === 'small' ? '120px' : 
    size === 'large' ? '200px' : '160px'};
  height: ${({ size }) => 
    size === 'small' ? '180px' : 
    size === 'large' ? '300px' : '240px'};
  perspective: 1000px;
  cursor: pointer;
`;

const CardInner = styled(motion.div)<{ isRevealed: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transform-style: preserve-3d;
  transform: ${({ isRevealed }) => isRevealed ? 'rotateY(180deg)' : 'rotateY(0)'};
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const CardFront = styled(CardFace)`
  background: linear-gradient(45deg, #2C3E50, #3498DB);
  color: white;
`;

const CardBack = styled(CardFace)<{ roleColor: string }>`
  background: ${({ roleColor }) => roleColor};
  color: white;
  transform: rotateY(180deg);
`;

const RoleIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const RoleName = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
`;

const RoleDescription = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const CardPattern = styled.div`
  font-size: 2rem;
  opacity: 0.2;
`;

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  isRevealed, 
  onReveal,
  size = 'medium'
}) => {
  const roleInfo = ROLE_DETAILS[role];

  const handleClick = () => {
    if (onReveal) {
      onReveal();
    }
  };

  return (
    <StyledCard 
      size={size}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <CardInner isRevealed={isRevealed}>
        <CardFront>
          <CardPattern>❓</CardPattern>
        </CardFront>
        <CardBack roleColor={roleInfo.color}>
          <RoleIcon>{roleInfo.icon}</RoleIcon>
          <RoleName>{roleInfo.name}</RoleName>
          <RoleDescription>{roleInfo.description}</RoleDescription>
        </CardBack>
      </CardInner>
    </StyledCard>
  );
};

export default RoleCard; 