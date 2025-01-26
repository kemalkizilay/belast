package com.example.vampirkoylu.domain.model

data class Player(
    val id: String,
    val name: String,
    val role: GameRole,
    val isAlive: Boolean = true,
    val isRevealed: Boolean = false,
    val actionTarget: String? = null
)

data class RoleInfo(
    val name: String,
    val description: String,
    val actionDescription: String? = null,
    val icon: Int? = null,
    val minPlayers: Int = 0,
    val maxPlayers: Int = Int.MAX_VALUE,
    val canActAtNight: Boolean = false
) 