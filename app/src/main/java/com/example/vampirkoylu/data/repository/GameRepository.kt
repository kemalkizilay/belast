package com.example.vampirkoylu.data.repository

import com.example.vampirkoylu.domain.model.*
import com.example.vampirkoylu.domain.repository.IGameRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GameRepository @Inject constructor() : IGameRepository {
    private val _gameState = MutableStateFlow(GameState())
    private val roleDetails = mutableMapOf<GameRole, RoleInfo>()

    init {
        initializeRoleDetails()
    }

    private fun initializeRoleDetails() {
        roleDetails[GameRole.VAMPIRE] = RoleInfo(
            name = "Vampir",
            icon = android.R.drawable.ic_menu_delete,
            description = "Her gece bir köylüyü öldürür",
            canActAtNight = true,
            actionDescription = "Öldürmek istediğin köylüyü seç",
            minPlayers = 2,
            maxPlayers = 3
        )
        // Diğer roller...
    }

    override fun observeGameState(): Flow<GameState> = _gameState.asStateFlow()

    override suspend fun addPlayer(name: String): Result<Player> = runCatching {
        val currentState = _gameState.value
        
        if (name.isBlank()) {
            throw IllegalArgumentException("İsim boş olamaz")
        }
        if (currentState.players.any { it.name == name }) {
            throw IllegalArgumentException("Bu isimde bir oyuncu zaten var")
        }

        val newPlayer = Player(UUID.randomUUID().toString(), name)
        _gameState.value = currentState.copy(
            players = currentState.players + newPlayer
        )
        newPlayer
    }

    override suspend fun removePlayer(playerId: String): Result<Unit> = runCatching {
        val currentState = _gameState.value
        _gameState.value = currentState.copy(
            players = currentState.players.filter { it.id != playerId }
        )
    }

    override suspend fun startGame(): Result<Unit> = runCatching {
        if (!validateGameSetup()) {
            throw IllegalStateException("Oyun başlatma koşulları sağlanmıyor")
        }

        val currentState = _gameState.value
        val shuffledPlayers = currentState.players.shuffled()
        val roles = generateRoles(shuffledPlayers.size)
        
        val playersWithRoles = shuffledPlayers.mapIndexed { index, player ->
            player.copy(role = roles[index])
        }

        _gameState.value = currentState.copy(
            phase = GamePhase.FIRST_NIGHT,
            players = playersWithRoles
        )
    }

    private fun generateRoles(playerCount: Int): List<GameRole> {
        val roles = mutableListOf<GameRole>()
        roles.addAll(List(2) { GameRole.VAMPIRE })
        roles.add(GameRole.DOCTOR)
        roles.add(GameRole.SEER)
        
        val remainingCount = playerCount - roles.size
        roles.addAll(List(remainingCount) { GameRole.VILLAGER })
        
        return roles.shuffled()
    }

    override fun validateGameSetup(): Boolean {
        val playerCount = _gameState.value.players.size
        return playerCount in 7..15
    }

    override fun getRoleInfo(role: GameRole): RoleInfo {
        return roleDetails[role] ?: throw IllegalArgumentException("Geçersiz rol")
    }

    // Diğer fonksiyonların implementasyonları...
} 