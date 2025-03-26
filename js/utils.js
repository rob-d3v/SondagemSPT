// Utility functions for the SPT Report Generator

// Format a date object to DD/MM/YYYY format
export function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    if (isNaN(date.getTime())) {
        return '';
    }

    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

// Parse a date string in DD/MM/YYYY format to a Date object
export function parseDate(dateString) {
    if (!dateString) return null;

    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

// Validate numeric input with specified range
export function validateNumericInput(input, min, max) {
    const value = parseFloat(input.value);

    if (isNaN(value)) {
        return false;
    }

    if (min !== undefined && value < min) {
        input.value = min;
        return false;
    }

    if (max !== undefined && value > max) {
        input.value = max;
        return false;
    }

    return true;
}

// Create an element with specified attributes and children
export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    for (const key in attributes) {
        if (key === 'style' && typeof attributes[key] === 'object') {
            Object.assign(element.style, attributes[key]);
        } else if (key === 'dataset' && typeof attributes[key] === 'object') {
            for (const dataKey in attributes[key]) {
                element.dataset[dataKey] = attributes[key][dataKey];
            }
        } else if (key === 'innerText') {
            element.innerText = attributes[key];
        } else if (key === 'innerHTML') {
            element.innerHTML = attributes[key];
        } else {
            element.setAttribute(key, attributes[key]);
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}

// Generate a unique ID
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Deep clone an object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Format number with fixed decimals
export function formatNumber(number, decimals = 2) {
    return Number(number).toFixed(decimals);
}

// Convert canvas to a data URL with specified quality
export function canvasToDataURL(canvas, quality = 0.92) {
    return canvas.toDataURL('image/jpeg', quality);
}

// Download a file
export function downloadFile(filename, data, mimeType = 'application/octet-stream') {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}

// Import a file and read its contents
export function importFile(accept = '.json') {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: event.target.result
                });
            };

            reader.onerror = (error) => {
                reject(error);
            };

            if (accept.includes('json') || accept.includes('text')) {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        };

        input.click();
    });
}

// Show a toast notification
export function showToast(message, type = 'info', duration = 3000) {
    const toast = createElement('div', {
        className: `toast toast-${type}`,
        innerText: message,
        style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3',
            color: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        }
    });

    document.body.appendChild(toast);

    // Trigger reflow to start transition
    void toast.offsetWidth;

    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}