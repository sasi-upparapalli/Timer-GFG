class Timer {
    constructor() {
        this.totalSeconds = 60;
        this.currentSeconds = this.totalSeconds;
        this.isRunning = false;
        this.intervalId = null;
        this.buzzerDuration = 3000;

        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.timerDisplay = document.getElementById('timerDisplay');
        this.startStopBtn = document.getElementById('startStopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.editBtn = document.getElementById('editBtn');

        this.modal = document.getElementById('editModal');
        this.closeModal = document.getElementById('closeModal');
        this.hoursSelect = document.getElementById('hours');
        this.minutesSelect = document.getElementById('minutes');
        this.secondsSelect = document.getElementById('seconds');
        this.modalStartBtn = document.getElementById('modalStartBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.testBtn = document.getElementById('testBtn');

        this.customSound = document.getElementById('customSound');
        this.tickSound = document.getElementById('tickSound');

        this.timerTitle = document.getElementById('timerTitle');
        this.showMessage = document.getElementById('showMessage');
    }

    bindEvents() {
        this.startStopBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.editBtn.addEventListener('click', () => this.openModal());

        this.closeModal.addEventListener('click', () => this.closeModalHandler());
        this.cancelBtn.addEventListener('click', () => this.closeModalHandler());
        this.modalStartBtn.addEventListener('click', () => this.startFromModal());
        this.testBtn.addEventListener('click', () => this.testTimer());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModalHandler();
            }
        });

        document.querySelectorAll('.spinner-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSpinner(e));
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.modal.style.display) {
                e.preventDefault();
                this.toggleTimer();
            }
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModalHandler();
            }
        });
    }

    updateDisplay() {
        const hours = Math.floor(this.currentSeconds / 3600);
        const minutes = Math.floor((this.currentSeconds % 3600) / 60);
        const seconds = this.currentSeconds % 60;

        const displayText = hours > 0
            ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.timerDisplay.textContent = displayText;
        document.title = this.isRunning ? `⏰ ${displayText} - Timer` : 'Timer - Campus Body';
    }

    toggleTimer() {
        this.isRunning ? this.pauseTimer() : this.startTimer();
    }

    startTimer() {
        if (this.currentSeconds <= 0) {
            this.currentSeconds = this.totalSeconds;
        }

        this.isRunning = true;
        this.startStopBtn.textContent = 'Stop';
        this.startStopBtn.classList.add('stop');

        this.intervalId = setInterval(() => {
            this.playTickSound();
            this.currentSeconds--;
            this.updateDisplay();

            if (this.currentSeconds <= 0) {
                this.completeTimer();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.startStopBtn.textContent = 'Start';
        this.startStopBtn.classList.remove('stop');

        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    resetTimer() {
        this.pauseTimer();
        this.currentSeconds = this.totalSeconds;
        this.updateDisplay();
        this.timerDisplay.classList.remove('completed');
    }

    completeTimer() {
        this.pauseTimer();
        this.timerDisplay.classList.add('completed');
        this.playCompletionSound();

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
                body: 'Your timer has finished.',
                icon: 'gfg.jpg'
            });
        }

        const onZeroOption = document.querySelector('input[name="onZero"]:checked').value;

        setTimeout(() => {
            switch (onZeroOption) {
                case 'restart':
                    this.resetTimer();
                    this.startTimer();
                    break;
                case 'stopwatch':
                    this.currentSeconds = 0;
                    this.startTimer();
                    break;
            }
        }, 1000);
    }

    playCompletionSound() {
        if (!this.customSound) return;

        this.customSound.currentTime = 0;
        this.customSound.play().catch(err => console.log('Audio play failed:', err));

        setTimeout(() => {
            this.customSound.pause();
            this.customSound.currentTime = 0;
        }, this.buzzerDuration);
    }

    playTickSound() {
        if (!this.tickSound) return;

        this.tickSound.currentTime = 0;
        this.tickSound.play().catch(err => {
            // Ignore autoplay errors silently
        });
    }

    openModal() {
        const hours = Math.floor(this.totalSeconds / 3600);
        const minutes = Math.floor((this.totalSeconds % 3600) / 60);
        const seconds = this.totalSeconds % 60;

        this.hoursSelect.value = hours.toString().padStart(2, '0');
        this.minutesSelect.value = minutes.toString().padStart(2, '0');
        this.secondsSelect.value = seconds.toString().padStart(2, '0');

        this.modal.style.display = 'block';

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    closeModalHandler() {
        this.modal.style.display = 'none';
    }

    startFromModal() {
        this.updateTimerFromModal();
        this.closeModalHandler();
        this.resetTimer();
        this.startTimer();
    }

    testTimer() {
        this.updateTimerFromModal();
        this.closeModalHandler();
        this.resetTimer();
    }

    updateTimerFromModal() {
        const hours = parseInt(this.hoursSelect.value) || 0;
        const minutes = parseInt(this.minutesSelect.value) || 0;
        const seconds = parseInt(this.secondsSelect.value) || 0;

        this.totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        this.currentSeconds = this.totalSeconds || 60;

        this.updateDisplay();
    }

    handleSpinner(event) {
        const button = event.target;
        const inputType = button.dataset.input;
        const action = button.dataset.action;
        const select = document.getElementById(inputType);

        let currentValue = parseInt(select.value);
        let newValue;

        if (action === 'increase') {
            newValue = Math.min(currentValue + 1, inputType === 'hours' ? 23 : 59);
        } else {
            newValue = Math.max(currentValue - 1, 0);
        }

        select.value = newValue.toString().padStart(2, '0');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timer = new Timer();
    window.timer = timer;
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('SW registered'))
            .catch(error => console.log('SW registration failed', error));
    });
}
