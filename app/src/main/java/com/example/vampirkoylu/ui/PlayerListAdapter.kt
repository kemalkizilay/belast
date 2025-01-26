package com.example.vampirkoylu.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.example.vampirkoylu.databinding.ItemPlayerBinding
import com.example.vampirkoylu.model.Player
import com.example.vampirkoylu.model.RoleDetails

class PlayerListAdapter(
    private val onRemoveClick: (String) -> Unit
) : ListAdapter<Player, PlayerListAdapter.PlayerViewHolder>(PlayerDiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PlayerViewHolder {
        return PlayerViewHolder(
            ItemPlayerBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            ),
            onRemoveClick
        )
    }

    override fun onBindViewHolder(holder: PlayerViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    override fun onViewRecycled(holder: PlayerViewHolder) {
        super.onViewRecycled(holder)
        holder.unbind()
    }

    class PlayerViewHolder(
        private val binding: ItemPlayerBinding,
        onRemoveClick: (String) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {
        private var currentPlayerId: String? = null

        init {
            binding.btnRemove.setOnClickListener {
                currentPlayerId?.let(onRemoveClick)
            }
        }

        fun bind(player: Player) {
            currentPlayerId = player.id
            with(binding) {
                tvPlayerName.text = player.name
                
                player.role?.let { role ->
                    tvPlayerRole.isVisible = true
                    ivRoleIcon.isVisible = true
                    
                    val roleInfo = RoleDetails.roleInfoMap[role]
                    tvPlayerRole.text = roleInfo?.name ?: role.name
                    roleInfo?.icon?.let { icon ->
                        ivRoleIcon.setImageResource(icon)
                    }
                } ?: run {
                    tvPlayerRole.isVisible = false
                    ivRoleIcon.isVisible = false
                }
            }
        }

        fun unbind() {
            currentPlayerId = null
            with(binding) {
                tvPlayerName.text = null
                tvPlayerRole.text = null
                ivRoleIcon.setImageDrawable(null)
            }
        }
    }

    private object PlayerDiffCallback : DiffUtil.ItemCallback<Player>() {
        override fun areItemsTheSame(oldItem: Player, newItem: Player): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Player, newItem: Player): Boolean {
            return oldItem == newItem
        }

        override fun getChangePayload(oldItem: Player, newItem: Player): Any? {
            return if (oldItem.id == newItem.id && oldItem.name == newItem.name) {
                // Sadece rol değişmişse, tam bir bind yerine kısmi güncelleme yap
                Any()
            } else {
                null
            }
        }
    }
} 