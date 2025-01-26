package com.example.vampirkoylu.domain.model

data class GameState(
    val phase: GamePhase = GamePhase.SETUP,
    val players: List<Player> = emptyList(),
    val currentPlayer: Player? = null,
    val dayCount: Int = 1,
    val nightEvents: List<NightEvent> = emptyList(),
    val canStartGame: Boolean = false,
    val winner: GameRole? = null
)

sealed class NightEvent {
    data class PlayerKilled(val player: Player) : NightEvent()
    data class PlayerSaved(val player: Player) : NightEvent()
    data class RoleRevealed(val player: Player, val role: GameRole) : NightEvent()
}

enum class GamePhase {
    SETUP,
    FIRST_NIGHT,
    NIGHT,
    DAY,
    VOTING,
    ENDED
}

enum class GameRole {
    VAMPIRE,
    VILLAGER,
    DOCTOR,
    SEER,
    HUNTER
}

data class Player(
    val id: String,
    val name: String,
    val role: GameRole? = null,
    val isAlive: Boolean = true,
    val isRevealed: Boolean = false,
    val actionTarget: String? = null
)

data class RoleInfo(
    val name: String,
    val icon: Int,
    val description: String,
    val canActAtNight: Boolean,
    val actionDescription: String?,
    val minPlayers: Int,
    val maxPlayers: Int
) 