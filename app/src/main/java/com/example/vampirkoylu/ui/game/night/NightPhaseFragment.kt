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
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.vampirkoylu.databinding.FragmentNightPhaseBinding
import com.example.vampirkoylu.domain.model.GameRole
import com.example.vampirkoylu.domain.model.Player
import com.example.vampirkoylu.ui.game.GameViewModel
import com.example.vampirkoylu.ui.game.GameEvent
import com.example.vampirkoylu.ui.game.setup.PlayerAdapter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class NightPhaseFragment : Fragment() {
    private var _binding: FragmentNightPhaseBinding? = null
    private val binding get() = _binding!!
    private val viewModel: GameViewModel by activityViewModels()
    private lateinit var playerAdapter: PlayerAdapter
    private var selectedPlayer: Player? = null
    private var currentPlayer: Player? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentNightPhaseBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupListeners()
        observeState()
    }

    private fun setupRecyclerView() {
        playerAdapter = PlayerAdapter(
            onPlayerClick = { player ->
                selectedPlayer = player
                binding.actionButton.isEnabled = true
            }
        )
        binding.playersList.apply {
            adapter = playerAdapter
            layoutManager = LinearLayoutManager(requireContext())
        }
    }

    private fun setupListeners() {
        binding.actionButton.setOnClickListener {
            selectedPlayer?.let { target ->
                currentPlayer?.let { actor ->
                    viewModel.onEvent(GameEvent.NightAction(actor.id, target.id))
                }
            }
            selectedPlayer = null
            binding.actionButton.isEnabled = false
        }

        binding.skipButton.setOnClickListener {
            currentPlayer?.let { actor ->
                viewModel.onEvent(GameEvent.SkipNightAction(actor.id))
            }
        }
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    currentPlayer = state.currentPlayer
                    updateUI(state.currentPlayer)
                    playerAdapter.submitList(state.players.filter { it.isAlive && it.id != state.currentPlayer?.id })
                }
            }
        }
    }

    private fun updateUI(player: Player?) {
        player?.let {
            val roleInfo = viewModel.getRoleInfo(it.role)
            binding.currentPlayerText.text = "${it.name} (${roleInfo.name})"
            binding.actionDescription.text = roleInfo.actionDescription
            binding.actionButton.text = when (it.role) {
                GameRole.VAMPIRE -> "Öldür"
                GameRole.DOCTOR -> "İyileştir"
                GameRole.SEER -> "Rolünü Gör"
                else -> "Seç"
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
} 