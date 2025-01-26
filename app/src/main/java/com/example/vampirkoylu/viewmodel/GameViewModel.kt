package com.example.vampirkoylu.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.example.vampirkoylu.model.*
import java.util.*

class GameViewModel : ViewModel() {
    private val _gameState = MutableLiveData(GameState())
    val gameState: LiveData<GameState> = _gameState

    private val _errorMessage = MutableLiveData<String>()
    val errorMessage: LiveData<String> = _errorMessage

    fun addPlayer(name: String) {
        val currentState = _gameState.value ?: return
        if (name.isBlank()) {
            _errorMessage.value = "İsim boş olamaz"
            return
        }
        if (currentState.players.any { it.name == name }) {
            _errorMessage.value = "Bu isimde bir oyuncu zaten var"
            return
        }
        currentState.players.add(Player(UUID.randomUUID().toString(), name))
        _gameState.value = currentState
    }

    fun removePlayer(playerId: String) {
        val currentState = _gameState.value ?: return
        currentState.players.removeIf { it.id == playerId }
        _gameState.value = currentState
    }

    fun startGame() {
        val currentState = _gameState.value ?: return
        if (!validateSetup()) return

        // Rolleri dağıt
        val shuffledPlayers = currentState.players.shuffled().toMutableList()
        var remainingRoles = mutableListOf<GameRole>()

        // Önce zorunlu rolleri ekle
        remainingRoles.addAll(List(2) { GameRole.VAMPIRE })  // 2 Vampir
        remainingRoles.add(GameRole.DOCTOR)  // 1 Doktor
        remainingRoles.add(GameRole.SEER)    // 1 Kahin

        // Kalan oyunculara köylü rolü ver
        val remainingCount = shuffledPlayers.size - remainingRoles.size
        remainingRoles.addAll(List(remainingCount) { GameRole.VILLAGER })

        // Rolleri karıştır ve dağıt
        remainingRoles.shuffle()
        shuffledPlayers.forEachIndexed { index, player ->
            player.role = remainingRoles[index]
        }

        currentState.players.clear()
        currentState.players.addAll(shuffledPlayers)
        currentState.phase = GamePhase.FIRST_NIGHT
        _gameState.value = currentState
    }

    private fun validateSetup(): Boolean {
        val currentState = _gameState.value ?: return false
        val playerCount = currentState.players.size

        if (playerCount < 7) {
            _errorMessage.value = "Oyun için en az 7 oyuncu gerekli"
            return false
        }
        if (playerCount > 15) {
            _errorMessage.value = "Oyun en fazla 15 oyuncu ile oynanabilir"
            return false
        }

        return true
    }

    fun addVote(voterId: String, targetId: String) {
        val currentState = _gameState.value ?: return
        if (currentState.phase != GamePhase.VOTING) return

        currentState.votes[voterId] = targetId
        if (currentState.votes.size == currentState.players.count { it.isAlive }) {
            processVotes()
        }
        _gameState.value = currentState
    }

    private fun processVotes() {
        val currentState = _gameState.value ?: return
        val voteCount = mutableMapOf<String, Int>()
        
        currentState.votes.values.forEach { targetId ->
            voteCount[targetId] = (voteCount[targetId] ?: 0) + 1
        }

        val maxVotes = voteCount.maxByOrNull { it.value }?.value ?: 0
        val eliminated = voteCount.filter { it.value == maxVotes }.keys

        if (eliminated.size == 1) {
            val eliminatedId = eliminated.first()
            val eliminatedPlayer = currentState.players.find { it.id == eliminatedId } ?: return
            eliminatedPlayer.isAlive = false
            eliminatedPlayer.isRevealed = true

            // Avcı özel yeteneği
            if (eliminatedPlayer.role == GameRole.HUNTER) {
                currentState.isNightActionRequired = true
            }
        }

        currentState.votes.clear()
        checkWinCondition()
        if (currentState.winner == null) {
            currentState.phase = GamePhase.NIGHT
            currentState.dayCount++
        }
        _gameState.value = currentState
    }

    fun addNightAction(actorId: String, targetId: String) {
        val currentState = _gameState.value ?: return
        if (currentState.phase != GamePhase.NIGHT) return

        val actor = currentState.players.find { it.id == actorId } ?: return
        if (!actor.isAlive || actor.role?.let { RoleDetails.roleInfoMap[it]?.canActAtNight } != true) return

        currentState.nightActions[actorId] = targetId
        if (isNightPhaseComplete()) {
            processNightActions()
        }
        _gameState.value = currentState
    }

    private fun isNightPhaseComplete(): Boolean {
        val currentState = _gameState.value ?: return false
        val actionsNeeded = currentState.players.count { 
            it.isAlive && it.role?.let { role -> 
                RoleDetails.roleInfoMap[role]?.canActAtNight 
            } == true 
        }
        return currentState.nightActions.size == actionsNeeded
    }

    private fun processNightActions() {
        val currentState = _gameState.value ?: return
        val vampireTargets = currentState.players
            .filter { it.isAlive && it.role == GameRole.VAMPIRE }
            .mapNotNull { currentState.nightActions[it.id] }
            .toSet()
        
        val doctorProtected = currentState.players
            .find { it.isAlive && it.role == GameRole.DOCTOR }
            ?.let { currentState.nightActions[it.id] }

        vampireTargets.forEach { targetId ->
            if (targetId != doctorProtected) {
                currentState.players.find { it.id == targetId }?.let { target ->
                    target.isAlive = false
                    // Avcı özel yeteneği
                    if (target.role == GameRole.HUNTER) {
                        currentState.isNightActionRequired = true
                    }
                }
            }
        }

        currentState.nightActions.clear()
        checkWinCondition()
        if (currentState.winner == null) {
            currentState.phase = GamePhase.DAY
        }
        _gameState.value = currentState
    }

    private fun checkWinCondition() {
        val currentState = _gameState.value ?: return
        val alivePlayers = currentState.players.filter { it.isAlive }
        val aliveVampires = alivePlayers.count { it.role == GameRole.VAMPIRE }
        val aliveVillagers = alivePlayers.size - aliveVampires

        if (aliveVampires == 0) {
            currentState.winner = GameRole.VILLAGER
            currentState.phase = GamePhase.ENDED
        } else if (aliveVampires >= aliveVillagers) {
            currentState.winner = GameRole.VAMPIRE
            currentState.phase = GamePhase.ENDED
        }
    }

    fun selectPlayer(playerId: String?) {
        val currentState = _gameState.value ?: return
        currentState.selectedPlayer = playerId
        _gameState.value = currentState
    }

    fun revealRole(playerId: String) {
        val currentState = _gameState.value ?: return
        currentState.players.find { it.id == playerId }?.let { player ->
            player.isRevealed = true
        }
        _gameState.value = currentState
    }

    fun resetGame() {
        _gameState.value = GameState()
    }
} 