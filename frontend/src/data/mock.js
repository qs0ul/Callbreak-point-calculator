// Mock data for Call Break game
export const mockGameData = {
  generateGame: (gameSettings) => {
    return {
      id: `game-${Date.now()}`,
      players: gameSettings.players,
      totalRounds: gameSettings.totalRounds,
      currentRound: 1,
      rounds: [], // Will be populated as rounds are played
      status: 'active',
      createdAt: new Date().toISOString()
    };
  },

  // Sample completed game for testing
  sampleCompletedGame: {
    id: 'game-sample',
    players: ['Alice', 'Bob', 'Charlie', 'Diana'],
    totalRounds: 5,
    currentRound: 6,
    rounds: [
      [
        { bid: 4, actual: 4, points: 4 },
        { bid: 3, actual: 5, points: 3.2 },
        { bid: 2, actual: 1, points: -2 },
        { bid: 4, actual: 3, points: -4 }
      ],
      [
        { bid: 5, actual: 6, points: 5.1 },
        { bid: 2, actual: 2, points: 2 },
        { bid: 3, actual: 4, points: 3.1 },
        { bid: 3, actual: 1, points: -3 }
      ],
      [
        { bid: 3, actual: 3, points: 3 },
        { bid: 4, actual: 3, points: -4 },
        { bid: 2, actual: 2, points: 2 },
        { bid: 4, actual: 5, points: 4.1 }
      ],
      [
        { bid: 2, actual: 1, points: -2 },
        { bid: 5, actual: 7, points: 5.2 },
        { bid: 3, actual: 3, points: 3 },
        { bid: 3, actual: 2, points: -3 }
      ],
      [
        { bid: 4, actual: 4, points: 4 },
        { bid: 3, actual: 2, points: -3 },
        { bid: 4, actual: 5, points: 4.1 },
        { bid: 2, actual: 2, points: 2 }
      ]
    ],
    status: 'completed',
    winner: 'Alice',
    createdAt: '2024-01-15T10:30:00Z'
  },

  // Point calculation rules
  calculatePoints: (bid, actual) => {
    if (actual === bid) {
      return bid;
    } else if (actual > bid) {
      return bid + (actual - bid) * 0.1;
    } else {
      return -bid;
    }
  },

  // Check for instant win (bid 8 and won 8 or more)
  checkInstantWin: (bid, actual) => {
    return bid === 8 && actual >= 8;
  }
};