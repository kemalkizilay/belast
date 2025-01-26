package com.example.vampirkoylu.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.Toast
import androidx.core.widget.doAfterTextChanged
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.recyclerview.widget.DefaultItemAnimator
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.vampirkoylu.R
import com.example.vampirkoylu.databinding.FragmentGameSetupBinding
import com.example.vampirkoylu.viewmodel.GameViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

class GameSetupFragment : Fragment() {
    private var _binding: FragmentGameSetupBinding? = null
    private val binding get() = _binding!!
    private val viewModel: GameViewModel by activityViewModels()
    private val playerAdapter by lazy {
        PlayerListAdapter { playerId ->
            viewModel.removePlayer(playerId)
        }
    }

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
        setupViews()
        observeViewModel()
    }

    private fun setupViews() {
        with(binding) {
            // EditText ayarları
            etPlayerName.apply {
                doAfterTextChanged { text ->
                    btnAddPlayer.isEnabled = !text.isNullOrBlank()
                }
                
                setOnEditorActionListener { _, actionId, _ ->
                    if (actionId == EditorInfo.IME_ACTION_DONE) {
                        addPlayer()
                        true
                    } else {
                        false
                    }
                }
            }

            // Oyuncu ekleme butonu
            btnAddPlayer.setOnClickListener {
                addPlayer()
            }

            // Oyunu başlatma butonu
            btnStartGame.setOnClickListener {
                viewModel.startGame()
            }

            // RecyclerView kurulumu
            rvPlayers.apply {
                layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.VERTICAL, false)
                adapter = playerAdapter
                setHasFixedSize(true)
                (itemAnimator as? DefaultItemAnimator)?.supportsChangeAnimations = false
            }
        }
    }

    private fun addPlayer() {
        val name = binding.etPlayerName.text?.toString()?.trim() ?: return
        if (name.isNotBlank()) {
            viewModel.addPlayer(name)
            binding.etPlayerName.text?.clear()
        }
    }

    private fun observeViewModel() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.gameState.observe(viewLifecycleOwner) { gameState ->
                        playerAdapter.submitList(gameState.players.toList())
                        binding.btnStartGame.isEnabled = gameState.players.size >= 7
                    }
                }

                launch {
                    viewModel.errorMessage.observe(viewLifecycleOwner) { message ->
                        message?.let {
                            Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            }
        }
    }

    override fun onDestroyView() {
        binding.rvPlayers.adapter = null
        super.onDestroyView()
        _binding = null
    }
} 