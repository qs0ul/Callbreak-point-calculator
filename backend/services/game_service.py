from typing import List, Optional, Tuple
from models.game import Game, Round, RoundData, CreateGameRequest, SubmitRoundRequest, GameScoresResponse, GameWithRounds
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GameService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.games_collection = db.games
        self.rounds_collection = db.rounds

    def calculate_points(self, bid: int, actual: int) -> float:
        """Calculate points based on Call Break rules"""
        if actual == bid:
            return float(bid)
        elif actual > bid:
            return float(bid) + (actual - bid) * 0.1
        else:
            return float(-bid)

    def check_instant_win(self, bid: int, actual: int) -> bool:
        """Check if player achieved instant win (bid 8, actual >= 8)"""
        return bid == 8 and actual >= 8

    async def create_game(self, request: CreateGameRequest) -> Game:
        """Create a new game"""
        game = Game(
            players=request.players,
            total_rounds=request.total_rounds
        )
        
        await self.games_collection.insert_one(game.dict())
        logger.info(f"Created new game: {game.id} with players: {game.players}")
        return game

    async def get_game(self, game_id: str) -> Optional[Game]:
        """Get game by ID"""
        game_data = await self.games_collection.find_one({"id": game_id})
        if game_data:
            return Game(**game_data)
        return None

    async def get_game_with_rounds(self, game_id: str) -> Optional[GameWithRounds]:
        """Get game with all rounds and current scores"""
        game = await self.get_game(game_id)
        if not game:
            return None
        
        rounds = await self.get_game_rounds(game_id)
        scores = self.calculate_current_scores(game.players, rounds)
        
        return GameWithRounds(
            game=game,
            rounds=rounds,
            current_scores=scores
        )

    async def submit_round(self, game_id: str, request: SubmitRoundRequest) -> Tuple[Round, Optional[str]]:
        """Submit round data and return round + potential winner"""
        game = await self.get_game(game_id)
        if not game:
            raise ValueError("Game not found")
        
        if game.status != "active":
            raise ValueError("Game is not active")
        
        if request.round_number != game.current_round:
            raise ValueError(f"Expected round {game.current_round}, got {request.round_number}")
        
        if len(request.player_data) != len(game.players):
            raise ValueError("Player data count doesn't match number of players")

        # Validate and calculate points
        validated_player_data = []
        instant_winner = None
        
        for i, data in enumerate(request.player_data):
            # Recalculate points to ensure consistency
            calculated_points = self.calculate_points(data.bid, data.actual)
            validated_data = RoundData(
                bid=data.bid,
                actual=data.actual,
                points=calculated_points
            )
            validated_player_data.append(validated_data)
            
            # Check for instant win
            if self.check_instant_win(data.bid, data.actual):
                instant_winner = game.players[i]

        # Create round
        round_obj = Round(
            game_id=game_id,
            round_number=request.round_number,
            player_data=validated_player_data
        )
        
        await self.rounds_collection.insert_one(round_obj.dict())
        
        # Update game state
        winner = None
        if instant_winner:
            winner = instant_winner
            await self.games_collection.update_one(
                {"id": game_id},
                {
                    "$set": {
                        "status": "completed",
                        "winner": winner,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        elif request.round_number >= game.total_rounds:
            # Calculate final winner
            all_rounds = await self.get_game_rounds(game_id)
            scores = self.calculate_current_scores(game.players, all_rounds)
            max_score = max(scores)
            winner_index = scores.index(max_score)
            winner = game.players[winner_index]
            
            await self.games_collection.update_one(
                {"id": game_id},
                {
                    "$set": {
                        "status": "completed",
                        "winner": winner,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        else:
            # Move to next round
            await self.games_collection.update_one(
                {"id": game_id},
                {
                    "$set": {
                        "current_round": request.round_number + 1,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        
        logger.info(f"Submitted round {request.round_number} for game {game_id}")
        return round_obj, winner

    async def get_game_rounds(self, game_id: str) -> List[Round]:
        """Get all rounds for a game"""
        rounds_data = await self.rounds_collection.find(
            {"game_id": game_id}
        ).sort("round_number", 1).to_list(100)
        
        return [Round(**round_data) for round_data in rounds_data]

    def calculate_current_scores(self, players: List[str], rounds: List[Round]) -> List[float]:
        """Calculate current total scores for all players"""
        scores = [0.0] * len(players)
        
        for round_obj in rounds:
            for i, player_data in enumerate(round_obj.player_data):
                if i < len(scores):
                    scores[i] += player_data.points
        
        return scores

    async def get_game_scores(self, game_id: str) -> Optional[GameScoresResponse]:
        """Get current game scores"""
        game_with_rounds = await self.get_game_with_rounds(game_id)
        if not game_with_rounds:
            return None
        
        return GameScoresResponse(
            game_id=game_id,
            players=game_with_rounds.game.players,
            current_scores=game_with_rounds.current_scores,
            rounds_completed=len(game_with_rounds.rounds),
            total_rounds=game_with_rounds.game.total_rounds,
            status=game_with_rounds.game.status,
            winner=game_with_rounds.game.winner
        )

    async def delete_game(self, game_id: str) -> bool:
        """Delete a game and all its rounds"""
        # Delete rounds first
        await self.rounds_collection.delete_many({"game_id": game_id})
        
        # Delete game
        result = await self.games_collection.delete_one({"id": game_id})
        
        if result.deleted_count > 0:
            logger.info(f"Deleted game: {game_id}")
            return True
        return False