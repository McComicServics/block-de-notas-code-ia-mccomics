/**
 * Renderer.js - Main JavaScript file for Block de Notas IA
 * McComics IA Application
 */

// Global variables
let currentFile = null;
let isModified = false;
let wordCount = 0;
let aiPanelVisible = false;

// DOM Elements
const textEditor = document.getElementById('text-editor');
const fileName = document.getElementById('file-name');
const wordCountDisplay = document.getElementById('word-count');
const statusDisplay = document.getElementById('status');
const cursorPosition = document.getElementById('cursor-position');
const aiPanel = document.getElementById('ai-panel');
const aiMessages = document.getElementById('ai-messages');
const aiPrompt = document.getElementById('ai-prompt');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateStatus('Aplicación iniciada correctamente');
});

// Initialize application
function initializeApp() {
    // Focus on text editor
    textEditor.focus();
    
    // Set initial values
    updateWordCount();
    updateCursorPosition();
    
    // Add welcome message to AI panel
    addAIMessage('assistant', '¡Hola! Soy tu asistente de IA. Puedo ayudarte a corregir, resumir, expandir o traducir tu texto. ¿En qué puedo ayudarte?');
}

// Setup event listeners
function setupEventListeners() {
    // Text editor events
    textEditor.addEventListener('input', handleTextInput);
    textEditor.addEventListener('keyup', updateCursorPosition);
    textEditor.addEventListener('click', updateCursorPosition);
    textEditor.addEventListener('scroll', updateCursorPosition);
    
    // File operations
    document.getElementById('new-file').addEventListener('click', newFile);
    document.getElementById('open-file').addEventListener('click', openFile);
    document.getElementById('save-file').addEventListener('click', saveFile);
    
    // AI panel
    document.getElementById('ai-assist').addEventListener('click', toggleAIPanel);
    document.getElementById('close-ai').addEventListener('click', toggleAIPanel);
    document.getElementById('send-ai').addEventListener('click', sendAIMessage);
    aiPrompt.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendAIMessage();
        }
    });
    
    // Font size selector
    document.getElementById('font-size').addEventListener('change', changeFontSize);
    
    // Suggestion buttons
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', handleSuggestion);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window beforeunload
    window.addEventListener('beforeunload', function(e) {
        if (isModified) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// Handle text input
function handleTextInput() {
    isModified = true;
    updateWordCount();
    updateStatus('Modificado');
    
    // Auto-save every 5 seconds
    clearTimeout(window.autoSaveTimer);
    window.autoSaveTimer = setTimeout(autoSave, 5000);
}

// Update word count
function updateWordCount() {
    const text = textEditor.value.trim();
    wordCount = text === '' ? 0 : text.split(/\s+/).length;
    wordCountDisplay.textContent = `${wordCount} palabra${wordCount !== 1 ? 's' : ''}`;
}

// Update cursor position
function updateCursorPosition() {
    const cursorPos = textEditor.selectionStart;
    const textBeforeCursor = textEditor.value.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    cursorPosition.textContent = `Línea ${line}, Columna ${column}`;
}

// Update status
function updateStatus(message) {
    statusDisplay.textContent = message;
    
    // Clear status after 3 seconds
    setTimeout(() => {
        statusDisplay.textContent = 'Listo';
    }, 3000);
}

// File operations
function newFile() {
    if (isModified) {
        if (!confirm('¿Deseas guardar los cambios antes de crear un nuevo archivo?')) {
            return;
        }
        saveFile();
    }
    
    textEditor.value = '';
    currentFile = null;
    isModified = false;
    fileName.textContent = 'Sin título';
    updateStatus('Nuevo archivo creado');
    updateWordCount();
}

function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.js,.css,.html,.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                textEditor.value = e.target.result;
                currentFile = file.name;
                fileName.textContent = file.name;
                isModified = false;
                updateStatus(`Archivo abierto: ${file.name}`);
                updateWordCount();
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
}

function saveFile() {
    const content = textEditor.value;
    const filename = currentFile || 'documento.txt';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    isModified = false;
    updateStatus(`Archivo guardado: ${filename}`);
}

function autoSave() {
    if (isModified && currentFile) {
        // Simulate auto-save
        updateStatus('Guardado automático');
    }
}

// Font size change
function changeFontSize() {
    const fontSize = document.getElementById('font-size').value;
    textEditor.style.fontSize = fontSize + 'px';
    updateStatus(`Tamaño de fuente cambiado a ${fontSize}px`);
}

// AI Panel functions
function toggleAIPanel() {
    aiPanelVisible = !aiPanelVisible;
    aiPanel.style.display = aiPanelVisible ? 'block' : 'none';
    
    if (aiPanelVisible) {
        aiPrompt.focus();
        updateStatus('Panel de IA abierto');
    } else {
        textEditor.focus();
        updateStatus('Panel de IA cerrado');
    }
}

function sendAIMessage() {
    const message = aiPrompt.value.trim();
    if (message === '') return;
    
    addAIMessage('user', message);
    aiPrompt.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addAIMessage('assistant', response);
    }, 1000);
}

function addAIMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${sender === 'user' ? 'Tú' : 'IA'}:</strong>
            <p>${message}</p>
        </div>
    `;
    
    aiMessages.appendChild(messageDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;
}

function generateAIResponse(message) {
    const responses = {
        'corregir': 'He revisado tu texto y aquí están las correcciones sugeridas...',
        'resumir': 'Aquí tienes un resumen de tu texto...',
        'expandir': 'Te sugiero expandir estas ideas...',
        'traducir': 'Aquí está la traducción de tu texto...',
        'default': 'Entiendo tu consulta. ¿Podrías ser más específico sobre qué necesitas?'
    };
    
    const lowerMessage = message.toLowerCase();
    for (const key in responses) {
        if (lowerMessage.includes(key)) {
            return responses[key];
        }
    }
    
    return responses.default;
}

function handleSuggestion(e) {
    const action = e.target.dataset.action;
    const selectedText = textEditor.value.substring(
        textEditor.selectionStart,
        textEditor.selectionEnd
    ) || textEditor.value;
    
    switch (action) {
        case 'corregir':
            addAIMessage('assistant', `Correcciones para el texto: "${selectedText.substring(0, 50)}..."`);
            break;
        case 'resumir':
            addAIMessage('assistant', `Resumen del texto: "${selectedText.substring(0, 50)}..."`);
            break;
        case 'expandir':
            addAIMessage('assistant', `Ideas para expandir: "${selectedText.substring(0, 50)}..."`);
            break;
        case 'traducir':
            addAIMessage('assistant', `Traducción del texto: "${selectedText.substring(0, 50)}..."`);
            break;
    }
    
    updateStatus(`Acción de IA: ${action}`);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    if (e.ctrlKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                newFile();
                break;
            case 'o':
                e.preventDefault();
                openFile();
                break;
            case 's':
                e.preventDefault();
                saveFile();
                break;
            case 'i':
                e.preventDefault();
                toggleAIPanel();
                break;
        }
    }
    
    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
    }
}

// Fullscreen toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        updateStatus('Modo pantalla completa activado');
    } else {
        document.exitFullscreen();
        updateStatus('Modo pantalla completa desactivado');
    }
}

// Export functions for potential use
window.McComicsNotepad = {
    newFile,
    openFile,
    saveFile,
    toggleAIPanel,
    changeFontSize,
    updateStatus
};
