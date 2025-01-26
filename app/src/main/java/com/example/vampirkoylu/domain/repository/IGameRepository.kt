package com.example.vampirkoylu.domain.repository

import com.example.vampirkoylu.domain.model.*
import kotlinx.coroutines.flow.Flow

interface IGameRepository {
    fun observeGameState(): Flow<GameState>
    
    suspend fun addPlayer(name: String): Result<Player>
    suspend fun removePlayer(playerId: String): Result<Unit>
    suspend fun startGame(): Result<Unit>
    suspend fun processVote(voterId: String, targetId: String): Result<Unit>
    suspend fun processNightAction(actorId: String, targetId: String): Result<Unit>
    suspend fun selectPlayer(playerId: String?): Result<Unit>
    suspend fun revealRole(playerId: String): Result<Unit>
    suspend fun resetGame(): Result<Unit>
    
    fun getRoleInfo(role: GameRole): RoleInfo
    fun validateGameSetup(): Boolean
} 