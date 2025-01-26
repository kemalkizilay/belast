package com.example.vampirkoylu.ui.game.setup

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.vampirkoylu.databinding.FragmentGameSetupBinding
import com.example.vampirkoylu.ui.game.GameViewModel
import com.example.vampirkoylu.ui.game.GameEvent
import com.google.android.material.snackbar.Snackbar
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class GameSetupFragment : Fragment() {
    private var _binding: FragmentGameSetupBinding? = null
    private val binding get() = _binding!!
    private val viewModel: GameViewModel by activityViewModels()
    private lateinit var playerAdapter: PlayerAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentGameSetupBinding.inflate(inflater, container, false)
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
            onRemoveClick = { playerId ->
                viewModel.onEvent(GameEvent.RemovePlayer(playerId))
            }
        )
        binding.playersList.apply {
            adapter = playerAdapter
            layoutManager = LinearLayoutManager(requireContext())
        }
    }

    private fun setupListeners() {
        binding.addPlayerButton.setOnClickListener {
            val playerName = binding.playerNameEditText.text?.toString()?.trim()
            if (!playerName.isNullOrEmpty()) {
                viewModel.onEvent(GameEvent.AddPlayer(playerName))
                binding.playerNameEditText.text?.clear()
            }
        }

        binding.playerNameEditText.doAfterTextChanged { text ->
            binding.addPlayerButton.isEnabled = !text.isNullOrBlank()
        }

        binding.startGameButton.setOnClickListener {
            viewModel.onEvent(GameEvent.StartGame)
        }
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    playerAdapter.submitList(state.players)
                    binding.startGameButton.isEnabled = state.canStartGame
                }
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
} 