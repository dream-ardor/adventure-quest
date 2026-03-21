/**
 * Sound Manager - Web Audio API
 * 
 * ENGINEERING PATTERN: Manager Pattern
 * Centralizes all audio logic in one reusable class
 * 
 * WEB AUDIO CONCEPT: AudioContext is like a canvas for sound
 * - You create "nodes" (oscillators, gains, filters)
 * - Connect them together
 * - Send to destination (speakers)
 */

class SoundManager {
    constructor() {
        // Create audio context (the "sound canvas")
        // We create it lazily (on first interaction) due to browser autoplay policies
        this.audioContext = null;
        this.initialized = false;
    }
    
   /**
 * Initialize audio context
 * 
 * DEFENSIVE PROGRAMMING: Handle suspended state
 * Browsers can suspend AudioContext when tab is inactive
 */
init() {
    if (this.initialized) {
        // Context exists but might be suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            console.log('🔊 Sound resumed!');
        }
        return;
    }
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.initialized = true;
    
    console.log('🔊 Sound initialized!');
}
/**
 * Ensure audio context is ready to play
 * 
 * RELIABILITY: Check state before every sound
 * Resume if suspended (happens when tab was inactive)
 */
ensureReady() {
    if (!this.initialized) return false;
    
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    
    return this.audioContext.state === 'running';
}
    
/**
 * Play collect sound based on rarity
 * 
 * @param {string} rarity - 'common', 'rare', 'epic', or 'legendary'
 * 
 * SOUND DESIGN:
 * - Common: Single note (current)
 * - Rare: Two ascending notes
 * - Epic: Three note flourish
 * - Legendary: Full fanfare (4 notes)
 */
playCollect(rarity = 'common') {
    if (!this.ensureReady()) return;
    
    const now = this.audioContext.currentTime;
    
    // Different sound patterns for each rarity
    let frequencies = [];
    let durations = [];
    
    switch(rarity) {
        case 'common':
            frequencies = [800];
            durations = [0.1];
            break;
        case 'rare':
            frequencies = [800, 1000];
            durations = [0.08, 0.08];
            break;
        case 'epic':
            frequencies = [800, 1000, 1200];
            durations = [0.06, 0.06, 0.1];
            break;
        case 'legendary':
            frequencies = [800, 1000, 1200, 1600];
            durations = [0.06, 0.06, 0.06, 0.15];
            break;
    }
    
    // Play each note in sequence
    frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        
        const startTime = now + (index * 0.08);  // Stagger notes slightly
        oscillator.frequency.setValueAtTime(freq, startTime);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durations[index]);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + durations[index]);
    });
}
    /**
     * Play game start sound
     * 
     * SOUND DESIGN: Lower, welcoming tone
     * - Creates a "readiness" feeling
     * - Different from collect sound (audio hierarchy)
     */
    playStart() {
        if (!this.ensureReady()) return;
        
        const now = this.audioContext.currentTime;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);  // Lower = warmer
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }
/**
 * Play celebration sound (milestone fanfare)
 * 
 * SOUND DESIGN: Triumphant ascending notes
 * - Creates sense of achievement
 * - More complex than simple beeps
 */
playCelebration() {
    if (!this.ensureReady()) return;
    
    const now = this.audioContext.currentTime;
    
    // Play three ascending notes (major chord)
    const frequencies = [523, 659, 784];  // C, E, G (major chord)
    
    frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, now + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(now + index * 0.1);
        oscillator.stop(now + index * 0.1 + 0.3);
    });
}

}