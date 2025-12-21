/**
 * Content Loader for Srisin Family Website
 * Dynamically loads and displays content from the admin panel
 */

(function() {
    'use strict';

    let isAdmin = false;

    // Check if user is authenticated as admin
    async function checkAdminStatus() {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            isAdmin = data.authenticated;
        } catch (error) {
            isAdmin = false;
        }
    }

    // Load and display content on page load
    async function loadContent() {
        try {
            await checkAdminStatus();
            
            const response = await fetch('/api/content');
            const content = await response.json();
            
            if (content.length === 0) {
                console.log('No dynamic content to display');
                return;
            }
            
            const container = document.getElementById('contentContainer');
            if (!container) {
                console.error('Content container not found. Make sure element with id="contentContainer" exists.');
                return;
            }
            
            // Clear existing dynamic content
            container.innerHTML = '';
            
            // Insert dynamic content
            content.forEach(item => {
                const card = createContentCard(item);
                container.appendChild(card);
            });
            
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }
    
    function createContentCard(item) {
        const tagClass = getTagClass(item.tag);
        const mediaHtml = item.media && item.media.length > 0 ? renderMedia(item.media) : '';
        
        // Create element programmatically to avoid XSS
        const col = document.createElement('div');
        col.className = 'masonry-item';
        
        const card = document.createElement('div');
        card.className = 'card shadow-sm content-card';
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Header with tag and date
        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-start mb-3';
        
        const tagSpan = document.createElement('span');
        tagSpan.className = `badge ${tagClass}`;
        tagSpan.innerHTML = `<i class="bi bi-tag me-1"></i>${escapeHtml(item.tag)}`;
        
        const rightSide = document.createElement('div');
        rightSide.className = 'd-flex align-items-center gap-2';
        
        // Add edit button if admin
        if (isAdmin) {
            const editBtn = document.createElement('a');
            editBtn.href = `/admin#edit-${item.id}`;
            editBtn.className = 'btn btn-sm btn-outline-primary';
            editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
            editBtn.title = 'Edit content';
            editBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = `/admin?edit=${item.id}`;
            };
            rightSide.appendChild(editBtn);
        }
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-muted small';
        dateSpan.innerHTML = `<i class="bi bi-calendar3 me-1"></i>${escapeHtml(item.date)}`;
        rightSide.appendChild(dateSpan);
        
        header.appendChild(tagSpan);
        header.appendChild(rightSide);
        
        // Title
        const title = document.createElement('h4');
        title.className = 'card-title mb-3';
        title.textContent = item.title;
        
        // Body content - sanitized HTML from TinyMCE
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'card-text';
        bodyDiv.innerHTML = item.body;
        
        cardBody.appendChild(header);
        cardBody.appendChild(title);
        cardBody.appendChild(bodyDiv);
        
        if (mediaHtml) {
            const mediaDiv = document.createElement('div');
            mediaDiv.innerHTML = mediaHtml;
            cardBody.appendChild(mediaDiv);
        }
        
        card.appendChild(cardBody);
        col.appendChild(card);
        
        return col;
    }
    
    function getTagClass(tag) {
        const tagLower = (tag || '').toLowerCase();
        if (tagLower.includes('family')) return 'bg-danger';
        if (tagLower.includes('note')) return 'bg-warning text-dark';
        if (tagLower.includes('story')) return 'bg-primary';
        if (tagLower.includes('update')) return 'bg-info';
        return 'bg-secondary';
    }
    
    function renderMedia(mediaArray) {
        const images = mediaArray.filter(m => m.type === 'image');
        const videos = mediaArray.filter(m => m.type === 'video');
        const files = mediaArray.filter(m => m.type === 'file');
        
        let html = '<div class="mt-3">';
        
        // Special case: Single video only (no images) - show inline video player
        if (videos.length === 1 && images.length === 0) {
            const video = videos[0];
            const videoId = 'video-' + Math.random().toString(36).substr(2, 9);
            const escapedUrl = escapeHtml(video.url);
            const escapedFilename = escapeHtml(video.filename || 'Video');
            
            html += `
                <div class="inline-video-player" data-video-id="${videoId}">
                    <div class="video-container-inline">
                        <video id="${videoId}" class="video-element-inline" preload="metadata">
                            <source src="${escapedUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                        
                        <div class="play-overlay-inline" id="${videoId}-overlay">
                            <button class="play-btn-inline">
                                <i class="bi bi-play-fill"></i>
                            </button>
                        </div>
                        
                        <div class="video-controls-inline" id="${videoId}-controls">
                            <div class="progress-container-inline">
                                <div class="progress-bar-wrapper-inline" id="${videoId}-progressBar">
                                    <div class="progress-filled-inline" id="${videoId}-progress"></div>
                                </div>
                            </div>
                            <div class="controls-row-inline">
                                <button class="control-btn-inline" id="${videoId}-playPause" title="Play/Pause">
                                    <i class="bi bi-play-fill" id="${videoId}-playIcon"></i>
                                </button>
                                <span class="time-display-inline">
                                    <span id="${videoId}-currentTime">0:00</span> / <span id="${videoId}-duration">0:00</span>
                                </span>
                                <button class="control-btn-inline ms-auto" id="${videoId}-fullscreen" title="Fullscreen">
                                    <i class="bi bi-fullscreen"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="video-info-inline mt-2">
                        <small class="text-muted"><i class="bi bi-film me-1"></i>${escapedFilename}</small>
                    </div>
                </div>
            `;
            
            // Will initialize player after DOM insertion
            setTimeout(() => initInlineVideoPlayer(videoId), 100);
            
            html += '</div>';
            return html;
        }
        
        // Combine images and videos for gallery, sort by order (assume already sorted)
        const mediaItems = [
            ...images.map(m => ({ ...m, mediaType: 'image' })),
            ...videos.map(m => ({ ...m, mediaType: 'video' }))
        ];
        
        // Create thumbnail preview grid that opens gallery
        if (mediaItems.length > 0) {
            const imageUrls = images.map(i => i.url);
            const videoUrls = videos.map(v => v.url);
            const allMediaJson = JSON.stringify(mediaItems);
            
            // Grid classes based on count
            const gridClass = mediaItems.length === 1 ? 'single' : 
                              mediaItems.length === 2 ? 'double' : 
                              mediaItems.length <= 4 ? 'quad' : 'multi';
            
            html += `<div class="media-preview-grid ${gridClass}" onclick='openMediaGallery(${allMediaJson}, 0)'>`;
            
            // Show up to 4 preview items
            const previewItems = mediaItems.slice(0, 4);
            previewItems.forEach((item, index) => {
                const escapedUrl = escapeHtml(item.url);
                const isVideo = item.mediaType === 'video';
                const moreCount = mediaItems.length - 4;
                
                html += `<div class="preview-item ${index === 3 && moreCount > 0 ? 'has-more' : ''}">`;
                
                if (isVideo) {
                    html += `
                        <div class="video-preview-thumb">
                            <video src="${escapedUrl}" muted preload="metadata"></video>
                            <div class="video-play-icon"><i class="bi bi-play-circle-fill"></i></div>
                        </div>`;
                } else {
                    html += `<img src="${escapedUrl}" alt="Preview" loading="lazy">`;
                }
                
                if (index === 3 && moreCount > 0) {
                    html += `<div class="more-overlay">+${moreCount}</div>`;
                }
                
                html += `<div class="preview-hover-overlay"><i class="bi bi-zoom-in"></i></div>`;
                html += `</div>`;
            });
            
            html += '</div>';
        }
        
        // Render downloadable files (not images/videos which are in gallery)
        if (files.length > 0) {
            html += '<div class=\"list-group list-group-flush mt-3\">';
            files.forEach(file => {
                const icon = getFileIcon(file.filename);
                const escapedUrl = escapeHtml(file.url);
                const escapedFilename = escapeHtml(file.filename);
                html += `
                    <a href="${escapedUrl}" class="list-group-item list-group-item-action" download>
                        <i class="bi ${icon} me-2"></i>${escapedFilename}
                        <i class="bi bi-download float-end"></i>
                    </a>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }
    
    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'bi-file-pdf text-danger',
            'doc': 'bi-file-word text-primary',
            'docx': 'bi-file-word text-primary',
            'txt': 'bi-file-text',
            'zip': 'bi-file-zip text-warning'
        };
        return iconMap[ext] || 'bi-file-earmark';
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Gallery navigation state
    let currentGalleryMedia = [];
    let currentMediaIndex = 0;
    
    // Open media gallery with images and videos
    window.openMediaGallery = function(mediaItems, startIndex = 0) {
        currentGalleryMedia = mediaItems;
        currentMediaIndex = startIndex;
        
        // Build thumbnails
        buildGalleryThumbnails();
        showCurrentMedia();
        
        const lightboxModal = new bootstrap.Modal(document.getElementById('imageLightbox'));
        lightboxModal.show();
    };
    
    // Legacy function for backward compatibility
    window.openGallery = function(imageUrls, startIndex = 0) {
        const mediaItems = imageUrls.map(url => ({ url, mediaType: 'image' }));
        openMediaGallery(mediaItems, startIndex);
    };
    
    window.openLightbox = function(imageUrl) {
        openMediaGallery([{ url: imageUrl, mediaType: 'image' }], 0);
    };
    
    // Build thumbnail strip
    function buildGalleryThumbnails() {
        const container = document.getElementById('galleryThumbnails');
        if (!container) return;
        
        container.innerHTML = '';
        
        currentGalleryMedia.forEach((media, index) => {
            const thumb = document.createElement('div');
            thumb.className = `gallery-thumb ${index === currentMediaIndex ? 'active' : ''}`;
            thumb.onclick = () => goToMedia(index);
            
            if (media.mediaType === 'video') {
                thumb.innerHTML = `
                    <div class="thumb-video">
                        <i class="bi bi-play-circle-fill"></i>
                    </div>`;
            } else {
                thumb.innerHTML = `<img src="${escapeHtml(media.url)}" alt="Thumbnail">`;
            }
            
            container.appendChild(thumb);
        });
    }
    
    // Show current media item
    function showCurrentMedia() {
        const media = currentGalleryMedia[currentMediaIndex];
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxVideo = document.getElementById('lightboxVideo');
        const lightboxVideoSource = document.getElementById('lightboxVideoSource');
        const imageCounter = document.getElementById('imageCounter');
        const prevBtn = document.getElementById('lightboxPrevBtn');
        const nextBtn = document.getElementById('lightboxNextBtn');
        
        // Pause any playing video
        if (lightboxVideo) {
            lightboxVideo.pause();
        }
        
        if (media.mediaType === 'video') {
            lightboxImage.style.display = 'none';
            lightboxVideo.style.display = 'block';
            lightboxVideoSource.src = media.url;
            lightboxVideo.load();
            // Enable native fullscreen controls
            lightboxVideo.setAttribute('controlsList', 'nodownload');
            lightboxVideo.setAttribute('disablePictureInPicture', 'false');
        } else {
            lightboxVideo.style.display = 'none';
            lightboxImage.style.display = 'block';
            lightboxImage.src = media.url;
        }
        
        // Update counter
        if (imageCounter) {
            const typeIcon = media.mediaType === 'video' ? '<i class="bi bi-camera-video me-2"></i>' : '<i class="bi bi-image me-2"></i>';
            imageCounter.innerHTML = `${typeIcon}${currentMediaIndex + 1} / ${currentGalleryMedia.length}`;
        }
        
        // Show/hide navigation buttons
        if (prevBtn && nextBtn) {
            const showNav = currentGalleryMedia.length > 1;
            prevBtn.style.display = showNav ? 'flex' : 'none';
            nextBtn.style.display = showNav ? 'flex' : 'none';
        }
        
        // Update active thumbnail
        document.querySelectorAll('.gallery-thumb').forEach((thumb, idx) => {
            thumb.classList.toggle('active', idx === currentMediaIndex);
        });
    }
    
    // Navigate to specific media
    function goToMedia(index) {
        currentMediaIndex = index;
        showCurrentMedia();
    }
    
    // Navigate to previous media
    window.previousMedia = function() {
        currentMediaIndex = (currentMediaIndex - 1 + currentGalleryMedia.length) % currentGalleryMedia.length;
        showCurrentMedia();
    };
    
    // Navigate to next media
    window.nextMedia = function() {
        currentMediaIndex = (currentMediaIndex + 1) % currentGalleryMedia.length;
        showCurrentMedia();
    };
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageLightbox');
        if (modal && modal.classList.contains('show')) {
            if (e.key === 'ArrowLeft') previousMedia();
            if (e.key === 'ArrowRight') nextMedia();
            if (e.key === 'Escape') {
                const lightboxModal = bootstrap.Modal.getInstance(modal);
                if (lightboxModal) lightboxModal.hide();
            }
        }
    });
    
    // Initialize inline video player for single video cards
    window.initInlineVideoPlayer = function(videoId) {
        const video = document.getElementById(videoId);
        if (!video) return;
        
        const overlay = document.getElementById(videoId + '-overlay');
        const controls = document.getElementById(videoId + '-controls');
        const playPauseBtn = document.getElementById(videoId + '-playPause');
        const playIcon = document.getElementById(videoId + '-playIcon');
        const progressBar = document.getElementById(videoId + '-progressBar');
        const progress = document.getElementById(videoId + '-progress');
        const currentTimeEl = document.getElementById(videoId + '-currentTime');
        const durationEl = document.getElementById(videoId + '-duration');
        const fullscreenBtn = document.getElementById(videoId + '-fullscreen');
        const container = video.closest('.video-container-inline');
        
        // Format time
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Show duration when metadata loaded
        video.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(video.duration);
        });
        
        // Update progress
        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progress.style.width = percent + '%';
            currentTimeEl.textContent = formatTime(video.currentTime);
        });
        
        // Play/Pause toggle
        function togglePlay() {
            if (video.paused) {
                video.play();
                playIcon.className = 'bi bi-pause-fill';
                overlay.style.display = 'none';
            } else {
                video.pause();
                playIcon.className = 'bi bi-play-fill';
            }
        }
        
        playPauseBtn.addEventListener('click', togglePlay);
        overlay.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);
        
        // Hover to autoplay
        container.addEventListener('mouseenter', () => {
            if (video.paused) {
                video.play();
                playIcon.className = 'bi bi-pause-fill';
                overlay.style.display = 'none';
            }
        });
        
        // Progress bar seek
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            video.currentTime = percent * video.duration;
        });
        
        // Fullscreen
        fullscreenBtn.addEventListener('click', () => {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            }
        });
        
        // Show controls on hover
        container.addEventListener('mouseenter', () => {
            controls.style.opacity = '1';
        });
        
        container.addEventListener('mouseleave', () => {
            if (!video.paused) {
                controls.style.opacity = '0';
            }
        });
        
        // Video ended
        video.addEventListener('ended', () => {
            playIcon.className = 'bi bi-play-fill';
            overlay.style.display = 'flex';
        });
    };
    
    // Load content when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContent);
    } else {
        loadContent();
    }
})();
