/**
 * Content Loader for Srisin Family Website
 * Dynamically loads and displays content from the admin panel
 */

(function() {
    'use strict';

    // Load and display content on page load
    async function loadContent() {
        try {
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
                container.insertAdjacentHTML('afterbegin', card);
            });
            
        } catch (error) {
            console.error('Failed to load content:', error);
        }
    }
    
    function createContentCard(item) {
        const tagClass = getTagClass(item.tag);
        const mediaHtml = item.media && item.media.length > 0 ? renderMedia(item.media) : '';
        
        return `
            <div class="col-lg-6">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="badge ${tagClass}">
                                <i class="bi bi-tag me-1"></i>${item.tag}
                            </span>
                            <span class="text-muted small">
                                <i class="bi bi-calendar3 me-1"></i>${item.date}
                            </span>
                        </div>
                        
                        <h4 class="card-title mb-3">${escapeHtml(item.title)}</h4>
                        
                        <div class="card-text">
                            ${item.body}
                        </div>
                        
                        ${mediaHtml}
                    </div>
                </div>
            </div>
        `;
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
        
        // Render images
        if (images.length > 0) {
            html += '<div class="row g-2 mb-3">';
            images.forEach(img => {
                html += `
                    <div class="col-md-${images.length === 1 ? '12' : '6'}">
                        <img src="${img.url}" class="img-fluid rounded" alt="${img.filename}">
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Render videos
        if (videos.length > 0) {
            videos.forEach(video => {
                html += `
                    <div class="mb-3">
                        <video controls class="w-100 rounded">
                            <source src="${video.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            });
        }
        
        // Render files
        if (files.length > 0) {
            html += '<div class="list-group list-group-flush">';
            files.forEach(file => {
                const icon = getFileIcon(file.filename);
                html += `
                    <a href="${file.url}" class="list-group-item list-group-item-action" download>
                        <i class="bi ${icon} me-2"></i>${file.filename}
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
    
    // Load content when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadContent);
    } else {
        loadContent();
    }
})();
