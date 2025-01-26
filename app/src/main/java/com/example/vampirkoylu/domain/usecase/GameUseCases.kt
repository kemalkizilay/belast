package com.example.vampirkoylu.domain.usecase

import com.example.vampirkoylu.domain.model.Player
import com.example.vampirkoylu.domain.repository.IGameRepository
import javax.inject.Inject

class AddPlayerUseCase @Inject constructor(
    private val repository: IGameRepository
) {
    suspend operator fun invoke(name: String): Result<Player> {
        return repository.addPlayer(name)
    }
}

class RemovePlayerUseCase @Inject constructor(
    private val repository: IGameRepository
) {
    suspend operator fun invoke(playerId: String): Result<Unit> {
        return repository.removePlayer(playerId)
    }
}

class StartGameUseCase @Inject constructor(
    private val repository: IGameRepository
) {
    suspend operator fun invoke(): Result<Unit> {
        return repository.startGame()
    }
}

class ProcessVoteUseCase @Inject constructor(
    private val repository: IGameRepository
) {
    suspend operator fun invoke(voterId: String, targetId: String): Result<Unit> {
        return repository.processVote(voterId, targetId)
    }
}

class ProcessNightActionUseCase @Inject constructor(
    private val repository: IGameRepository
) {
    suspend operator fun invoke(actorId: String, targetId: String): Result<Unit> {
        return repository.processNightAction(actorId, targetId)
    }
}

data class GameUseCases(
    val addPlayer: AddPlayerUseCase,
    val removePlayer: RemovePlayerUseCase,
    val startGame: StartGameUseCase,
    val processVote: ProcessVoteUseCase,
    val processNightAction: ProcessNightActionUseCase
) 