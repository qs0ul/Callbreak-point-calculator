from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class RoundData(BaseModel):
    bid: int = Field(..., ge=1, le=13, description="Player's bid (1-13)")
    actual: int = Field(..., ge=0, le=13, description="Actual tricks won (0-13)")
    points: float = Field(..., description="Calculated points for this round")

class Round(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_id: str
    round_number: int = Field(..., ge=1, description="Round number (1-based)")
    player_data: List[RoundData] = Field(..., description="Player data in order")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Game(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    players: List[str] = Field(..., min_items=2, max_items=4, description="Player names")
    total_rounds: int = Field(..., ge=2, le=5, description="Total rounds (2, 3, or 5)")
    current_round: int = Field(default=1, ge=1, description="Current round number")
    status: str = Field(default="active", description="Game status: active, completed")
    winner: Optional[str] = Field(default=None, description="Winner name if game completed")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response models
class CreateGameRequest(BaseModel):
    players: List[str] = Field(..., min_items=2, max_items=4)
    total_rounds: int = Field(..., ge=2, le=5)

class SubmitRoundRequest(BaseModel):
    round_number: int = Field(..., ge=1)
    player_data: List[RoundData]

class GameScoresResponse(BaseModel):
    game_id: str
    players: List[str]
    current_scores: List[float]
    rounds_completed: int
    total_rounds: int
    status: str
    winner: Optional[str] = None

class GameWithRounds(BaseModel):
    game: Game
    rounds: List[Round]
    current_scores: List[float]