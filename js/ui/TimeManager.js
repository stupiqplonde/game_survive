class TimeManager {
    constructor() {
        this.timeElement = document.getElementById('gameTime');
        this.startTime = Date.now();
        this.init();
    }
    
    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }
    
    updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

window.TimeManager = TimeManager;