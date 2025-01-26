package com.example.vampirkoylu

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.commit
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.example.vampirkoylu.databinding.ActivityMainBinding
import com.example.vampirkoylu.domain.model.GamePhase
import com.example.vampirkoylu.ui.game.GameViewModel
import com.example.vampirkoylu.ui.game.setup.GameSetupFragment
import com.example.vampirkoylu.ui.game.night.FirstNightFragment
import com.example.vampirkoylu.ui.game.night.NightPhaseFragment
import com.example.vampirkoylu.ui.game.day.DayPhaseFragment
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (savedInstanceState == null) {
            showFragment(GameSetupFragment())
        }

        observeGameState()
    }

    private fun observeGameState() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    val fragment = when (state.phase) {
                        GamePhase.FIRST_NIGHT -> FirstNightFragment()
                        GamePhase.NIGHT -> NightPhaseFragment()
                        GamePhase.DAY -> DayPhaseFragment()
                        else -> GameSetupFragment()
                    }
                    showFragment(fragment)
                }
            }
        }
    }

    private fun showFragment(fragment: Fragment) {
        supportFragmentManager.commit {
            setReorderingAllowed(true)
            replace(binding.fragmentContainer.id, fragment)
        }
    }
}

sealed class GameEvent {
    data class PlayerAdded(val player: Player) : GameEvent()
    data class PlayerRemoved(val playerId: String) : GameEvent()
    object GameStarted : GameEvent()
    // ...
}

class PlayerListView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : ConstraintLayout(context, attrs, defStyleAttr) {
    // Kendi state'ini yöneten custom view
}

class GameViewModel : ViewModel() {
    private val _gameState = MutableStateFlow(GameState())
    val gameState = _gameState.asStateFlow()

    fun observePlayers() = gameState
        .map { it.players }
        .distinctUntilChanged()
        .flowOn(Dispatchers.Default)
} 