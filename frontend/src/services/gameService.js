import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

class GameService {
  // Create a new game
  async createGame(players, totalRounds) {
    try {
      const response = await axios.post(`${API}/games/`, {
        players,
        total_rounds: totalRounds
      });
      return response.data;
    } catch (error) {
      console.error('Error creating game:', error);
      throw new Error(error.response?.data?.detail || 'Failed to create game');
    }
  }

  // Get game details with rounds and scores
  async getGame(gameId) {
    try {
      const response = await axios.get(`${API}/games/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch game');
    }
  }

  // Submit round data
  async submitRound(gameId, roundNumber, playerData) {
    try {
      const response = await axios.post(`${API}/games/${gameId}/rounds`, {
        round_number: roundNumber,
        player_data: playerData
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting round:', error);
      throw new Error(error.response?.data?.detail || 'Failed to submit round');
    }
  }

  // Get game scores
  async getGameScores(gameId) {
    try {
      const response = await axios.get(`${API}/games/${gameId}/scores`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scores:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch scores');
    }
  }

  // Get game winner
  async getGameWinner(gameId) {
    try {
      const response = await axios.get(`${API}/games/${gameId}/winner`);
      return response.data;
    } catch (error) {
      console.error('Error checking winner:', error);
      throw new Error(error.response?.data?.detail || 'Failed to check winner');
    }
  }

  // Calculate points based on Call Break rules
  calculatePoints(bid, actual) {
    if (actual === bid) {
      return bid;
    } else if (actual > bid) {
      return bid + (actual - bid) * 0.1;
    } else {
      return -bid;
    }
  }

  // Check for instant win (bid 8 and won 8 or more)
  checkInstantWin(bid, actual) {
    return bid === 8 && actual >= 8;
  }
}

export default new GameService();