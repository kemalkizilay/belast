package com.yourdomain.vampirkoylu.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.yourdomain.vampirkoylu.model.*

class GameViewModel : ViewModel() {
    private val _gameState = MutableLiveData(GameState())
    val gameState: LiveData<GameState> = _gameState

    private val _errorMessage = MutableLiveData<String>()
    val errorMessage: LiveData<String> = _errorMessage

    fun addPlayer(name: String, role: GameRole) {
        val currentState = _gameState.value ?: return
        val roleCounts = currentState.players.groupBy { it.role }
        val roleInfo = RoleDetails.details[role] ?: return

        // Rol sayısı kontrolü
        val currentCount = roleCounts[role]?.size ?: 0
        if (currentCount >= roleInfo.maxPlayers) {
            _errorMessage.value = "${roleInfo.name} rolü için maksimum sayıya ulaşıldı"
            return
        }

        val newPlayer = Player(name = name, role = role)
        currentState.players.add(newPlayer)
        _gameState.value = currentState
    }

    fun removePlayer(playerId: String) {
        val currentState = _gameState.value ?: return
        currentState.players.removeAll { it.id == playerId }
        _gameState.value = currentState
    }

    fun startGame() {
        val currentState = _gameState.value ?: return
        if (!isValidSetup()) {
            _errorMessage.value = "Oyunu başlatmak için gerekli rol dağılımı sağlanmadı"
            return
        }

        currentState.players.shuffle()
        currentState.phase = GamePhase.FIRST_NIGHT
        _gameState.value = currentState
    }

    fun isValidSetup(): Boolean {
        val currentState = _gameState.value ?: return false
        val roleCounts = currentState.players.groupBy { it.role }

        return RoleDetails.details.all { (role, info) ->
            val count = roleCounts[role]?.size ?: 0
            count >= info.minPlayers && count <= info.maxPlayers
        }
    }

    fun addVote(voterId: String, targetId: String) {
        val currentState = _gameState.value ?: return
        currentState.votes[voterId] = targetId
        _gameState.value = currentState

        // Tüm oylar kullanıldıysa
        if (currentState.votes.size == currentState.players.count { it.isAlive }) {
            processVotes()
        }
    }

    private fun processVotes() {
        val currentState = _gameState.value ?: return
        val voteCount = mutableMapOf<String, Int>()
        
        // Oyları say
        currentState.votes.values.forEach { targetId ->
            voteCount[targetId] = (voteCount[targetId] ?: 0) + 1
        }

        // En çok oy alanı bul
        val mostVoted = voteCount.maxByOrNull { it.value }?.key
        mostVoted?.let { playerId ->
            val player = currentState.players.find { it.id == playerId }
            player?.let {
                it.isAlive = false
                it.isRevealed = true

                // Avcı özel yeteneği
                if (it.role == GameRole.HUNTER) {
                    handleHunterDeath(it)
                }
            }
        }

        currentState.votes.clear()
        currentState.phase = GamePhase.NIGHT
        _gameState.value = currentState
    }

    private fun handleHunterDeath(hunter: Player) {
        // %50 şans ile başka bir oyuncuyu öldürme
        if (Math.random() < 0.5) {
            val currentState = _gameState.value ?: return
            val alivePlayers = currentState.players.filter { 
                it.isAlive && it.id != hunter.id 
            }
            
            if (alivePlayers.isNotEmpty()) {
                val randomTarget = alivePlayers.random()
                randomTarget.isAlive = false
                randomTarget.isRevealed = true
            }
        }
    }

    fun addNightAction(playerId: String, targetId: String) {
        val currentState = _gameState.value ?: return
        currentState.nightActions.add(Pair(playerId, targetId))
        _gameState.value = currentState

        // Tüm gece aksiyonları tamamlandıysa
        if (isNightActionsComplete()) {
            processNightActions()
        }
    }

    private fun isNightActionsComplete(): Boolean {
        val currentState = _gameState.value ?: return false
        val activeNightRoles = currentState.players.count { 
            it.isAlive && RoleDetails.details[it.role]?.canActAtNight == true 
        }
        return currentState.nightActions.size == activeNightRoles
    }

    private fun processNightActions() {
        val currentState = _gameState.value ?: return
        val vampireTargets = mutableSetOf<String>()
        var doctorTarget: String? = null

        // Aksiyonları işle
        currentState.nightActions.forEach { (playerId, targetId) ->
            val player = currentState.players.find { it.id == playerId }
            when (player?.role) {
                GameRole.VAMPIRE -> vampireTargets.add(targetId)
                GameRole.DOCTOR -> doctorTarget = targetId
                GameRole.SEER -> {
                    val target = currentState.players.find { it.id == targetId }
                    target?.let { it.isRevealed = true }
                }
                else -> {}
            }
        }

        // Vampir saldırılarını uygula
        vampireTargets.forEach { targetId ->
            if (targetId != doctorTarget) {
                currentState.players.find { it.id == targetId }?.let {
                    it.isAlive = false
                }
            }
        }

        // Gece aksiyonlarını temizle
        currentState.nightActions.clear()
        currentState.phase = GamePhase.DAY
        currentState.dayCount++

        // Kazananı kontrol et
        checkWinCondition()

        _gameState.value = currentState
    }

    private fun checkWinCondition() {
        val currentState = _gameState.value ?: return
        val aliveVampires = currentState.players.count { 
            it.isAlive && it.role == GameRole.VAMPIRE 
        }
        val aliveVillagers = currentState.players.count { 
            it.isAlive && it.role != GameRole.VAMPIRE 
        }

        currentState.winner = when {
            aliveVampires == 0 -> "VILLAGERS"
            aliveVampires >= aliveVillagers -> "VAMPIRES"
            else -> null
        }

        if (currentState.winner != null) {
            currentState.phase = GamePhase.ENDED
        }
    }

    fun resetGame() {
        _gameState.value = GameState()
    }
} 