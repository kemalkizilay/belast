package com.example.vampirkoylu.ui.game.night

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.example.vampirkoylu.databinding.FragmentFirstNightBinding
import com.example.vampirkoylu.domain.model.Player
import com.example.vampirkoylu.ui.game.GameViewModel
import com.example.vampirkoylu.ui.game.GameEvent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class FirstNightFragment : Fragment() {
    private var _binding: FragmentFirstNightBinding? = null
    private val binding get() = _binding!!
    private val viewModel: GameViewModel by activityViewModels()
    private var currentPlayerIndex = 0
    private var players = listOf<Player>()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentFirstNightBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupListeners()
        observeState()
    }

    private fun setupListeners() {
        binding.nextButton.setOnClickListener {
            if (currentPlayerIndex < players.size - 1) {
                currentPlayerIndex++
                showCurrentPlayer()
            } else {
                viewModel.onEvent(GameEvent.FirstNightComplete)
            }
        }
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    players = state.players
                    if (players.isNotEmpty()) {
                        updateProgress()
                        showCurrentPlayer()
                    }
                }
            }
        }
    }

    private fun showCurrentPlayer() {
        val player = players[currentPlayerIndex]
        val roleInfo = viewModel.getRoleInfo(player.role)

        with(binding) {
            playerNameText.text = player.name
            roleNameText.text = roleInfo.name
            roleDescriptionText.text = roleInfo.description
            // roleIcon.setImageResource(roleInfo.icon)
            
            nextButton.text = if (currentPlayerIndex == players.size - 1) {
                "Geceye Başla"
            } else {
                "Sonraki Oyuncu"
            }
        }

        viewModel.onEvent(GameEvent.RevealRole(player.id))
    }

    private fun updateProgress() {
        binding.progressIndicator.apply {
            max = players.size
            progress = currentPlayerIndex + 1
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
} 