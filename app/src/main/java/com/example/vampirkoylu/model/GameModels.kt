package com.example.vampirkoylu.model

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
    var role: GameRole? = null,
    var isAlive: Boolean = true,
    var isRevealed: Boolean = false,
    var actionTarget: String? = null
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

data class GameState(
    var phase: GamePhase = GamePhase.SETUP,
    val players: MutableList<Player> = mutableListOf(),
    var currentTurn: Int = 0,
    val votes: MutableMap<String, String> = mutableMapOf(),
    val nightActions: MutableMap<String, String> = mutableMapOf(),
    var winner: GameRole? = null,
    var dayCount: Int = 1,
    var selectedPlayer: String? = null,
    var isNightActionRequired: Boolean = false
)

object RoleDetails {
    val roleInfoMap = mapOf(
        GameRole.VAMPIRE to RoleInfo(
            name = "Vampir",
            icon = android.R.drawable.ic_menu_delete,
            description = "Her gece bir köylüyü öldürür",
            canActAtNight = true,
            actionDescription = "Öldürmek istediğin köylüyü seç",
            minPlayers = 2,
            maxPlayers = 3
        ),
        GameRole.VILLAGER to RoleInfo(
            name = "Köylü",
            icon = android.R.drawable.ic_menu_help,
            description = "Vampirleri bulmaya çalışır",
            canActAtNight = false,
            actionDescription = null,
            minPlayers = 3,
            maxPlayers = 8
        ),
        GameRole.DOCTOR to RoleInfo(
            name = "Doktor",
            icon = android.R.drawable.ic_menu_help,
            description = "Her gece bir kişiyi vampirlerden korur",
            canActAtNight = true,
            actionDescription = "Korumak istediğin kişiyi seç",
            minPlayers = 1,
            maxPlayers = 1
        ),
        GameRole.SEER to RoleInfo(
            name = "Kahin",
            icon = android.R.drawable.ic_menu_view,
            description = "Her gece bir kişinin vampir olup olmadığını öğrenir",
            canActAtNight = true,
            actionDescription = "Kontrol etmek istediğin kişiyi seç",
            minPlayers = 1,
            maxPlayers = 1
        ),
        GameRole.HUNTER to RoleInfo(
            name = "Avcı",
            icon = android.R.drawable.ic_menu_compass,
            description = "Öldürüldüğünde bir kişiyi de yanında götürür",
            canActAtNight = false,
            actionDescription = null,
            minPlayers = 0,
            maxPlayers = 1
        )
    )
} 