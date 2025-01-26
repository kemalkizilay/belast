package com.yourdomain.vampirkoylu.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.yourdomain.vampirkoylu.databinding.FragmentGameSetupBinding
import com.yourdomain.vampirkoylu.model.GameRole
import com.yourdomain.vampirkoylu.model.Player
import com.yourdomain.vampirkoylu.viewmodel.GameViewModel
import java.util.UUID

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
        setupButtons()
        observeViewModel()
    }

    private fun setupRecyclerView() {
        playerAdapter = PlayerAdapter(
            onRemoveClick = { player ->
                viewModel.removePlayer(player)
            }
        )
        binding.rvPlayers.apply {
            layoutManager = LinearLayoutManager(context)
            adapter = playerAdapter
        }
    }

    private fun setupButtons() {
        binding.btnAddPlayer.setOnClickListener {
            val name = binding.etPlayerName.text.toString().trim()
            if (name.isNotEmpty()) {
                showRoleSelectionDialog(name)
                binding.etPlayerName.text?.clear()
            } else {
                Toast.makeText(context, "Lütfen bir isim girin", Toast.LENGTH_SHORT).show()
            }
        }

        binding.btnStartGame.setOnClickListener {
            viewModel.startGame()
        }
    }

    private fun showRoleSelectionDialog(playerName: String) {
        val roles = GameRole.values()
        val roleNames = roles.map { it.name }.toTypedArray()

        MaterialAlertDialogBuilder(requireContext())
            .setTitle("Rol Seçin")
            .setItems(roleNames) { _, which ->
                val player = Player(
                    id = UUID.randomUUID().toString(),
                    name = playerName,
                    role = roles[which],
                    isAlive = true,
                    isRevealed = false
                )
                viewModel.addPlayer(player)
            }
            .show()
    }

    private fun observeViewModel() {
        viewModel.gameState.observe(viewLifecycleOwner) { gameState ->
            playerAdapter.submitList(gameState.players.toList())
            binding.btnStartGame.isEnabled = gameState.players.isNotEmpty()
        }

        viewModel.errorMessage.observe(viewLifecycleOwner) { message ->
            message?.let {
                Toast.makeText(context, it, Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
} 