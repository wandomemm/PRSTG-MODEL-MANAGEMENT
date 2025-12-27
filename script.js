// Global variables
let models = [];
let currentModelId = null;
let editMode = false;
let currentImageIndex = 0;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadModels();
    initializePage();
});

// Load models from localStorage
function loadModels() {
    const saved = localStorage.getItem('prestige_models');
    if (saved) {
        models = JSON.parse(saved);
        updateStats();
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            displayModels();
        } else if (window.location.pathname.includes('model-detail.html')) {
            loadModelDetail();
        }
    } else {
        // Load sample data if none exists
        loadSampleData();
    }
}

// Save models to localStorage
function saveModels() {
    localStorage.setItem('prestige_models', JSON.stringify(models));
    updateStats();
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        displayModels();
    }
    showNotification('Data saved successfully!');
}

// Update statistics
function updateStats() {
    const total = models.length;
    const women = models.filter(m => m.category?.toLowerCase().includes('women')).length;
    const men = models.filter(m => m.category?.toLowerCase().includes('men')).length;
    const newFaces = models.filter(m => m.category?.toLowerCase().includes('new')).length;
    
    document.getElementById('totalModels')?.textContent = total;
    document.getElementById('womenModels')?.textContent = women;
    document.getElementById('menModels')?.textContent = men;
    document.getElementById('newModels')?.textContent = newFaces;
}

// Display models on homepage
function displayModels(filter = 'all') {
    const grid = document.getElementById('modelGrid');
    if (!grid) return;
    
    let filteredModels = models;
    
    if (filter !== 'all') {
        filteredModels = models.filter(model => 
            model.category?.toLowerCase().includes(filter)
        );
    }
    
    if (filteredModels.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" id="emptyState">
                <i class="fas fa-users fa-3x"></i>
                <h3>No Models Found</h3>
                <p>No models match your filter criteria</p>
                <button onclick="filterModels('all')" class="cta-btn">
                    <i class="fas fa-eye"></i> Show All Models
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredModels.map(model => `
        <div class="model-card" data-id="${model.id}">
            <img src="${model.profileImage || 'https://via.placeholder.com/300x400?text=No+Image'}" 
                 alt="${model.name}" class="model-image">
            <div class="model-info">
                <h3 class="model-name">${model.name}</h3>
                <div class="model-category">${model.category || 'Uncategorized'}</div>
                <div class="model-stats">
                    <span><i class="fas fa-camera"></i> ${model.images?.length || 0} photos</span>
                    <span><i class="fas fa-file-alt"></i> ${model.documents?.length || 0} docs</span>
                </div>
                <div class="model-actions">
                    <button onclick="viewModel('${model.id}')" class="action-btn view-btn-card">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button onclick="editModel('${model.id}')" class="action-btn edit-btn-card">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteModel('${model.id}')" class="action-btn delete-btn-card">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter models
function filterModels(category) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayModels(category);
}

// Search models
function searchModels() {
    const searchTerm = document.getElementById('modelSearch').value.toLowerCase();
    if (!searchTerm) {
        displayModels('all');
        return;
    }
    
    const filtered = models.filter(model => 
        model.name.toLowerCase().includes(searchTerm) ||
        model.category?.toLowerCase().includes(searchTerm) ||
        model.description?.toLowerCase().includes(searchTerm)
    );
    
    const grid = document.getElementById('modelGrid');
    grid.innerHTML = filtered.map(model => `
        <div class="model-card">
            <img src="${model.profileImage || 'https://via.placeholder.com/300x400'}" 
                 alt="${model.name}" class="model-image">
            <div class="model-info">
                <h3 class="model-name">${model.name}</h3>
                <div class="model-category">${model.category}</div>
                <div class="model-stats">
                    <span><i class="fas fa-camera"></i> ${model.images?.length || 0} photos</span>
                    <span><i class="fas fa-file-alt"></i> ${model.documents?.length || 0} docs</span>
                </div>
                <div class="model-actions">
                    <button onclick="viewModel('${model.id}')" class="action-btn">View</button>
                    <button onclick="editModel('${model.id}')" class="action-btn">Edit</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add new model
function addNewModel() {
    const name = document.getElementById('modelName').value;
    const category = document.getElementById('modelCategory').value;
    const description = document.getElementById('modelDescription').value;
    
    if (!name) {
        alert('Please enter model name');
        return;
    }
    
    const newModel = {
        id: Date.now().toString(),
        name: name,
        category: category || 'Uncategorized',
        description: description || 'No description available.',
        images: [],
        documents: [],
        measurements: {
            height: '178 cm',
            bust: '86 cm',
            waist: '61 cm',
            hips: '89 cm',
            shoes: 'EU 39',
            eyes: 'Blue',
            hair: 'Blonde'
        },
        details: {
            age: '24',
            nationality: 'French',
            basedIn: 'Paris, FR',
            availability: 'Available',
            experience: '3 years'
        },
        internalNotes: 'Add internal notes here...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Handle profile image
    const profileInput = document.getElementById('profileImage');
    if (profileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newModel.profileImage = e.target.result;
            models.push(newModel);
            saveModels();
            clearForm();
        };
        reader.readAsDataURL(profileInput.files[0]);
    } else {
        newModel.profileImage = 'https://via.placeholder.com/300x400?text=No+Image';
        models.push(newModel);
        saveModels();
        clearForm();
    }
    
    // Handle additional images
    const imagesInput = document.getElementById('modelImages');
    if (imagesInput.files.length > 0) {
        Array.from(imagesInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                newModel.images.push(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Handle documents
    const docsInput = document.getElementById('modelDocuments');
    if (docsInput.files.length > 0) {
        Array.from(docsInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                newModel.documents.push({
                    name: file.name,
                    type: file.type,
                    size: formatFileSize(file.size),
                    data: e.target.result,
                    uploaded: new Date().toISOString()
                });
            };
            reader.readAsDataURL(file);
        });
    }
    
    showNotification('Model added successfully!');
}

// Clear form after submission
function clearForm() {
    document.getElementById('modelName').value = '';
    document.getElementById('modelCategory').value = '';
    document.getElementById('modelDescription').value = '';
    document.getElementById('profileImage').value = '';
    document.getElementById('modelImages').value = '';
    document.getElementById('modelDocuments').value = '';
    document.getElementById('profilePreview').innerHTML = '';
    document.getElementById('imagesPreview').innerHTML = '';
    document.getElementById('documentsPreview').innerHTML = '';
}

// View model details
function viewModel(id) {
    window.location.href = `model-detail.html?id=${id}`;
}

// Edit model (opens detail page in edit mode)
function editModel(id) {
    window.location.href = `model-detail.html?id=${id}&edit=true`;
}

// Delete model
function deleteModel(id) {
    if (confirm('Are you sure you want to delete this model?')) {
        models = models.filter(model => model.id !== id);
        saveModels();
        showNotification('Model deleted successfully!');
    }
}

// Load model detail page
function loadModelDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const edit = urlParams.get('edit') === 'true';
    
    if (!id) {
        window.location.href = 'index.html';
        return;
    }
    
    const model = models.find(m => m.id === id);
    if (!model) {
        window.location.href = 'index.html';
        return;
    }
    
    currentModelId = id;
    
    // Set page title
    document.title = `${model.name} | Prèstige`;
    document.getElementById('pageTitle').textContent = `${model.name} | Prèstige`;
    
    // Update display
    document.getElementById('modelNameDisplay').textContent = model.name;
    document.getElementById('modelCategoryDisplay').textContent = model.category || 'Uncategorized';
    document.getElementById('modelDescription').innerHTML = model.description || 'No description available.';
    document.getElementById('imageCount').textContent = model.images?.length || 0;
    document.getElementById('documentCount').textContent = model.documents?.length || 0;
    document.getElementById('modelIdDisplay').textContent = model.id;
    document.getElementById('lastUpdated').textContent = new Date(model.updatedAt).toLocaleDateString();
    
    // Set main image
    const mainImage = document.getElementById('mainModelImage');
    if (model.profileImage) {
        mainImage.src = model.profileImage;
    }
    
    // Load gallery
    loadImageGallery(model.images || []);
    
    // Load documents
    loadDocuments(model.documents || []);
    
    // Set measurements
    if (model.measurements) {
        const measurementsDiv = document.getElementById('measurements');
        measurementsDiv.innerHTML = Object.entries(model.measurements).map(([key, value]) => `
            <div class="measurement-item">
                <span class="label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                <span class="value">${value}</span>
            </div>
        `).join('');
    }
    
    // Set details
    if (model.details) {
        const detailsDiv = document.getElementById('additionalDetails');
        detailsDiv.innerHTML = Object.entries(model.details).map(([key, value]) => `
            <div class="detail-item">
                <span class="label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                <span class="value ${key === 'availability' && value === 'Available' ? 'available' : ''}">${value}</span>
            </div>
        `).join('');
    }
    
    // Set internal notes
    if (model.internalNotes) {
        document.getElementById('internalNotes').innerHTML = model.internalNotes;
    }
    
    // Enable edit mode if requested
    if (edit) {
        toggleEditMode(true);
    }
}

// Load image gallery
function loadImageGallery(images) {
    const gallery = document.getElementById('imageGallery');
    if (!gallery) return;
    
    if (images.length === 0) {
        gallery.innerHTML = '<p>No images available</p>';
        return;
    }
    
    gallery.innerHTML = images.map((img, index) => `
        <img src="${img}" alt="Model image ${index + 1}" 
             class="gallery-thumb ${index === 0 ? 'active' : ''}"
             onclick="changeMainImage(${index})">
    `).join('');
    
    updateImageCounter();
}

// Change main image
function changeMainImage(index) {
    const model = models.find(m => m.id === currentModelId);
    if (!model || !model.images || !model.images[index]) return;
    
    document.getElementById('mainModelImage').src = model.images[index];
    currentImageIndex = index;
    
    // Update active thumbnail
    document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    updateImageCounter();
}

// Navigate images
function nextImage() {
    const model = models.find(m => m.id === currentModelId);
    if (!model || !model.images) return;
    
    currentImageIndex = (currentImageIndex + 1) % model.images.length;
    changeMainImage(currentImageIndex);
}

function prevImage() {
    const model = models.find(m => m.id === currentModelId);
    if (!model || !model.images) return;
    
    currentImageIndex = (currentImageIndex - 1 + model.images.length) % model.images.length;
    changeMainImage(currentImageIndex);
}

function updateImageCounter() {
    const model = models.find(m => m.id === currentModelId);
    if (!model || !model.images) return;
    
    document.getElementById('imageCounter').textContent = 
        `${currentImageIndex + 1} / ${model.images.length}`;
}

// Load documents
function loadDocuments(documents) {
    const list = document.getElementById('documentsList');
    if (!list) return;
    
    if (documents.length === 0) {
        list.innerHTML = `
            <div class="empty-docs">
                <i class="fas fa-file-import fa-2x"></i>
                <p>No documents uploaded yet</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = documents.map((doc, index) => `
        <div class="document-item">
            <div class="doc-info">
                <i class="fas fa-file-pdf doc-icon"></i>
                <div>
                    <div class="doc-name">${doc.name}</div>
                    <div class="doc-size">${doc.size} • ${new Date(doc.uploaded).toLocaleDateString()}</div>
                </div>
            </div>
            <div class="doc-actions">
                <button onclick="downloadDocument(${index})" class="doc-btn download-btn">
                    <i class="fas fa-download"></i> Download
                </button>
                <button onclick="viewDocument(${index})" class="doc-btn view-btn-doc">
                    <i class="fas fa-eye"></i> View
                </button>
                <button onclick="deleteDocument(${index})" class="doc-btn delete-btn-doc">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Document functions
function downloadDocument(index) {
    const model = models.find(m => m.id === currentModelId);
    if (!model || !model.documents || !model.documents[index]) return;
    
    const doc = model.documents[index];
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function viewDocument(index) {
    const model = models.find(m => m.id === currentModelId);
    if (!model || !model.documents || !model.documents[index]) return;
    
    const doc = model.documents[index];
    window.open(doc.data, '_blank');
}

function deleteDocument(index) {
    if (!confirm('Delete this document?')) return;
    
    const modelIndex = models.findIndex(m => m.id === currentModelId);
    if (modelIndex === -1) return;
    
    models[modelIndex].documents.splice(index, 1);
    models[modelIndex].updatedAt = new Date().toISOString();
    saveModels();
    loadDocuments(models[modelIndex].documents);
    showNotification('Document deleted!');
}

// Edit mode functions
function toggleEditMode(forceState = null) {
    editMode = forceState !== null ? forceState : !editMode;
    
    const editBar = document.getElementById('editModeBar');
    const addImages = document.getElementById('addImagesSection');
    const uploadDocs = document.getElementById('uploadDocuments');
    
    if (editMode) {
        editBar.style.display = 'block';
        if (addImages) addImages.style.display = 'block';
        if (uploadDocs) uploadDocs.style.display = 'block';
        
        // Enable content editing
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.setAttribute('contenteditable', 'true');
        });
    } else {
        editBar.style.display = 'none';
        if (addImages) addImages.style.display = 'none';
        if (uploadDocs) uploadDocs.style.display = 'none';
        
        // Disable content editing
        document.querySelectorAll('[contenteditable]').forEach(el => {
            el.setAttribute('contenteditable', 'false');
        });
    }
}

function enableEdit(elementId) {
    if (!editMode) {
        toggleEditMode(true);
    }
    
    const element = document.getElementById(elementId);
    if (element) {
        element.focus();
    }
}

function saveModelEdits() {
    const modelIndex = models.findIndex(m => m.id === currentModelId);
    if (modelIndex === -1) return;
    
    // Update model data from editable fields
    models[modelIndex].name = document.getElementById('modelNameDisplay').textContent;
    models[modelIndex].description = document.getElementById('modelDescription').innerHTML;
    models[modelIndex].internalNotes = document.getElementById('internalNotes').innerHTML;
    models[modelIndex].updatedAt = new Date().toISOString();
    
    // Update measurements
    const measurementItems = document.querySelectorAll('#measurements .measurement-item');
    if (measurementItems.length > 0) {
        models[modelIndex].measurements = {};
        measurementItems.forEach(item => {
            const label = item.querySelector('.label').textContent.replace(':', '').toLowerCase();
            const value = item.querySelector('.value').textContent;
            models[modelIndex].measurements[label] = value;
        });
    }
    
    // Update details
    const detailItems = document.querySelectorAll('#additionalDetails .detail-item');
    if (detailItems.length > 0) {
        models[modelIndex].details = {};
        detailItems.forEach(item => {
            const label = item.querySelector('.label').textContent.replace(':', '').toLowerCase();
            const value = item.querySelector('.value').textContent;
            models[modelIndex].details[label] = value;
        });
    }
    
    saveModels();
    showNotification('Changes saved successfully!');
    toggleEditMode(false);
}

function discardEdits() {
    if (confirm('Discard all changes?')) {
        loadModelDetail(); // Reload original data
        toggleEditMode(false);
    }
}

function deleteCurrentModel() {
    if (confirm('Permanently delete this model?')) {
        models = models.filter(m => m.id !== currentModelId);
        saveModels();
        showNotification('Model deleted!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Add documents
function addDocument() {
    if (!editMode) {
        toggleEditMode(true);
    }
    document.getElementById('documentUpload').click();
}

function uploadDocuments() {
    const input = document.getElementById('documentUpload');
    const modelIndex = models.findIndex(m => m.id === currentModelId);
    if (modelIndex === -1 || !input.files.length) return;
    
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            models[modelIndex].documents.push({
                name: file.name,
                type: file.type,
                size: formatFileSize(file.size),
                data: e.target.result,
                uploaded: new Date().toISOString()
            });
            
            models[modelIndex].updatedAt = new Date().toISOString();
            saveModels();
            loadDocuments(models[modelIndex].documents);
        };
        reader.readAsDataURL(file);
    });
    
    input.value = '';
    document.getElementById('docPreview').innerHTML = '';
    showNotification('Documents uploaded!');
}

// Add images
function previewNewImages(event) {
    const preview = document.getElementById('newImagesPreview');
    preview.innerHTML = '';
    
    Array.from(event.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '4px';
            img.style.margin = '5px';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function uploadNewImages() {
    const input = document.getElementById('addMoreImages');
    const modelIndex = models.findIndex(m => m.id === currentModelId);
    if (modelIndex === -1 || !input.files.length) return;
    
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            models[modelIndex].images.push(e.target.result);
            models[modelIndex].updatedAt = new Date().toISOString();
            saveModels();
            loadImageGallery(models[modelIndex].images);
        };
        reader.readAsDataURL(file);
    });
    
    input.value = '';
    document.getElementById('newImagesPreview').innerHTML = '';
    showNotification('Images uploaded!');
}

// Admin panel functions
function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.style.display = searchBar.style.display === 'block' ? 'none' : 'block';
    if (searchBar.style.display === 'block') {
        document.getElementById('modelSearch').focus();
    }
}

function clearSearch() {
    document.getElementById('modelSearch').value = '';
    searchModels();
}

// Sample data
function loadSampleData() {
    models = [
        {
            id: '1',
            name: 'Isabella Rossi',
            category: 'Women Exclusive',
            description: 'Italian top model with 5+ years experience in high fashion. Specializes in runway and editorial work.',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
            images: [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop'
            ],
            documents: [
                {
                    name: 'Contract_2025.pdf',
                    type: 'application/pdf',
                    size: '2.4 MB',
                    data: '#',
                    uploaded: '2025-01-15'
                }
            ],
            measurements: {
                height: '178 cm',
                bust: '86 cm',
                waist: '61 cm',
                hips: '89 cm',
                shoes: 'EU 39',
                eyes: 'Brown',
                hair: 'Brunette'
            },
            details: {
                age: '25',
                nationality: 'Italian',
                basedIn: 'Milan, IT',
                availability: 'Available',
                experience: '5 years'
            },
            internalNotes: 'Excellent runway walk. Speaks Italian, English, French.',
            createdAt: '2024-11-15',
            updatedAt: '2025-01-20'
        },
        {
            id: '2',
            name: 'Alexander Chen',
            category: 'Men',
            description: 'Asian-American model known for commercial and fashion campaigns.',
            profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop',
            images: [
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop'
            ],
            documents: [],
            measurements: {
                height: '185 cm',
                chest: '98 cm',
                waist: '81 cm',
                hips: '93 cm',
                shoes: 'EU 44',
                eyes: 'Black',
                hair: 'Black'
            },
            details: {
                age: '28',
                nationality: 'American',
                basedIn: 'New York, US',
                availability: 'Booked until Feb',
                experience: '7 years'
            },
            internalNotes: 'Great for commercial work. Easy to work with.',
            createdAt: '2024-10-10',
            updatedAt: '2025-01-18'
        },
        {
            id: '3',
            name: 'Sophie Laurent',
            category: 'New Faces',
            description: 'French newcomer with unique look. Recent fashion week debut.',
            profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=400&fit=crop',
            images: [
                'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop'
            ],
            documents: [
                {
                    name: 'Portfolio.pdf',
                    type: 'application/pdf',
                    size: '5.1 MB',
                    data: '#',
                    uploaded: '2025-01-10'
                },
                {
                    name: 'Measurements.doc',
                    type: 'application/msword',
                    size: '1.2 MB',
                    data: '#',
                    uploaded: '2025-01-10'
                }
            ],
            measurements: {
                height: '175 cm',
                bust: '84 cm',
                waist: '60 cm',
                hips: '88 cm',
                shoes: 'EU 38',
                eyes: 'Green',
                hair: 'Blonde'
            },
            details: {
                age: '19',
                nationality: 'French',
                basedIn: 'Paris, FR',
                availability: 'Available',
                experience: '6 months'
            },
            internalNotes: 'Promising new talent. Needs runway coaching.',
            createdAt: '2025-01-05',
            updatedAt: '2025-01-19'
        }
    ];
    
    saveModels();
    showNotification('Sample data loaded!');
}

// Export/Import functions
function exportData() {
    const dataStr = JSON.stringify(models, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `prestige-models-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function importData() {
    document.getElementById('importFile').click();
}

document.getElementById('importFile')?.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                models = imported;
                saveModels();
                showNotification('Data imported successfully!');
                window.location.reload();
            } else {
                alert('Invalid data format');
            }
        } catch (err) {
            alert('Error reading file');
        }
    };
    reader.readAsText(file);
});

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 25px;
                background: #4CAF50;
                color: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            .notification.error { background: #F44336; }
            .notification.warning { background: #FF9800; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('active');
}

function changeView(view) {
    const grid = document.getElementById('modelGrid');
    const buttons = document.querySelectorAll('.view-btn');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (view === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

function shareModel() {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out this model from Prèstige',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!');
    }
}

function saveAllData() {
    saveModels();
}

// Initialize page based on URL
function initializePage() {
    if (window.location.pathname.includes('model-detail.html')) {
        // Already handled by loadModelDetail
    } else {
        displayModels();
    }
}

// Close modal
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}
