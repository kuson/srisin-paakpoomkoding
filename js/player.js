/**
 * Srisin Family - Custom Video Player
 * YouTube-like video player with custom controls
 */

document.addEventListener('DOMContentLoaded', function() {
    // ============ Element References ============
    const video = document.getElementById('mainVideo');
    const playOverlay = document.getElementById('playOverlay');
    const playBtnLarge = document.getElementById('playBtnLarge');
    const videoControls = document.getElementById('videoControls');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = document.getElementById('playPauseIcon');
    const skipBackBtn = document.getElementById('skipBackBtn');
    const skipForwardBtn = document.getElementById('skipForwardBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeIcon = document.getElementById('volumeIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const buffered = document.getElementById('buffered');
    const progressThumb = document.getElementById('progressThumb');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const fullscreenIcon = document.getElementById('fullscreenIcon');
    const pipBtn = document.getElementById('pipBtn');
    const videoContainer = document.querySelector('.video-container');

    // ============ State Variables ============
    let isPlaying = false;
    let isMuted = false;
    let controlsTimeout;

    // ============ Utility Functions ============
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    function updatePlayPauseIcon() {
        if (video.paused) {
            playPauseIcon.classList.remove('bi-pause-fill');
            playPauseIcon.classList.add('bi-play-fill');
            playOverlay.classList.remove('hidden');
        } else {
            playPauseIcon.classList.remove('bi-play-fill');
            playPauseIcon.classList.add('bi-pause-fill');
            playOverlay.classList.add('hidden');
        }
    }

    function updateVolumeIcon() {
        volumeIcon.classList.remove('bi-volume-up-fill', 'bi-volume-down-fill', 'bi-volume-mute-fill');
        
        if (video.muted || video.volume === 0) {
            volumeIcon.classList.add('bi-volume-mute-fill');
        } else if (video.volume < 0.5) {
            volumeIcon.classList.add('bi-volume-down-fill');
        } else {
            volumeIcon.classList.add('bi-volume-up-fill');
        }
    }

    function updateProgress() {
        const percent = (video.currentTime / video.duration) * 100;
        progress.style.width = `${percent}%`;
        progressThumb.style.left = `${percent}%`;
        currentTimeEl.textContent = formatTime(video.currentTime);
    }

    function updateBuffered() {
        if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const percent = (bufferedEnd / video.duration) * 100;
            buffered.style.width = `${percent}%`;
        }
    }

    function showControls() {
        videoControls.classList.add('visible');
        clearTimeout(controlsTimeout);
        
        if (!video.paused) {
            controlsTimeout = setTimeout(() => {
                videoControls.classList.remove('visible');
            }, 3000);
        }
    }

    // ============ Play/Pause Functions ============
    function togglePlay() {
        if (video.paused) {
            video.play().catch(e => console.log('Play error:', e));
        } else {
            video.pause();
        }
    }

    // ============ Event Listeners ============
    
    // Play/Pause Controls
    playOverlay.addEventListener('click', togglePlay);
    playBtnLarge.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
    });
    
    video.addEventListener('click', togglePlay);
    playPauseBtn.addEventListener('click', togglePlay);

    // Video State Changes
    video.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseIcon();
        showControls();
    });

    video.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseIcon();
        showControls();
    });

    video.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseIcon();
        playOverlay.classList.remove('hidden');
    });

    // Time & Progress Updates
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('progress', updateBuffered);

    video.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(video.duration);
    });

    video.addEventListener('durationchange', () => {
        durationEl.textContent = formatTime(video.duration);
    });

    // Progress Bar - Seeking functionality
    let isDragging = false;
    let wasPlayingBeforeDrag = false;

    function seekToPosition(clientX) {
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const seekTime = percent * video.duration;
        
        if (!isNaN(seekTime) && isFinite(seekTime)) {
            video.currentTime = seekTime;
            // Update UI immediately for responsiveness
            progress.style.width = `${percent * 100}%`;
            progressThumb.style.left = `${percent * 100}%`;
            currentTimeEl.textContent = formatTime(seekTime);
        }
    }

    // Progress Bar Click (only if not dragging)
    progressBar.addEventListener('click', (e) => {
        if (!isDragging) {
            seekToPosition(e.clientX);
        }
    });

    // Progress Bar Drag - Mouse events
    progressBar.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        wasPlayingBeforeDrag = !video.paused;
        
        // Pause while dragging for smoother seeking
        if (wasPlayingBeforeDrag) {
            video.pause();
        }
        
        seekToPosition(e.clientX);
        
        // Add active class for visual feedback
        progressBar.classList.add('seeking');
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            seekToPosition(e.clientX);
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            progressBar.classList.remove('seeking');
            
            // Resume playback if was playing before drag
            if (wasPlayingBeforeDrag) {
                video.play().catch(err => console.log('Resume play error:', err));
            }
        }
    });

    // Progress Bar Drag - Touch events for mobile
    progressBar.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        wasPlayingBeforeDrag = !video.paused;
        
        if (wasPlayingBeforeDrag) {
            video.pause();
        }
        
        const touch = e.touches[0];
        seekToPosition(touch.clientX);
        progressBar.classList.add('seeking');
    }, { passive: false });

    progressBar.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            seekToPosition(touch.clientX);
        }
    }, { passive: false });

    progressBar.addEventListener('touchend', (e) => {
        if (isDragging) {
            isDragging = false;
            progressBar.classList.remove('seeking');
            
            if (wasPlayingBeforeDrag) {
                video.play().catch(err => console.log('Resume play error:', err));
            }
        }
    });

    // Skip Controls
    skipBackBtn.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
    });

    skipForwardBtn.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
    });

    // Volume Controls
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        isMuted = video.muted;
        volumeSlider.value = video.muted ? 0 : video.volume;
        updateVolumeIcon();
    });

    volumeSlider.addEventListener('input', (e) => {
        video.volume = e.target.value;
        video.muted = video.volume === 0;
        updateVolumeIcon();
    });

    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoContainer.requestFullscreen().catch(e => {
                console.log('Fullscreen error:', e);
            });
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenIcon.classList.remove('bi-fullscreen');
            fullscreenIcon.classList.add('bi-fullscreen-exit');
        } else {
            fullscreenIcon.classList.remove('bi-fullscreen-exit');
            fullscreenIcon.classList.add('bi-fullscreen');
        }
    });

    // Picture in Picture
    if (document.pictureInPictureEnabled) {
        pipBtn.addEventListener('click', async () => {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await video.requestPictureInPicture();
                }
            } catch (e) {
                console.log('PiP error:', e);
            }
        });
    } else {
        pipBtn.style.display = 'none';
    }

    // Show/Hide Controls
    videoContainer.addEventListener('mousemove', showControls);
    videoContainer.addEventListener('mouseleave', () => {
        if (!video.paused) {
            controlsTimeout = setTimeout(() => {
                videoControls.classList.remove('visible');
            }, 1000);
        }
    });

    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
        // Only respond if video is in viewport
        const rect = video.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isVisible) return;

        switch(e.key.toLowerCase()) {
            case ' ':
            case 'k':
                e.preventDefault();
                togglePlay();
                break;
            case 'f':
                e.preventDefault();
                fullscreenBtn.click();
                break;
            case 'm':
                e.preventDefault();
                muteBtn.click();
                break;
            case 'arrowleft':
            case 'j':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 10);
                break;
            case 'arrowright':
            case 'l':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                break;
            case 'arrowup':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                volumeSlider.value = video.volume;
                updateVolumeIcon();
                break;
            case 'arrowdown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                volumeSlider.value = video.volume;
                updateVolumeIcon();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                e.preventDefault();
                const percent = parseInt(e.key) * 10;
                video.currentTime = (percent / 100) * video.duration;
                break;
        }
    });

    // Double-click for fullscreen
    video.addEventListener('dblclick', (e) => {
        e.preventDefault();
        fullscreenBtn.click();
    });

    // Touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    video.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    video.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // If it's a tap (not a swipe)
        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
            togglePlay();
        }
    });

    // Video Thumbnail Click (Playlist)
    const thumbnails = document.querySelectorAll('.video-thumbnail:not(.placeholder-video)');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            const videoSrc = this.dataset.video;
            if (videoSrc) {
                // Update active state
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Load new video
                video.src = videoSrc;
                video.load();
                video.play().catch(e => console.log('Play error:', e));
            }
        });
    });

    // Initialize
    updatePlayPauseIcon();
    updateVolumeIcon();
    showControls();

    console.log('🎬 Srisin Family Video Player initialized!');
});
