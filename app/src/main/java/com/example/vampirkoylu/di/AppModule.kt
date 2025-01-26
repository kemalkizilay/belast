package com.example.vampirkoylu.di

import com.example.vampirkoylu.data.repository.GameRepository
import com.example.vampirkoylu.domain.repository.IGameRepository
import com.example.vampirkoylu.domain.usecase.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideGameRepository(): IGameRepository {
        return GameRepository()
    }

    @Provides
    @Singleton
    fun provideGameUseCases(repository: IGameRepository): GameUseCases {
        return GameUseCases(
            addPlayer = AddPlayerUseCase(repository),
            removePlayer = RemovePlayerUseCase(repository),
            startGame = StartGameUseCase(repository),
            processVote = ProcessVoteUseCase(repository),
            processNightAction = ProcessNightActionUseCase(repository)
        )
    }
} 