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
     * Play a collect sound
     * 
     * SOUND DESIGN: Short, high-pitched, pleasant
     * - Frequency: 800 Hz (higher = brighter, happier)
     * - Duration: 0.1 seconds (quick feedback)
     * - Type: 'sine' wave (smoothest, most pleasant)
     */
    playCollect() {
        if (!this.ensureReady()) return;
        
        const now = this.audioContext.currentTime;
        
        // Create oscillator (the tone generator)
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';  // Smooth, pure tone
        oscillator.frequency.setValueAtTime(1200, now);  // 1200 Hz
        
        // Create gain node (volume control)
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, now);  // Start at 30% volume
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);  // Fade out
        
        // Connect the chain: Oscillator → Gain → Speakers
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + 0.2);  // Stop after 0.2 seconds
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
}