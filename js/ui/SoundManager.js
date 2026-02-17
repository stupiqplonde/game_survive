class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = window.GameState?.settings?.sound ?? true;
        this.init();
    }
    
    init() {
        // Создаем звуки с помощью Web Audio API (без внешних файлов)
        this.createClickSound();
    }
    
    createClickSound() {
        // Используем Web Audio API для генерации звука
        this.sounds.click = () => {
            if (!this.enabled) return;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        };
    }
    
    attachToAllButtons() {
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => this.play('click'));
        });
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        window.GameState.settings.sound = this.enabled;
    }
}

window.SoundManager = SoundManager;