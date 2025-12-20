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
            
            const contentSection = document.getElementById('content');
            if (!contentSection) {
                console.error('Content section not found');
                return;
            }
            
            const container = contentSection.querySelector('.row.g-4');
            if (!container) {
                console.error('Content container not found');
                return;
            }
            
            // Clear existing dynamic content (keep static content if needed)
            // Insert dynamic content at the beginning
            content.forEach(item => {
                const card = createContentCard(item);
                container.insertBefore(card, container.firstChild);
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
        col.className = 'col-lg-6';
        
        const card = document.createElement('div');
        card.className = 'card h-100 shadow-sm';
        
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
        
        // Render images in a responsive gallery grid
        if (images.length > 0) {
            html += '<div class="image-gallery mb-3">';
            images.forEach((img, index) => {
                const escapedUrl = escapeHtml(img.url);
                const escapedFilename = escapeHtml(img.filename || 'Image');
                // Determine column size based on number of images
                let colClass = 'col-12';
                if (images.length === 2) colClass = 'col-md-6';
                else if (images.length === 3) colClass = 'col-md-4';
                else if (images.length >= 4) colClass = 'col-6 col-md-4 col-lg-3';
                
                html += `
                    <div class="${colClass} gallery-item" data-index="${index}">
                        <div class="gallery-image-wrapper">
                            <img src="${escapedUrl}" 
                                 class="img-fluid rounded gallery-image" 
                                 alt="${escapedFilename}" 
                                 onclick="openGallery(${JSON.stringify(images.map(i => i.url))}, ${index})"
                                 loading="lazy">
                            <div class="gallery-overlay">
                                <i class="bi bi-zoom-in"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Render videos with proper escaping
        if (videos.length > 0) {
            videos.forEach(video => {
                const escapedUrl = escapeHtml(video.url);
                html += `
                    <div class="mb-3">
                        <video controls class="w-100 rounded">
                            <source src="${escapedUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            });
        }
        
        // Render files with proper escaping
        if (files.length > 0) {
            html += '<div class="list-group list-group-flush">';
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
    let currentGalleryImages = [];
    let currentImageIndex = 0;
    
    // Open gallery with navigation
    window.openGallery = function(imageUrls, startIndex = 0) {
        currentGalleryImages = imageUrls;
        currentImageIndex = startIndex;
        showGalleryImage();
        
        const lightboxModal = new bootstrap.Modal(document.getElementById('imageLightbox'));
        lightboxModal.show();
    };
    
    // Show current image in gallery
    function showGalleryImage() {
        const lightboxImage = document.getElementById('lightboxImage');
        const imageCounter = document.getElementById('imageCounter');
        const prevBtn = document.getElementById('lightboxPrevBtn');
        const nextBtn = document.getElementById('lightboxNextBtn');
        
        lightboxImage.src = currentGalleryImages[currentImageIndex];
        
        if (imageCounter) {
            imageCounter.textContent = `${currentImageIndex + 1} / ${currentGalleryImages.length}`;
        }
        
        // Show/hide navigation buttons
        if (prevBtn && nextBtn) {
            prevBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
            nextBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
        }
    }
    
    // Navigate to previous image
    window.previousImage = function() {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        showGalleryImage();
    };
    
    // Navigate to next image
    window.nextImage = function() {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        showGalleryImage();
    };
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageLightbox');
        if (modal && modal.classList.contains('show')) {
            if (e.key === 'ArrowLeft') previousImage();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'Escape') {
                const lightboxModal = bootstrap.Modal.getInstance(modal);
                if (lightboxModal) lightboxModal.hide();
            }
        }
    });
    
    // Legacy function for backward compatibility
    window.openLightbox = function(imageUrl) {
        openGallery([imageUrl], 0);
    };
    
    // Load content when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContent);
    } else {
        loadContent();
    }
})();
