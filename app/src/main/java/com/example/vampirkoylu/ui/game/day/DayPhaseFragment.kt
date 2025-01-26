package com.example.vampirkoylu.ui.game.day

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
import com.example.vampirkoylu.databinding.FragmentDayPhaseBinding
import com.example.vampirkoylu.domain.model.Player
import com.example.vampirkoylu.ui.game.GameViewModel
import com.example.vampirkoylu.ui.game.GameEvent
import com.example.vampirkoylu.ui.game.setup.PlayerAdapter
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class DayPhaseFragment : Fragment() {
    private var _binding: FragmentDayPhaseBinding? = null
    private val binding get() = _binding!!
    private val viewModel: GameViewModel by activityViewModels()
    private lateinit var playerAdapter: PlayerAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDayPhaseBinding.inflate(inflater, container, false)
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
                // Gündüz fazında oyuncu seçimi yok
            }
        )
        binding.playersList.apply {
            adapter = playerAdapter
            layoutManager = LinearLayoutManager(requireContext())
        }
    }

    private fun setupListeners() {
        binding.startVoteButton.setOnClickListener {
            viewModel.onEvent(GameEvent.StartVoting)
        }
    }

    private fun observeState() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect { state ->
                    updateUI(state)
                    playerAdapter.submitList(state.players.filter { it.isAlive })
                }
            }
        }
    }

    private fun updateUI(state: GameState) {
        binding.dayCountText.text = "${state.dayCount}. Gün"
        
        // Gece olaylarını göster
        val events = mutableListOf<String>()
        
        state.nightEvents.forEach { event ->
            when (event) {
                is NightEvent.PlayerKilled -> 
                    events.add("${event.player.name} öldürüldü!")
                is NightEvent.PlayerSaved ->
                    events.add("Doktor birini kurtardı!")
                is NightEvent.RoleRevealed ->
                    events.add("Kahin birinin rolünü gördü!")
            }
        }
        
        binding.eventText.text = events.joinToString("\n")
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
} 