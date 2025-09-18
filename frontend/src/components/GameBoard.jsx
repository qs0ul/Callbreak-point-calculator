import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Trophy, 
  Target, 
  Hash, 
  ArrowRight, 
  RotateCcw,
  Crown,
  TrendingUp,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import gameService from '../services/gameService';

const GameBoard = ({ gameSettings, onNewGame }) => {
  const [gameData, setGameData] = useState(null);
  const [roundInputs, setRoundInputs] = useState({});
  const [gameWinner, setGameWinner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (gameSettings.gameId) {
      loadGameData();
    }
  }, [gameSettings.gameId]);

  const loadGameData = async () => {
    try {
      setIsLoading(true);
      const data = await gameService.getGame(gameSettings.gameId);
      setGameData(data);
      
      // Check if game is already completed
      if (data.game.status === 'completed') {
        setGameWinner(data.game.winner);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoundInputChange = (playerIndex, type, value) => {
    const key = `${gameData.game.current_round}-${playerIndex}`;
    setRoundInputs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: parseInt(value) || 0
      }
    }));
  };

  const submitRound = async () => {
    if (!gameData) return;
    
    const currentRound = gameData.game.current_round;
    const playerData = [];
    
    // Prepare player data for submission
    for (let i = 0; i < gameSettings.players.length; i++) {
      const key = `${currentRound}-${i}`;
      const input = roundInputs[key];
      
      if (!input || input.bid === undefined || input.actual === undefined) {
        toast({
          title: "Incomplete Data",
          description: "Please fill in bid and actual tricks for all players",
          variant: "destructive"
        });
        return;
      }
      
      const points = gameService.calculatePoints(input.bid, input.actual);
      playerData.push({
        bid: input.bid,
        actual: input.actual,
        points: points
      });
    }

    setIsSubmitting(true);
    
    try {
      const result = await gameService.submitRound(
        gameSettings.gameId, 
        currentRound, 
        playerData
      );
      
      if (result.winner) {
        setGameWinner(result.winner);
        toast({
          title: "Game Over!",
          description: `${result.winner} wins with instant victory!`,
        });
      } else {
        toast({
          title: "Round Submitted",
          description: `Round ${currentRound} completed successfully`,
        });
        
        // Reload game data to get updated state
        await loadGameData();
        setRoundInputs({});
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentRoundInputs = () => {
    if (!gameData) return [];
    
    return gameSettings.players.map((player, playerIndex) => {
      const key = `${gameData.game.current_round}-${playerIndex}`;
      return roundInputs[key] || { bid: '', actual: '' };
    });
  };

  const isRoundComplete = () => {
    if (!gameData) return false;
    
    return gameSettings.players.every((player, playerIndex) => {
      const key = `${gameData.game.current_round}-${playerIndex}`;
      const input = roundInputs[key];
      return input && input.bid !== undefined && input.actual !== undefined && input.bid >= 1 && input.actual >= 0;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading game data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-gray-600 mb-4">Failed to load game data</p>
            <Button onClick={onNewGame}>Start New Game</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameWinner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-bold text-gray-800 mb-2">Game Over!</CardTitle>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-4 py-2">
              🏆 Winner: {gameWinner}
            </Badge>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Final Scores</h3>
              <div className="grid gap-3">
                {gameSettings.players.map((player, index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-4 rounded-lg ${
                      player === gameWinner 
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-gray-700">{player}</span>
                    <span className="text-xl font-bold text-gray-800">
                      {gameData.current_scores[index].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={onNewGame}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Start New Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentInputs = getCurrentRoundInputs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">Call Break Game</CardTitle>
                  <p className="text-gray-600">
                    Round {gameData.game.current_round} of {gameSettings.totalRounds}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {gameSettings.players.length} Players
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Current Round Input */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Hash className="w-5 h-5 text-blue-600" />
                Round {gameData.game.current_round} Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {gameSettings.players.map((player, playerIndex) => (
                  <div key={playerIndex} className="p-4 border rounded-lg bg-gray-50">
                    <Label className="text-lg font-semibold text-gray-700 mb-3 block">{player}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Bid (Call)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="13"
                          placeholder="1-13"
                          value={currentInputs[playerIndex].bid}
                          onChange={(e) => handleRoundInputChange(playerIndex, 'bid', e.target.value)}
                          className="text-center font-semibold"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Actual Tricks</Label>
                        <Input
                          type="number"
                          min="0"
                          max="13"
                          placeholder="0-13"
                          value={currentInputs[playerIndex].actual}
                          onChange={(e) => handleRoundInputChange(playerIndex, 'actual', e.target.value)}
                          className="text-center font-semibold"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    {currentInputs[playerIndex].bid && currentInputs[playerIndex].actual !== '' && (
                      <div className="mt-3 p-2 bg-blue-100 rounded text-center">
                        <span className="text-sm text-gray-600">Points: </span>
                        <span className="font-bold text-blue-700">
                          {gameService.calculatePoints(
                            parseInt(currentInputs[playerIndex].bid),
                            parseInt(currentInputs[playerIndex].actual)
                          ).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                <Button 
                  onClick={submitRound}
                  disabled={!isRoundComplete() || isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : gameData.game.current_round >= gameSettings.totalRounds ? (
                    <>
                      <Trophy className="w-5 h-5 mr-2" />
                      Finish Game
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Next Round
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scoreboard */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Scoreboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameSettings.players.map((player, playerIndex) => {
                  const totalScore = gameData.current_scores[playerIndex];
                  
                  return (
                    <div key={playerIndex} className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">{player}</span>
                        <span className="text-xl font-bold text-gray-800">{totalScore.toFixed(1)}</span>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-5 gap-2 text-sm">
                        {Array.from({ length: gameSettings.totalRounds }, (_, roundIndex) => {
                          const roundData = gameData.rounds.find(r => r.round_number === roundIndex + 1);
                          const playerRoundData = roundData?.player_data[playerIndex];
                          
                          return (
                            <div 
                              key={roundIndex} 
                              className={`text-center p-2 rounded ${
                                playerRoundData 
                                  ? 'bg-green-100 text-green-800' 
                                  : roundIndex + 1 === gameData.game.current_round 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              <div className="font-semibold">R{roundIndex + 1}</div>
                              <div className="text-xs">
                                {playerRoundData ? `${playerRoundData.points.toFixed(1)}` : '-'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;