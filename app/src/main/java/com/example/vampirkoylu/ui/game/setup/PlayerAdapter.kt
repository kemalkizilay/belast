package com.example.vampirkoylu.ui.game.setup

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.vampirkoylu.databinding.ItemPlayerBinding
import com.example.vampirkoylu.domain.model.Player

class PlayerAdapter(
    private val onRemoveClick: (String) -> Unit
) : ListAdapter<Player, PlayerAdapter.PlayerViewHolder>(PlayerDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlayerViewHolder {
        val binding = ItemPlayerBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PlayerViewHolder(binding, onRemoveClick)
    }

    override fun onBindViewHolder(holder: PlayerViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class PlayerViewHolder(
        private val binding: ItemPlayerBinding,
        private val onRemoveClick: (String) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(player: Player) {
            binding.playerName.text = player.name
            binding.removeButton.setOnClickListener {
                onRemoveClick(player.id)
            }
        }
    }

    private class PlayerDiffCallback : DiffUtil.ItemCallback<Player>() {
        override fun areItemsTheSame(oldItem: Player, newItem: Player): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Player, newItem: Player): Boolean {
            return oldItem == newItem
        }
    }
} 