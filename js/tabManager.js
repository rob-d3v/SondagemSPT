// Tab Manager - Handles switching between different tabs of the interface
export class TabManager {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        this.activeTab = 'general-info'; // Default active tab
    }
    
    activateTab(tabId) {
        // Remove active class from all tabs and tab panes
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected tab and tab pane
        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        // Update active tab
        this.activeTab = tabId;
    }
}
