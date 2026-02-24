// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSecretCatMode();
    loadStoredData();
});

// Navigation between sections
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Updates functionality
function addUpdate() {
    const title = document.getElementById('update-title').value;
    const content = document.getElementById('update-content').value;
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    const updateItem = createUpdateElement(title, content, new Date());
    const container = document.getElementById('updates-container');
    container.insertBefore(updateItem, container.firstChild);
    
    // Clear form
    document.getElementById('update-title').value = '';
    document.getElementById('update-content').value = '';
    
    // Save to localStorage
    saveUpdates();
    
    showNotification('Update posted successfully!');
}

function createUpdateElement(title, content, date) {
    const div = document.createElement('div');
    div.className = 'update-item';
    
    const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    div.innerHTML = `
        <div class="update-header">
            <h3>${escapeHtml(title)}</h3>
            <span class="update-date">${dateStr}</span>
        </div>
        <p>${escapeHtml(content)}</p>
    `;
    
    return div;
}

// File upload functionality
function uploadFiles() {
    const fileInput = document.getElementById('file-input');
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Please select files to upload');
        return;
    }
    
    const container = document.getElementById('files-container');
    
    for (let file of files) {
        const fileItem = createFileElement(file.name, new Date());
        container.appendChild(fileItem);
    }
    
    fileInput.value = '';
    saveFiles();
    showNotification(`${files.length} file(s) uploaded successfully!`);
}

function createFileElement(fileName, date) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    const icon = getFileIcon(fileName);
    
    div.innerHTML = `
        <span class="file-icon">${icon}</span>
        <span class="file-name">${escapeHtml(fileName)}</span>
        <span class="file-date">${dateStr}</span>
    `;
    
    return div;
}

function getFileIcon(fileName) {
    const parts = fileName.split('.');
    // Handle files without extensions or hidden files
    if (parts.length === 1 || (parts.length === 2 && parts[0] === '')) {
        return '📄';
    }
    const ext = parts.pop().toLowerCase();
    const iconMap = {
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'ppt': '📽️',
        'pptx': '📽️',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'zip': '📦',
        'rar': '📦',
        'txt': '📄'
    };
    return iconMap[ext] || '📄';
}

// Private section authentication
function authenticatePrivate() {
    const password = document.getElementById('private-password').value;
    
    // Simple password check for demo purposes (in production, this would be server-side)
    // Note: This is intentionally a simple demonstration and not meant for real security
    if (password === 'abct2026') {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('private-content').style.display = 'block';
        showNotification('Access granted!');
    } else {
        alert('Incorrect password. Please try again.');
    }
}

function saveNotes() {
    const notes = document.getElementById('collaboration-notes').value;
    localStorage.setItem('collaboration-notes', notes);
    showNotification('Notes saved successfully!');
}

// Secret Cat Mode
// Activated by pressing keys: c-a-t in sequence
let catKeySequence = [];
const secretSequence = ['c', 'a', 't'];

function initSecretCatMode() {
    document.addEventListener('keydown', function(e) {
        catKeySequence.push(e.key.toLowerCase());
        
        // Keep only last 3 keys
        if (catKeySequence.length > 3) {
            catKeySequence.shift();
        }
        
        // Check if sequence matches
        if (catKeySequence.join('') === secretSequence.join('')) {
            activateCatMode();
            catKeySequence = []; // Reset sequence
        }
    });
}

function activateCatMode() {
    const catContainer = document.getElementById('cat-container');
    
    if (catContainer.classList.contains('active')) {
        catContainer.classList.remove('active');
        showNotification('Cat mode deactivated 😿');
    } else {
        catContainer.classList.add('active');
        showNotification('🐱 Secret cat mode activated! Watch the bottom of your screen...');
    }
}

// Local storage functions
function saveUpdates() {
    const updates = [];
    const updateItems = document.querySelectorAll('#updates-container .update-item');
    
    updateItems.forEach(item => {
        const title = item.querySelector('h3').textContent;
        const content = item.querySelector('p').textContent;
        const date = item.querySelector('.update-date').textContent;
        updates.push({ title, content, date });
    });
    
    localStorage.setItem('updates', JSON.stringify(updates));
}

function saveFiles() {
    const files = [];
    const fileItems = document.querySelectorAll('#files-container .file-item');
    
    fileItems.forEach(item => {
        const name = item.querySelector('.file-name').textContent;
        const date = item.querySelector('.file-date').textContent;
        const icon = item.querySelector('.file-icon').textContent;
        files.push({ name, date, icon });
    });
    
    localStorage.setItem('files', JSON.stringify(files));
}

function loadStoredData() {
    // Load updates
    const storedUpdates = localStorage.getItem('updates');
    if (storedUpdates) {
        const updates = JSON.parse(storedUpdates);
        const container = document.getElementById('updates-container');
        
        // Clear existing updates except the welcome message
        while (container.children.length > 1) {
            container.removeChild(container.firstChild);
        }
        
        const fragment = document.createDocumentFragment();
        updates.forEach(update => {
            if (update.title !== 'Welcome to the New Website') {
                const div = document.createElement('div');
                div.className = 'update-item';
                div.innerHTML = `
                    <div class="update-header">
                        <h3>${escapeHtml(update.title)}</h3>
                        <span class="update-date">${update.date}</span>
                    </div>
                    <p>${escapeHtml(update.content)}</p>
                `;
                fragment.insertBefore(div, fragment.firstChild);
            }
        });
        container.insertBefore(fragment, container.firstChild);
    }
    
    // Load files
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
        const files = JSON.parse(storedFiles);
        const container = document.getElementById('files-container');
        
        // Clear existing files
        while (container.children.length > 2) {
            container.removeChild(container.lastChild);
        }
        
        files.forEach(file => {
            const exists = Array.from(container.querySelectorAll('.file-name'))
                .some(el => el.textContent === file.name);
            
            if (!exists) {
                const div = document.createElement('div');
                div.className = 'file-item';
                div.innerHTML = `
                    <span class="file-icon">${file.icon}</span>
                    <span class="file-name">${escapeHtml(file.name)}</span>
                    <span class="file-date">${file.date}</span>
                `;
                container.appendChild(div);
            }
        });
    }
    
    // Load collaboration notes
    const storedNotes = localStorage.getItem('collaboration-notes');
    if (storedNotes) {
        const notesTextarea = document.getElementById('collaboration-notes');
        if (notesTextarea) {
            notesTextarea.value = storedNotes;
        }
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
