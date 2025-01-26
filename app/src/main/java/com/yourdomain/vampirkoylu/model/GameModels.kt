package com.yourdomain.vampirkoylu.model

import java.util.UUID

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
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val role: GameRole,
    var isAlive: Boolean = true,
    var isRevealed: Boolean = false,
    var actionTarget: String? = null
)

data class RoleInfo(
    val name: String,
    val icon: String,
    val description: String,
    val canActAtNight: Boolean,
    val actionDescription: String? = null,
    val minPlayers: Int,
    val maxPlayers: Int
)

data class GameState(
    var phase: GamePhase = GamePhase.SETUP,
    val players: MutableList<Player> = mutableListOf(),
    var currentTurn: Int = 0,
    val votes: MutableMap<String, String> = mutableMapOf(),
    val nightActions: MutableList<Pair<String, String>> = mutableListOf(),
    var winner: String? = null,
    var dayCount: Int = 1,
    var isNightActionRequired: Boolean = false,
    var selectedPlayer: String? = null
)

object RoleDetails {
    val details = mapOf(
        GameRole.VAMPIRE to RoleInfo(
            name = "Vampir",
            icon = "🧛",
            description = "Her gece bir köylüyü öldürür.",
            canActAtNight = true,
            actionDescription = "Öldürmek istediğin köylüyü seç",
            minPlayers = 2,
            maxPlayers = 3
        ),
        GameRole.VILLAGER to RoleInfo(
            name = "Köylü",
            icon = "👨‍🌾",
            description = "Gündüz vampirleri bulmaya çalışır.",
            canActAtNight = false,
            minPlayers = 3,
            maxPlayers = 8
        ),
        GameRole.DOCTOR to RoleInfo(
            name = "Doktor",
            icon = "👨‍⚕️",
            description = "Her gece bir kişiyi iyileştirir.",
            canActAtNight = true,
            actionDescription = "İyileştirmek istediğin kişiyi seç",
            minPlayers = 1,
            maxPlayers = 1
        ),
        GameRole.SEER to RoleInfo(
            name = "Kahin",
            icon = "🔮",
            description = "Her gece bir kişinin vampir olup olmadığını görür.",
            canActAtNight = true,
            actionDescription = "Rolünü görmek istediğin kişiyi seç",
            minPlayers = 1,
            maxPlayers = 1
        ),
        GameRole.HUNTER to RoleInfo(
            name = "Avcı",
            icon = "🔫",
            description = "Öldürüldüğünde %50 şansla başka birini de öldürür.",
            canActAtNight = false,
            minPlayers = 1,
            maxPlayers = 1
        )
    )
} 