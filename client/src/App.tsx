import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectGameState } from './store/gameSlice';
import GameSetup from './components/game/GameSetup';
import FirstNight from './components/game/FirstNight';
import NightPhase from './components/game/NightPhase';
import DayPhase from './components/game/DayPhase';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #1A1A2E;
  color: white;
`;

const App: React.FC = () => {
  const gameState = useSelector(selectGameState);

  const renderPhase = () => {
    switch (gameState.phase) {
      case 'SETUP':
        return <GameSetup />;
      case 'FIRST_NIGHT':
        return <FirstNight />;
      case 'NIGHT':
        return <NightPhase />;
      case 'DAY':
        return <DayPhase />;
      default:
        return <GameSetup />;
    }
  };

  return (
    <AppContainer>
      {renderPhase()}
    </AppContainer>
  );
};

export default App;
