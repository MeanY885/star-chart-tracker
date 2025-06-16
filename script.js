class StarChartTracker {
    constructor() {
        this.config = {
            childName: 'My Child',
            goalPrize: 'Special Prize',
            totalStars: 15,
            superStarValue: 5
        };
        this.currentStars = 0;
        this.childName = null;
        this.sounds = {};
        
        this.initializeElements();
        this.initializeChart();
        this.setupEventListeners();
        this.loadSounds();
    }

    initializeElements() {
        this.elements = {
            childName: document.getElementById('childName'),
            currentStars: document.getElementById('currentStars'),
            totalStars: document.getElementById('totalStars'),
            goalPrize: document.getElementById('goalPrize'),
            starGrid: document.getElementById('starGrid'),
            superBtn: document.getElementById('superBtn'),
            configBtn: document.getElementById('configBtn'),
            configModal: document.getElementById('configModal'),
            childNameInput: document.getElementById('childNameInput'),
            goalPrizeInput: document.getElementById('goalPrizeInput'),
            totalStarsInput: document.getElementById('totalStarsInput'),
            superStarValueInput: document.getElementById('superStarValueInput'),
            saveConfigBtn: document.getElementById('saveConfigBtn'),
            cancelConfigBtn: document.getElementById('cancelConfigBtn'),
            shareBtn: document.getElementById('shareBtn'),
            shareModal: document.getElementById('shareModal'),
            shareUrl: document.getElementById('shareUrl'),
            copyUrlBtn: document.getElementById('copyUrlBtn'),
            closeShareBtn: document.getElementById('closeShareBtn'),
            qrCode: document.getElementById('qrCode'),
            animationOverlay: document.getElementById('animationOverlay')
        };
    }

    async initializeChart() {
        // Check if we have a child name in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const childName = urlParams.get('child');
        
        if (childName) {
            try {
                await this.loadChart(childName);
            } catch (error) {
                console.error('Failed to load chart:', error);
                this.showCreateNewChart();
            }
        } else {
            this.showCreateNewChart();
        }
        
        this.createStarGrid();
        this.updateDisplay();
    }
    
    async loadChart(childName) {
        const urlSafeName = encodeURIComponent(childName.toLowerCase());
        const response = await fetch(`/api/chart/${urlSafeName}`);
        if (!response.ok) {
            throw new Error('Chart not found');
        }
        
        const data = await response.json();
        this.childName = data.childName;
        this.config = {
            childName: data.childName,
            goalPrize: data.goalPrize,
            totalStars: data.totalStars,
            superStarValue: data.superStarValue
        };
        this.currentStars = data.currentStars;
    }
    
    showCreateNewChart() {
        const createNew = confirm('No chart found. Would you like to create a new star chart?');
        if (createNew) {
            this.openConfig();
        }
    }

    async saveConfig() {
        if (!this.childName) {
            // Create new chart
            const response = await fetch('/api/chart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    childName: this.config.childName,
                    goalPrize: this.config.goalPrize,
                    totalStars: this.config.totalStars,
                    superStarValue: this.config.superStarValue
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.childName = data.childName;
                // Update URL with child name
                const urlSafeName = encodeURIComponent(this.childName.toLowerCase());
                window.history.pushState({}, '', `?child=${urlSafeName}`);
            }
        } else {
            // Update existing chart
            const urlSafeName = encodeURIComponent(this.childName.toLowerCase());
            await fetch(`/api/chart/${urlSafeName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goalPrize: this.config.goalPrize,
                    totalStars: this.config.totalStars,
                    currentStars: this.currentStars,
                    superStarValue: this.config.superStarValue
                })
            });
        }
    }
    
    async saveStars() {
        if (this.childName) {
            const urlSafeName = encodeURIComponent(this.childName.toLowerCase());
            await fetch(`/api/chart/${urlSafeName}/stars`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentStars: this.currentStars
                })
            });
        }
    }

    setupEventListeners() {
        this.elements.superBtn.addEventListener('click', () => this.superStar());
        this.elements.configBtn.addEventListener('click', () => this.openConfig());
        this.elements.saveConfigBtn.addEventListener('click', () => this.saveConfigChanges());
        this.elements.cancelConfigBtn.addEventListener('click', () => this.closeConfig());
        this.elements.shareBtn.addEventListener('click', () => this.openShare());
        this.elements.copyUrlBtn.addEventListener('click', () => this.copyUrl());
        this.elements.closeShareBtn.addEventListener('click', () => this.closeShare());
        
        // Close modals when clicking outside
        this.elements.configModal.addEventListener('click', (e) => {
            if (e.target === this.elements.configModal) {
                this.closeConfig();
            }
        });
        
        this.elements.shareModal.addEventListener('click', (e) => {
            if (e.target === this.elements.shareModal) {
                this.closeShare();
            }
        });
    }

    loadSounds() {
        // Create audio contexts for sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.log('Web Audio API not supported, sounds will be disabled');
        }
    }

    createSounds() {
        // Simple sound generation using Web Audio API
        this.sounds = {
            earn: () => this.playTone(523.25, 0.3, 'sine'), // C5
            lose: () => this.playTone(261.63, 0.5, 'triangle'), // C4
            super: () => this.playSuperSound()
        };
    }

    playTone(frequency, duration, waveType = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = waveType;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playSuperSound() {
        if (!this.audioContext) return;

        // Play a fanfare sequence
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            setTimeout(() => this.playTone(freq, 0.4), index * 200);
        });
    }

    createStarGrid() {
        this.elements.starGrid.innerHTML = '';
        
        // Add responsive class based on total stars
        this.elements.starGrid.className = 'star-grid ' + this.getGridClass();
        
        for (let i = 0; i < this.config.totalStars; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.dataset.index = i;
            
            if (i < this.currentStars) {
                star.classList.add('earned');
                star.textContent = '⭐';
            } else {
                star.classList.add('empty');
                star.textContent = '☆';
            }

            // Add click listener to each star
            star.addEventListener('click', () => this.toggleStar(i));

            this.elements.starGrid.appendChild(star);
        }
    }
    
    getGridClass() {
        const total = this.config.totalStars;
        if (total <= 5) return 'stars-5';
        if (total <= 10) return 'stars-6-10';
        if (total <= 15) return 'stars-11-15';
        if (total <= 20) return 'stars-16-20';
        if (total <= 25) return 'stars-21-25';
        if (total <= 30) return 'stars-26-30';
        if (total <= 36) return 'stars-31-36';
        if (total <= 42) return 'stars-37-42';
        return 'stars-43-50';
    }

    updateDisplay() {
        this.elements.childName.textContent = `${this.config.childName}'s Star Chart`;
        this.elements.currentStars.textContent = this.currentStars;
        this.elements.totalStars.textContent = this.config.totalStars;
        this.elements.goalPrize.textContent = this.config.goalPrize;
        
        this.updateButtons();
        this.createStarGrid();
    }

    updateButtons() {
        this.elements.superBtn.disabled = 
            this.currentStars + this.config.superStarValue > this.config.totalStars;
            
        // Show/hide share button based on whether chart is saved
        if (this.childName) {
            this.elements.shareBtn.style.display = 'flex';
        } else {
            this.elements.shareBtn.style.display = 'none';
        }
    }

    async toggleStar(starIndex) {
        if (starIndex < this.currentStars) {
            // Remove stars from this point onwards
            this.currentStars = starIndex;
            this.playSound('lose');
        } else if (starIndex === this.currentStars && this.currentStars < this.config.totalStars) {
            // Add one star
            this.currentStars++;
            this.animateStarEarn(starIndex);
            this.playSound('earn');
            
            // Check if goal is reached
            if (this.currentStars === this.config.totalStars) {
                setTimeout(() => this.showGoalReached(), 2000);
            }
        }
        
        await this.saveStars();
        this.updateDisplay();
    }


    async superStar() {
        if (this.currentStars + this.config.superStarValue > this.config.totalStars) return;

        const oldStars = this.currentStars;
        this.currentStars += this.config.superStarValue;
        
        this.animateSuperStar(oldStars, this.currentStars);
        this.playSound('super');
        
        await this.saveStars();
        this.updateDisplay();

        // Check if goal is reached
        if (this.currentStars === this.config.totalStars) {
            setTimeout(() => this.showGoalReached(), 3000);
        }
    }

    animateStarEarn(starIndex) {
        const stars = this.elements.starGrid.children;
        const star = stars[starIndex];
        
        if (star) {
            star.classList.add('sparkle');
            setTimeout(() => {
                star.classList.remove('sparkle');
                star.classList.remove('empty');
                star.classList.add('earned');
                star.textContent = '⭐';
            }, 2000);
        }

        this.createSparkleEffect(star);
    }

    animateStarLose(starIndex) {
        const stars = this.elements.starGrid.children;
        const star = stars[starIndex];
        
        if (star) {
            star.classList.add('fade');
            setTimeout(() => {
                star.classList.remove('fade');
                star.classList.remove('earned');
                star.classList.add('empty');
                star.textContent = '☆';
            }, 2000);
        }
    }

    animateSuperStar(startIndex, endIndex) {
        const stars = this.elements.starGrid.children;
        
        for (let i = startIndex; i < endIndex; i++) {
            const star = stars[i];
            if (star) {
                setTimeout(() => {
                    star.classList.add('super-animation');
                    setTimeout(() => {
                        star.classList.remove('super-animation');
                        star.classList.remove('empty');
                        star.classList.add('earned');
                        star.textContent = '⭐';
                    }, 3000);
                }, i * 100);
            }
        }

        this.createConfettiEffect();
    }

    createSparkleEffect(centerElement) {
        if (!centerElement) return;

        const rect = centerElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 6; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.position = 'fixed';
            sparkle.style.left = centerX + 'px';
            sparkle.style.top = centerY + 'px';
            sparkle.style.width = '8px';
            sparkle.style.height = '8px';
            sparkle.style.background = '#ffd700';
            sparkle.style.borderRadius = '50%';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '1000';

            document.body.appendChild(sparkle);

            const angle = (i * 60) * Math.PI / 180;
            const distance = 50;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;

            sparkle.animate([
                { transform: 'translate(0, 0) scale(0)', opacity: 1 },
                { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(1)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => sparkle.remove();
        }
    }

    createConfettiEffect() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.background = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'][Math.floor(Math.random() * 5)];
                
                this.elements.animationOverlay.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 100);
        }
    }

    showGoalReached() {
        alert(`🎉 Congratulations ${this.config.childName}! You've reached your goal and earned: ${this.config.goalPrize}! 🎉`);
        this.createConfettiEffect();
    }

    playSound(soundType) {
        if (this.sounds[soundType]) {
            this.sounds[soundType]();
        }
    }



    openConfig() {
        this.elements.childNameInput.value = this.config.childName;
        this.elements.goalPrizeInput.value = this.config.goalPrize;
        this.elements.totalStarsInput.value = this.config.totalStars;
        this.elements.superStarValueInput.value = this.config.superStarValue;
        this.elements.configModal.classList.add('show');
    }

    closeConfig() {
        this.elements.configModal.classList.remove('show');
    }
    
    async openShare() {
        if (!this.childName) {
            alert('Please save your chart first!');
            return;
        }
        
        const shareUrl = await this.getShareUrl();
        this.elements.shareUrl.value = shareUrl;
        this.generateQRCode(shareUrl);
        this.elements.shareModal.classList.add('show');
    }
    
    closeShare() {
        this.elements.shareModal.classList.remove('show');
    }
    
    async getShareUrl() {
        // Try to get the actual network IP for better sharing
        try {
            const response = await fetch('/api/network-info');
            const networkInfo = await response.json();
            
            // Use the network IP if available, otherwise fall back to current hostname
            const hostname = networkInfo.ip !== 'localhost' ? networkInfo.ip : window.location.hostname;
            const port = window.location.port ? `:${window.location.port}` : '';
            const urlSafeName = encodeURIComponent(this.childName.toLowerCase());
            return `http://${hostname}${port}?child=${urlSafeName}`;
        } catch (error) {
            console.error('Failed to get network info:', error);
            // Fallback to current URL
            const port = window.location.port ? `:${window.location.port}` : '';
            const urlSafeName = encodeURIComponent(this.childName.toLowerCase());
            return `http://${window.location.hostname}${port}?child=${urlSafeName}`;
        }
    }
    
    async copyUrl() {
        try {
            await navigator.clipboard.writeText(this.elements.shareUrl.value);
            this.elements.copyUrlBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.elements.copyUrlBtn.textContent = 'Copy';
            }, 2000);
        } catch (err) {
            // Fallback for browsers that don't support clipboard API
            this.elements.shareUrl.select();
            document.execCommand('copy');
            this.elements.copyUrlBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.elements.copyUrlBtn.textContent = 'Copy';
            }, 2000);
        }
    }
    
    generateQRCode(url) {
        // Simple QR code generation using a web service
        const qrSize = 200;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}`;
        
        this.elements.qrCode.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width: 100%; height: 100%; object-fit: contain;" />`;
    }

    async saveConfigChanges() {
        const newConfig = {
            childName: this.elements.childNameInput.value.trim() || 'My Child',
            goalPrize: this.elements.goalPrizeInput.value.trim() || 'Special Prize',
            totalStars: Math.max(5, Math.min(50, parseInt(this.elements.totalStarsInput.value) || 15)),
            superStarValue: Math.max(2, Math.min(10, parseInt(this.elements.superStarValueInput.value) || 5))
        };

        // If total stars changed and current stars exceed new limit, adjust
        if (newConfig.totalStars < this.config.totalStars && this.currentStars > newConfig.totalStars) {
            this.currentStars = newConfig.totalStars;
        }

        this.config = newConfig;
        await this.saveConfig();
        this.updateDisplay();
        this.closeConfig();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StarChartTracker();
});