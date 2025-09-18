# Call Break Calculator - API Contracts & Integration Guide

## Overview
This document outlines the API contracts and integration plan for the Call Break calculator application.

## Current Mock Data (to be replaced)
- `mockGameData.generateGame()` - Creates initial game structure
- Frontend stores game data in local state
- Point calculations happen client-side only
- No persistence between sessions

## Backend Implementation Plan

### 1. Database Models

#### Game Model
```python
class Game(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    players: List[str]
    total_rounds: int
    current_round: int = 1
    status: str = "active"  # active, completed
    winner: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

#### Round Model
```python
class RoundData(BaseModel):
    bid: int
    actual: int
    points: float

class Round(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    game_id: str
    round_number: int
    player_data: List[RoundData]  # Index matches player order
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2. API Endpoints

#### Game Management
- `POST /api/games` - Create new game
- `GET /api/games/{game_id}` - Get game details
- `PUT /api/games/{game_id}` - Update game status
- `DELETE /api/games/{game_id}` - Delete game

#### Round Management
- `POST /api/games/{game_id}/rounds` - Submit round data
- `GET /api/games/{game_id}/rounds` - Get all rounds for game
- `GET /api/games/{game_id}/rounds/{round_number}` - Get specific round

#### Scoring
- `GET /api/games/{game_id}/scores` - Get current scores
- `GET /api/games/{game_id}/winner` - Check game winner

### 3. Request/Response Formats

#### Create Game Request
```json
{
  "players": ["Alice", "Bob", "Charlie", "Diana"],
  "total_rounds": 5
}
```

#### Create Game Response
```json
{
  "id": "game-uuid",
  "players": ["Alice", "Bob", "Charlie", "Diana"],
  "total_rounds": 5,
  "current_round": 1,
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Submit Round Request
```json
{
  "round_number": 1,
  "player_data": [
    {"bid": 4, "actual": 4, "points": 4.0},
    {"bid": 3, "actual": 5, "points": 3.2},
    {"bid": 2, "actual": 1, "points": -2.0},
    {"bid": 4, "actual": 3, "points": -4.0}
  ]
}
```

#### Get Scores Response
```json
{
  "game_id": "game-uuid",
  "players": ["Alice", "Bob", "Charlie", "Diana"],
  "current_scores": [10.1, 3.4, 1.1, -2.9],
  "rounds_completed": 2,
  "total_rounds": 5,
  "status": "active"
}
```

### 4. Business Logic Implementation

#### Point Calculation Rules
- Exact match: points = bid
- Over bid: points = bid + (actual - bid) * 0.1
- Under bid: points = -bid
- Instant win: bid 8 and actual >= 8

#### Game State Management
- Track current round progression
- Detect instant win conditions (bid 8, actual >= 8)
- Calculate final winner based on total scores
- Update game status appropriately

### 5. Frontend Integration Changes

#### Replace Mock Data Usage
- Remove `mockGameData` imports
- Replace local state management with API calls
- Add loading states for API operations
- Implement error handling for network requests

#### API Integration Points
1. **GameSetup.jsx**: Call `POST /api/games` on game start
2. **GameBoard.jsx**: 
   - Load game data from `GET /api/games/{id}`
   - Submit rounds via `POST /api/games/{id}/rounds`
   - Fetch scores from `GET /api/games/{id}/scores`
   - Check winner via `GET /api/games/{id}/winner`

#### State Management Updates
- Replace `gameData` state with API-fetched data
- Add `gameId` to track current game
- Implement proper loading and error states
- Add toast notifications for user feedback

### 6. Integration Workflow

1. Implement backend models and endpoints
2. Test backend APIs independently
3. Update frontend to use APIs instead of mock data
4. Replace local state management with server state
5. Add proper error handling and loading states
6. Test complete flow end-to-end

### 7. Error Handling

#### Backend Errors
- Game not found (404)
- Invalid round data (400)
- Database connection issues (500)

#### Frontend Error Handling
- Network failures
- Invalid API responses
- Game state conflicts
- User input validation

This integration will transform the frontend-only app into a full-stack application with persistent data storage and proper game state management.