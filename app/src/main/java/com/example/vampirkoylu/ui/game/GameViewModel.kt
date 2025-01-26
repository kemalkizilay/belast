package com.example.vampirkoylu.ui.game

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vampirkoylu.domain.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor() : ViewModel() {

    private val _uiState = MutableStateFlow(GameState())
    val uiState: StateFlow<GameState> = _uiState

    fun onEvent(event: GameEvent) {
        when (event) {
            is GameEvent.AddPlayer -> addPlayer(event.name)
            is GameEvent.RemovePlayer -> removePlayer(event.playerId)
            is GameEvent.StartGame -> startGame()
            is GameEvent.FirstNightComplete -> completeFirstNight()
            is GameEvent.RevealRole -> revealRole(event.playerId)
            is GameEvent.NightAction -> processNightAction(event.actorId, event.targetId)
            is GameEvent.SkipNightAction -> skipNightAction(event.playerId)
            is GameEvent.StartVoting -> startVoting()
        }
    }

    private fun addPlayer(name: String) {
        if (name.isBlank() || _uiState.value.phase != GamePhase.SETUP) return

        val newPlayer = Player(
            id = UUID.randomUUID().toString(),
            name = name,
            role = GameRole.VILLAGER // Geçici rol, oyun başladığında değişecek
        )

        _uiState.update { state ->
            state.copy(
                players = state.players + newPlayer,
                canStartGame = state.players.size >= 4 // Minimum oyuncu sayısı
            )
        }
    }

    private fun removePlayer(playerId: String) {
        if (_uiState.value.phase != GamePhase.SETUP) return

        _uiState.update { state ->
            state.copy(
                players = state.players.filter { it.id != playerId },
                canStartGame = state.players.size - 1 >= 4
            )
        }
    }

    private fun startGame() {
        if (!_uiState.value.canStartGame) return

        val players = _uiState.value.players.map { player ->
            // Geçici olarak herkesi köylü yapıyoruz
            player.copy(role = GameRole.VILLAGER)
        }

        _uiState.update { state ->
            state.copy(
                phase = GamePhase.FIRST_NIGHT,
                players = players
            )
        }
    }

    private fun completeFirstNight() {
        _uiState.update { state ->
            state.copy(
                phase = GamePhase.NIGHT,
                currentPlayer = state.players.firstOrNull { it.role == GameRole.VAMPIRE }
            )
        }
    }

    private fun revealRole(playerId: String) {
        _uiState.update { state ->
            state.copy(
                players = state.players.map { player ->
                    if (player.id == playerId) {
                        player.copy(isRevealed = true)
                    } else {
                        player
                    }
                }
            )
        }
    }

    private fun processNightAction(actorId: String, targetId: String) {
        // Geçici olarak sadece faz değişimi yapıyoruz
        _uiState.update { state ->
            state.copy(
                phase = GamePhase.DAY
            )
        }
    }

    private fun skipNightAction(playerId: String) {
        // Geçici olarak sadece faz değişimi yapıyoruz
        _uiState.update { state ->
            state.copy(
                phase = GamePhase.DAY
            )
        }
    }

    private fun startVoting() {
        _uiState.update { state ->
            state.copy(
                phase = GamePhase.VOTING
            )
        }
    }

    fun getRoleInfo(role: GameRole): RoleInfo {
        return when (role) {
            GameRole.VAMPIRE -> RoleInfo(
                name = "Vampir",
                description = "Geceleri bir kişiyi öldürebilirsin.",
                actionDescription = "Öldürmek istediğin kişiyi seç."
            )
            GameRole.VILLAGER -> RoleInfo(
                name = "Köylü",
                description = "Vampirleri bulmaya çalış.",
                actionDescription = "Gece aksiyonun yok."
            )
            GameRole.DOCTOR -> RoleInfo(
                name = "Doktor",
                description = "Her gece bir kişiyi iyileştirebilirsin.",
                actionDescription = "İyileştirmek istediğin kişiyi seç."
            )
            GameRole.SEER -> RoleInfo(
                name = "Kahin",
                description = "Her gece bir kişinin rolünü görebilirsin.",
                actionDescription = "Rolünü görmek istediğin kişiyi seç."
            )
            GameRole.HUNTER -> RoleInfo(
                name = "Avcı",
                description = "Öldürüldüğünde bir kişiyi öldürebilirsin.",
                actionDescription = "Öldürmek istediğin kişiyi seç."
            )
        }
    }
}

sealed class GameEvent {
    data class AddPlayer(val name: String) : GameEvent()
    data class RemovePlayer(val playerId: String) : GameEvent()
    object StartGame : GameEvent()
    object FirstNightComplete : GameEvent()
    data class RevealRole(val playerId: String) : GameEvent()
    data class NightAction(val actorId: String, val targetId: String) : GameEvent()
    data class SkipNightAction(val playerId: String) : GameEvent()
    object StartVoting : GameEvent()
} 