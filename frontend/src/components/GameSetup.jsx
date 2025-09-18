import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Users, Play, Settings } from 'lucide-react';

const GameSetup = ({ onStartGame }) => {
  const [players, setPlayers] = useState(['', '', '', '']);
  const [totalRounds, setTotalRounds] = useState('5');

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    const validPlayers = players.filter(name => name.trim() !== '');
    if (validPlayers.length < 2) {
      alert('Please enter at least 2 player names');
      return;
    }
    
    onStartGame({
      players: validPlayers,
      totalRounds: parseInt(totalRounds)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">Call Break Calculator</CardTitle>
          <p className="text-gray-600">Set up players and start your game</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-emerald-600" />
              <Label className="text-lg font-semibold text-gray-700">Game Settings</Label>
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="rounds" className="text-sm font-medium text-gray-600 mb-2 block">
                  Number of Rounds
                </Label>
                <Select value={totalRounds} onValueChange={setTotalRounds}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Rounds</SelectItem>
                    <SelectItem value="3">3 Rounds</SelectItem>
                    <SelectItem value="5">5 Rounds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <Label className="text-lg font-semibold text-gray-700">Players (2-4 players)</Label>
            </div>
            
            <div className="grid gap-4">
              {players.map((player, index) => (
                <div key={index}>
                  <Label htmlFor={`player-${index}`} className="text-sm font-medium text-gray-600 mb-2 block">
                    Player {index + 1} {index < 2 && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={`player-${index}`}
                    placeholder={`Enter player ${index + 1} name`}
                    value={player}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSetup;