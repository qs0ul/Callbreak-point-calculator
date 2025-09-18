from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.game import (
    Game, Round, CreateGameRequest, SubmitRoundRequest, 
    GameScoresResponse, GameWithRounds
)
from services.game_service import GameService
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Database dependency
async def get_database() -> AsyncIOMotorDatabase:
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ['DB_NAME']]

async def get_game_service() -> GameService:
    db = await get_database()
    return GameService(db)

router = APIRouter(prefix="/api/games", tags=["games"])

@router.post("/", response_model=Game)
async def create_game(
    request: CreateGameRequest,
    game_service: GameService = Depends(get_game_service)
):
    """Create a new Call Break game"""
    try:
        return await game_service.create_game(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{game_id}", response_model=GameWithRounds)
async def get_game(
    game_id: str,
    game_service: GameService = Depends(get_game_service)
):
    """Get game details with rounds and scores"""
    game_with_rounds = await game_service.get_game_with_rounds(game_id)
    if not game_with_rounds:
        raise HTTPException(status_code=404, detail="Game not found")
    return game_with_rounds

@router.post("/{game_id}/rounds", response_model=dict)
async def submit_round(
    game_id: str,
    request: SubmitRoundRequest,
    game_service: GameService = Depends(get_game_service)
):
    """Submit round data for a game"""
    try:
        round_obj, winner = await game_service.submit_round(game_id, request)
        return {
            "round": round_obj,
            "winner": winner,
            "message": f"Round {request.round_number} submitted successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{game_id}/rounds", response_model=List[Round])
async def get_game_rounds(
    game_id: str,
    game_service: GameService = Depends(get_game_service)
):
    """Get all rounds for a game"""
    # Verify game exists
    game = await game_service.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return await game_service.get_game_rounds(game_id)

@router.get("/{game_id}/rounds/{round_number}", response_model=Round)
async def get_specific_round(
    game_id: str,
    round_number: int,
    game_service: GameService = Depends(get_game_service)
):
    """Get specific round data"""
    rounds = await game_service.get_game_rounds(game_id)
    for round_obj in rounds:
        if round_obj.round_number == round_number:
            return round_obj
    
    raise HTTPException(status_code=404, detail=f"Round {round_number} not found")

@router.get("/{game_id}/scores", response_model=GameScoresResponse)
async def get_game_scores(
    game_id: str,
    game_service: GameService = Depends(get_game_service)
):
    """Get current game scores"""
    scores = await game_service.get_game_scores(game_id)
    if not scores:
        raise HTTPException(status_code=404, detail="Game not found")
    return scores

@router.get("/{game_id}/winner")
async def get_game_winner(
    game_id: str,
    game_service: GameService = Depends(get_game_service)
):
    """Check game winner status"""
    game = await game_service.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return {
        "game_id": game_id,
        "status": game.status,
        "winner": game.winner,
        "is_completed": game.status == "completed"
    }

@router.delete("/{game_id}")
async def delete_game(
    game_id: str,
    game_service: GameService = Depends(get_game_service)
):
    """Delete a game and all its rounds"""
    success = await game_service.delete_game(game_id)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return {"message": f"Game {game_id} deleted successfully"}