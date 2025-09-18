import React, { useState } from "react";
import "./App.css";
import GameSetup from "./components/GameSetup";
import GameBoard from "./components/GameBoard";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing'
  const [gameSettings, setGameSettings] = useState(null);

  const handleStartGame = (settings) => {
    setGameSettings(settings);
    setGameState('playing');
  };

  const handleNewGame = () => {
    setGameSettings(null);
    setGameState('setup');
  };

  return (
    <div className="App">
      {gameState === 'setup' ? (
        <GameSetup onStartGame={handleStartGame} />
      ) : (
        <GameBoard 
          gameSettings={gameSettings} 
          onNewGame={handleNewGame}
        />
      )}
      <Toaster />
    </div>
  );
}

export default App;