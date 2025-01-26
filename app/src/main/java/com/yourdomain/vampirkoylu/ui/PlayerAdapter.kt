package com.yourdomain.vampirkoylu.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.yourdomain.vampirkoylu.databinding.ItemPlayerBinding
import com.yourdomain.vampirkoylu.model.Player
import com.yourdomain.vampirkoylu.model.RoleDetails

class PlayerAdapter(
    private val onRemoveClick: (Player) -> Unit
) : ListAdapter<Player, PlayerAdapter.PlayerViewHolder>(PlayerDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlayerViewHolder {
        val binding = ItemPlayerBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PlayerViewHolder(binding)
    }

    override fun onBindViewHolder(holder: PlayerViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class PlayerViewHolder(
        private val binding: ItemPlayerBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(player: Player) {
            val roleInfo = RoleDetails.getRoleInfo(player.role)
            binding.apply {
                tvPlayerName.text = player.name
                tvPlayerRole.text = roleInfo.name
                ivRoleIcon.setImageResource(roleInfo.icon)
                btnRemove.setOnClickListener { onRemoveClick(player) }
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