package com.example.vampirkoylu

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import androidx.activity.viewModels
import androidx.fragment.app.Fragment
import com.example.vampirkoylu.databinding.ActivityMainBinding
import com.example.vampirkoylu.model.GamePhase
import com.example.vampirkoylu.ui.DayPhaseFragment
import com.example.vampirkoylu.ui.FirstNightFragment
import com.example.vampirkoylu.ui.GameSetupFragment
import com.example.vampirkoylu.ui.NightPhaseFragment
import com.example.vampirkoylu.viewmodel.GameViewModel

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val viewModel: GameViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        if (savedInstanceState == null) {
            // İlk başlangıçta GameSetupFragment'ı göster
            supportFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, GameSetupFragment())
                .commit()
        }

        // Oyun fazını gözlemle
        viewModel.gameState.observe(this) { gameState ->
            val fragment = when (gameState.phase) {
                GamePhase.SETUP -> GameSetupFragment()
                GamePhase.FIRST_NIGHT -> FirstNightFragment()
                GamePhase.NIGHT -> NightPhaseFragment()
                GamePhase.DAY -> DayPhaseFragment()
                else -> GameSetupFragment()
            }
            
            replaceFragment(fragment)
        }
    }

    private fun replaceFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .setCustomAnimations(
                R.anim.fade_in,
                R.anim.fade_out,
                R.anim.fade_in,
                R.anim.fade_out
            )
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }
} 