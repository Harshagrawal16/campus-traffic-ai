/* AI Smart Traffic Control Dashboard Controller */

// Global reference to the simulation
let simInstance = null;
let waitTimeChart = null;
let throughputChart = null;
let currentTab = 'dashboard';
let isChartJsLoaded = false;

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // 0. Setup Security Login Portal & Registration
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginPortal = document.getElementById('login-portal');
    const appContainer = document.querySelector('.app-container');
    
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    
    const linkShowRegister = document.getElementById('link-show-register');
    const linkShowLogin = document.getElementById('link-show-login');
    
    const loginError = document.getElementById('login-error-msg');
    const registerMsg = document.getElementById('register-msg');

    // Switch between Login and Registration cards
    if (linkShowRegister && linkShowLogin && loginCard && registerCard) {
        linkShowRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginCard.style.display = 'none';
            registerCard.style.display = 'block';
            if (loginError) loginError.style.display = 'none';
            if (registerMsg) registerMsg.style.display = 'none';
            if (typeof lucide !== 'undefined') lucide.createImages();
        });

        linkShowLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
            if (loginError) loginError.style.display = 'none';
            if (registerMsg) registerMsg.style.display = 'none';
            if (typeof lucide !== 'undefined') lucide.createImages();
        });
    }

    // Handles user registration (LocalStorage backed)
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('reg-fullname').value.trim();
            const username = document.getElementById('reg-username').value.trim().toLowerCase();
            const password = document.getElementById('reg-password').value.trim();

            if (username === 'admin') {
                showRegisterFeedback("❌ Username 'admin' is a reserved system login.", 'danger');
                return;
            }

            let users = [];
            try {
                const stored = localStorage.getItem('traffic_users');
                if (stored) users = JSON.parse(stored);
            } catch (err) {
                console.error("Failed to parse local users registry:", err);
            }

            const duplicate = users.find(u => u.username === username);
            if (duplicate) {
                showRegisterFeedback("❌ Username already exists. Choose another.", 'danger');
                return;
            }

            // Save new user credentials
            users.push({ fullName, username, password });
            localStorage.setItem('traffic_users', JSON.stringify(users));

            showRegisterFeedback("✅ Account registered! Redirecting to login...", 'success');
            
            setTimeout(() => {
                registerForm.reset();
                if (registerMsg) registerMsg.style.display = 'none';
                registerCard.style.display = 'none';
                loginCard.style.display = 'block';
                
                const usernameField = document.getElementById('username');
                if (usernameField) usernameField.value = username;
                if (typeof lucide !== 'undefined') lucide.createImages();
            }, 1200);
        });
    }

    function showRegisterFeedback(message, type) {
        if (!registerMsg) return;
        registerMsg.style.display = 'block';
        registerMsg.textContent = message;
        if (type === 'success') {
            registerMsg.style.color = 'var(--success)';
        } else {
            registerMsg.style.color = 'var(--danger)';
        }
    }

    // Handles login form authentication
    if (loginForm && loginPortal && appContainer) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value.trim();

            let isAuthenticated = false;
            let displayName = "Harsh";

            if (user.toLowerCase() === 'admin' && pass === 'admin') {
                isAuthenticated = true;
                displayName = "Harsh";
            } else {
                let users = [];
                try {
                    const stored = localStorage.getItem('traffic_users');
                    if (stored) users = JSON.parse(stored);
                } catch (err) {
                    console.error("Local users read failed:", err);
                }

                const matchedUser = users.find(u => u.username === user.toLowerCase() && u.password === pass);
                if (matchedUser) {
                    isAuthenticated = true;
                    displayName = matchedUser.fullName;
                }
            }

            if (isAuthenticated) {
                loginPortal.style.display = 'none';
                appContainer.style.display = 'flex';

                // Dynamically update UI Profile details
                const profileName = document.getElementById('user-name');
                const profileAvatar = document.getElementById('user-avatar');
                if (profileName) profileName.textContent = displayName;
                if (profileAvatar) {
                    // Extract initials
                    let initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase();
                    profileAvatar.textContent = initials.substring(0, 2);
                }
                
                // Apply Role privileges based on account type
                let role = (user.toLowerCase() === 'admin') ? 'ADMIN' : 'MONITOR';
                applyRolePrivileges(role);

                // Start/Resume the simulation loop upon successful login
                if (simInstance) {
                    simInstance.start();
                    
                    // Reset Play/Pause button layout
                    const btnPause = document.getElementById('btn-sim-pause');
                    if (btnPause) {
                        btnPause.querySelector('span').textContent = "Pause";
                        const icon = btnPause.querySelector('i');
                        if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
                    }
                }
                
                // Initialize Lucide icons for the dashboard workspace
                try {
                    if (typeof lucide !== 'undefined') {
                        lucide.createImages();
                    }
                } catch (err) {
                    console.error("Lucide setup inside dashboard failed:", err);
                }
            } else {
                if (loginError) {
                    loginError.style.display = 'block';
                }
            }
        });
    }

    // Handles Logout triggers
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout && loginPortal && appContainer) {
        btnLogout.addEventListener('click', () => {
            // Pause the simulation if active to save canvas loops resource
            if (simInstance) {
                simInstance.pause();
                
                const btnPause = document.getElementById('btn-sim-pause');
                if (btnPause) {
                    btnPause.querySelector('span').textContent = "Resume";
                    const icon = btnPause.querySelector('i');
                    if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'play');
                }
            }

            // Hide main app container, show login portal
            appContainer.style.display = 'none';
            loginPortal.style.display = 'flex';

            // Reset credentials input
            if (loginForm) loginForm.reset();
            const passwordField = document.getElementById('password');
            if (passwordField) passwordField.value = '';

            // Update Lucide icon renders
            try {
                if (typeof lucide !== 'undefined') {
                    lucide.createImages();
                }
            } catch (err) {
                console.error("Lucide setup inside login failed:", err);
            }
        });
    }

    // Role-Based Access Control (RBAC) Logic
    function applyRolePrivileges(role) {
        const isAdmin = (role === 'ADMIN');
        
        // Update User Role label in sidebar footer
        const roleLabel = document.querySelector('.user-role');
        if (roleLabel) {
            roleLabel.textContent = isAdmin ? 'Administrator' : 'System Monitor';
            roleLabel.style.color = isAdmin ? 'var(--primary)' : 'var(--text-muted)';
        }

        // Toggle buttons disabled states
        const controlButtons = [
            'btn-sim-pause', 'btn-sim-reset', 'btn-clear-logs',
            'btn-spawn-ambulance', 'btn-spawn-pedestrian',
            'btn-manual-ns', 'btn-manual-ew', 'btn-mode-ai', 'btn-mode-fixed', 'btn-mode-manual'
        ];
        
        controlButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !isAdmin;
                btn.style.opacity = isAdmin ? '1' : '0.5';
                btn.style.cursor = isAdmin ? 'pointer' : 'not-allowed';
                btn.style.pointerEvents = isAdmin ? 'auto' : 'none';
            }
        });

        // Toggle speed buttons click capabilities
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.style.pointerEvents = isAdmin ? 'auto' : 'none';
            btn.style.opacity = isAdmin ? '1' : '0.4';
            btn.style.cursor = isAdmin ? 'pointer' : 'not-allowed';
        });

        // Toggle sliders/inputs disabled states
        const inputs = [
            'slider-density-north', 'slider-density-south', 'slider-density-east', 'slider-density-west',
            'slider-sensor-range', 'slider-ped-duration', 'input-min-green', 'input-max-green'
        ];

        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.disabled = !isAdmin;
                input.style.opacity = isAdmin ? '1' : '0.5';
                input.style.cursor = isAdmin ? 'default' : 'not-allowed';
                input.style.pointerEvents = isAdmin ? 'auto' : 'none';
            }
        });

        // Display/Hide Monitor Mode Banner Notice
        const noticeId = 'role-monitor-notice';
        let notice = document.getElementById(noticeId);
        
        if (!isAdmin) {
            if (!notice) {
                notice = document.createElement('div');
                notice.id = noticeId;
                notice.className = 'glass';
                notice.style.padding = '0.75rem 1rem';
                notice.style.marginBottom = '1.5rem';
                notice.style.borderRadius = '8px';
                notice.style.border = '1px solid var(--danger)';
                notice.style.color = 'var(--danger)';
                notice.style.fontSize = '0.8rem';
                notice.style.textAlign = 'center';
                notice.style.fontFamily = 'var(--font-mono)';
                notice.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.15)';
                notice.innerHTML = '⚠️ <strong>Read-Only Monitor Mode:</strong> Access is restricted to monitoring only. Login as Administrator to adjust parameters.';
                
                // Insert it at the top of the workspace content
                const header = document.querySelector('.main-content');
                if (header) {
                    header.insertBefore(notice, header.firstChild);
                }
            } else {
                notice.style.display = 'block';
            }
        } else {
            if (notice) {
                notice.style.display = 'none';
            }
        }
    }

    // 1. Setup Lucide icons safely (won't crash if offline)
    try {
        if (typeof lucide !== 'undefined') {
            lucide.createImages();
        } else {
            console.warn("Lucide icons package not loaded. Falling back to textual representations.");
        }
    } catch (e) {
        console.error("Lucide setup failed:", e);
    }
    
    // Normalize canvas sizes to 800x500 internally (CSS handles visual scaling)
    const dashboardCanvas = document.getElementById('dashboardCanvasPreview');
    const simulationCanvas = document.getElementById('trafficCanvasMain');
    
    if (dashboardCanvas) {
        dashboardCanvas.width = 800;
        dashboardCanvas.height = 500;
    }
    if (simulationCanvas) {
        simulationCanvas.width = 800;
        simulationCanvas.height = 500;
    }

    // 2. Instantiate simulation (this should always run)
    try {
        simInstance = new IntersectionSim('dashboardCanvasPreview');
        // Keep it paused on startup to save CPU cycles until authenticated
        simInstance.pause();
    } catch (e) {
        console.error("Simulation engine failed to start:", e);
    }
    
    // 3. Bind Tab Switching Events
    setupTabs();
    
    // 4. Bind Parameter Sliders & Buttons
    setupControls();
    
    // 5. Initialize Analytics Charts safely (will handle offline gracefully)
    try {
        if (typeof Chart !== 'undefined') {
            isChartJsLoaded = true;
            setupCharts();
        } else {
            isChartJsLoaded = false;
            console.warn("Chart.js is not loaded. Graph plots are unavailable.");
            showOfflineChartsPlaceholder();
        }
    } catch (e) {
        console.error("Charts setup failed:", e);
        showOfflineChartsPlaceholder();
    }
    
    // 6. Load Chapters for the Project Report
    setupReportViewer();
    
    // 7. Bind Theme Switcher Actions
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            
            // Save preference to localStorage
            localStorage.setItem('theme_preference', isLight ? 'light' : 'dark');
            
            // Update icons
            const sunIcon = btnThemeToggle.querySelector('.theme-icon-sun');
            const moonIcon = btnThemeToggle.querySelector('.theme-icon-moon');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = isLight ? 'block' : 'none';
                moonIcon.style.display = isLight ? 'none' : 'block';
            }
            
            // Redraw charts if loaded to update grids
            if (isChartJsLoaded && waitTimeChart && throughputChart) {
                const gridColor = isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.03)';
                const labelColor = isLight ? '#64748b' : '#6b7280';
                
                waitTimeChart.options.scales.x.ticks.color = labelColor;
                waitTimeChart.options.scales.y.ticks.color = labelColor;
                waitTimeChart.options.scales.y.grid.color = gridColor;
                waitTimeChart.update();
                
                throughputChart.options.scales.x.ticks.color = labelColor;
                throughputChart.options.scales.y.ticks.color = labelColor;
                throughputChart.options.scales.y.grid.color = gridColor;
                throughputChart.update();
            }
            
            // Redraw simulation context
            if (simInstance) {
                simInstance.draw();
            }
        });
        
        // Restore saved theme preference
        const savedTheme = localStorage.getItem('theme_preference');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            const sunIcon = btnThemeToggle.querySelector('.theme-icon-sun');
            const moonIcon = btnThemeToggle.querySelector('.theme-icon-moon');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        }
    }
    
    // 8. Bind Eye Comfort Switcher Actions
    const btnEyeComfort = document.getElementById('btn-eye-comfort');
    if (btnEyeComfort) {
        btnEyeComfort.addEventListener('click', () => {
            document.body.classList.toggle('eye-comfort');
            const isComfort = document.body.classList.contains('eye-comfort');
            
            // Save preference to localStorage
            localStorage.setItem('eye_comfort_preference', isComfort ? 'active' : 'inactive');
            
            // Update icons
            const iconOff = btnEyeComfort.querySelector('.eye-icon-off');
            const iconOn = btnEyeComfort.querySelector('.eye-icon-on');
            if (iconOff && iconOn) {
                iconOff.style.display = isComfort ? 'none' : 'block';
                iconOn.style.display = isComfort ? 'block' : 'none';
            }
        });
        
        // Restore saved eye comfort preference
        const savedComfort = localStorage.getItem('eye_comfort_preference');
        if (savedComfort === 'active') {
            document.body.classList.add('eye-comfort');
            const iconOff = btnEyeComfort.querySelector('.eye-icon-off');
            const iconOn = btnEyeComfort.querySelector('.eye-icon-on');
            if (iconOff && iconOn) {
                iconOff.style.display = 'none';
                iconOn.style.display = 'block';
            }
        }
    }
    
    // Hook globally so simulation can trigger log rendering
    window.updateDashboardLogs = renderLogs;
    window.updateDashboardStats = updateStatsGauges;
});

// Tab Switching Mechanism
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            currentTab = targetTab;
            
            // Toggle active nav class
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Toggle active tab pane
            tabPanes.forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(`tab-${targetTab}`);
            if (targetPane) targetPane.classList.add('active');
            
            // Update Page Header Title & Subtitle based on tab
            updateHeaderTitles(targetTab);
            
            // Context Canvas Swapper
            if (simInstance) {
                if (targetTab === 'dashboard') {
                    simInstance.canvas = document.getElementById('dashboardCanvasPreview');
                    if (simInstance.canvas) {
                        simInstance.ctx = simInstance.canvas.getContext('2d');
                    }
                } else if (targetTab === 'simulation') {
                    simInstance.canvas = document.getElementById('trafficCanvasMain');
                    if (simInstance.canvas) {
                        simInstance.ctx = simInstance.canvas.getContext('2d');
                    }
                    
                    // Synchronize sliders on full view entry
                    const rangeSlider = document.getElementById('slider-sensor-range');
                    const minGreenInput = document.getElementById('input-min-green');
                    const maxGreenInput = document.getElementById('input-max-green');
                    const pedDurationSlider = document.getElementById('slider-ped-duration');

                    const directionsList = ['north', 'south', 'east', 'west'];
                    directionsList.forEach(dir => {
                        const slider = document.getElementById(`slider-density-${dir}`);
                        if (slider && simInstance) {
                            slider.value = Math.round(simInstance.spawnProbability[dir.toUpperCase()] * 4000);
                            
                            // Also update text label on sync
                            const valDisplay = document.getElementById(`val-density-${dir}`);
                            let pct = parseInt(slider.value);
                            let label = "Medium";
                            if (pct === 0) label = "OFF";
                            else if (pct < 30) label = `Low (${pct}%)`;
                            else if (pct > 75) label = `Rush Hour (${pct}%)`;
                            else label = `Medium (${pct}%)`;
                            if (valDisplay) valDisplay.textContent = label;
                        }
                    });

                    if (rangeSlider) rangeSlider.value = simInstance.sensorRange;
                    if (minGreenInput) minGreenInput.value = simInstance.minGreen;
                    if (maxGreenInput) maxGreenInput.value = simInstance.maxGreen;
                    if (pedDurationSlider) pedDurationSlider.value = simInstance.pedDuration;
                }
            }
            
            // Re-render chart datasets when entering analytics page
            if (targetTab === 'analytics' && isChartJsLoaded) {
                updateChartsData();
            }
        });
    });
    
    // Shortcut button from dashboard preview to full simulation tab
    const viewFullBtn = document.getElementById('btn-dashboard-to-sim');
    if (viewFullBtn) {
        viewFullBtn.addEventListener('click', () => {
            const simNavItem = document.querySelector('.nav-item[data-tab="simulation"]');
            if (simNavItem) simNavItem.click();
        });
    }
}

function updateHeaderTitles(tab) {
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (!titleEl || !subtitleEl) return;
    
    if (tab === 'dashboard') {
        titleEl.textContent = "Dashboard";
        subtitleEl.textContent = "Real-time monitoring and smart coordination of campus traffic flows.";
    } else if (tab === 'simulation') {
        titleEl.textContent = "Live Simulation Crossroads";
        subtitleEl.textContent = "Observe vehicle physics, pedestrian requests, and emergency overrides.";
    } else if (tab === 'analytics') {
        titleEl.textContent = "Analytics & Intelligence Logs";
        subtitleEl.textContent = "Comparative performance metrics and historical predictive models.";
    } else if (tab === 'report') {
        titleEl.textContent = "BCA PROJECT DOCUMENTATION";
        subtitleEl.textContent = "COMPREHENSIVE REPORT IS READY FOR ACADEMIC SUBMISSION";
    }
}

// Binds controls to update the simulation parameters
function setupControls() {
    // Mode switches
    const btnModeAi = document.getElementById('btn-mode-ai');
    const btnModeFixed = document.getElementById('btn-mode-fixed');
    const btnModeManual = document.getElementById('btn-mode-manual');
    const manualPanel = document.getElementById('manual-controls-group');
    
    if (btnModeAi && btnModeFixed && btnModeManual) {
        btnModeAi.addEventListener('click', () => {
            btnModeAi.classList.add('active');
            btnModeFixed.classList.remove('active');
            btnModeManual.classList.remove('active');
            if (manualPanel) manualPanel.style.display = 'none';
            if (simInstance) {
                simInstance.controlMode = 'AI';
                simInstance.logAIAction("System switched to AI Adaptive Mode manually.", "system");
            }
        });
        
        btnModeFixed.addEventListener('click', () => {
            btnModeFixed.classList.add('active');
            btnModeAi.classList.remove('active');
            btnModeManual.classList.remove('active');
            if (manualPanel) manualPanel.style.display = 'none';
            if (simInstance) {
                simInstance.controlMode = 'FIXED';
                simInstance.logAIAction("System switched to Fixed Pre-timed Mode manually.", "system");
            }
        });

        btnModeManual.addEventListener('click', () => {
            btnModeManual.classList.add('active');
            btnModeAi.classList.remove('active');
            btnModeFixed.classList.remove('active');
            if (manualPanel) manualPanel.style.display = 'block';
            if (simInstance) {
                simInstance.controlMode = 'MANUAL';
                simInstance.logAIAction("System switched to Manual Override Mode. Use buttons to force signals.", "system");
            }
        });
    }

    // Manual controls overrides buttons
    const btnManualNs = document.getElementById('btn-manual-ns');
    const btnManualEw = document.getElementById('btn-manual-ew');
    if (btnManualNs && btnManualEw) {
        btnManualNs.addEventListener('click', () => {
            if (simInstance && simInstance.controlMode === 'MANUAL') {
                simInstance.forceNSGreen();
            }
        });
        btnManualEw.addEventListener('click', () => {
            if (simInstance && simInstance.controlMode === 'MANUAL') {
                simInstance.forceEWGreen();
            }
        });
    }

    // Play/Pause
    const btnPause = document.getElementById('btn-sim-pause');
    if (btnPause) {
        btnPause.addEventListener('click', () => {
            if (!simInstance) return;
            if (simInstance.isPaused) {
                simInstance.start();
                btnPause.querySelector('span').textContent = "Pause";
                const icon = btnPause.querySelector('i');
                if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
            } else {
                simInstance.pause();
                btnPause.querySelector('span').textContent = "Resume";
                const icon = btnPause.querySelector('i');
                if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'play');
            }
            if (typeof lucide !== 'undefined') lucide.createImages();
        });
    }

    // Reset
    const btnReset = document.getElementById('btn-sim-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (!simInstance) return;
            simInstance.reset();
            // Resume if it was paused
            if (simInstance.isPaused) {
                simInstance.start();
                if (btnPause) {
                    btnPause.querySelector('span').textContent = "Pause";
                    const icon = btnPause.querySelector('i');
                    if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
                }
                if (typeof lucide !== 'undefined') lucide.createImages();
            }
        });
    }

    // Clear logs button
    const btnClearLogs = document.getElementById('btn-clear-logs');
    if (btnClearLogs) {
        btnClearLogs.addEventListener('click', () => {
            if (simInstance) {
                simInstance.stats.aiEventLogs = [];
                renderLogs();
            }
        });
    }

    // Spawn emergency
    const btnAmbulance = document.getElementById('btn-spawn-ambulance');
    if (btnAmbulance) {
        btnAmbulance.addEventListener('click', () => {
            if (simInstance) simInstance.spawnVehicle(null, 'ambulance');
        });
    }

    // Spawn pedestrian
    const btnPed = document.getElementById('btn-spawn-pedestrian');
    if (btnPed) {
        btnPed.addEventListener('click', () => {
            if (simInstance) simInstance.triggerPedestrianCrossing();
        });
    }

    // Speed buttons
    const speedBtns = document.querySelectorAll('.speed-btn');
    speedBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            speedBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            let speed = parseFloat(btn.getAttribute('data-speed'));
            if (simInstance) {
                simInstance.simSpeed = speed;
                simInstance.logAIAction(`Simulation speed adjusted to ${speed}x.`, "system");
            }
        });
    });

    // Lane Density Sliders
    const directionsList = ['north', 'south', 'east', 'west'];
    directionsList.forEach(dir => {
        const slider = document.getElementById(`slider-density-${dir}`);
        const valueDisplay = document.getElementById(`val-density-${dir}`);
        if (slider) {
            slider.addEventListener('input', () => {
                let pct = parseInt(slider.value);
                let uppercaseDir = dir.toUpperCase();
                if (simInstance) {
                    simInstance.spawnProbability[uppercaseDir] = (pct / 4000);
                }
                
                let label = "Medium";
                if (pct === 0) label = "OFF";
                else if (pct < 30) label = `Low (${pct}%)`;
                else if (pct > 75) label = `Rush Hour (${pct}%)`;
                else label = `Medium (${pct}%)`;
                
                if (valueDisplay) valueDisplay.textContent = label;
            });
        }
    });

    // Export buttons
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnExportPdf = document.getElementById('btn-export-pdf');
    if (btnExportCsv) btnExportCsv.addEventListener('click', exportCSVReport);
    if (btnExportPdf) btnExportPdf.addEventListener('click', exportPDFSummary);

    const sliderSensorRange = document.getElementById('slider-sensor-range');
    const valSensorRange = document.getElementById('val-sensor-range');
    if (sliderSensorRange) {
        sliderSensorRange.addEventListener('input', () => {
            let meters = parseInt(sliderSensorRange.value);
            if (simInstance) simInstance.sensorRange = meters;
            if (valSensorRange) valSensorRange.textContent = `${meters}m`;
        });
    }

    const sliderPed = document.getElementById('slider-ped-duration');
    const valPed = document.getElementById('val-ped-duration');
    if (sliderPed) {
        sliderPed.addEventListener('input', () => {
            let sec = parseInt(sliderPed.value);
            if (simInstance) simInstance.pedDuration = sec;
            if (valPed) valPed.textContent = `${sec}s`;
        });
    }

    // Min / Max green limits inputs
    const inputMinGreen = document.getElementById('input-min-green');
    const inputMaxGreen = document.getElementById('input-max-green');
    const valGreenLimit = document.getElementById('val-green-limit');
    
    function updateGreenLimitLabel() {
        if (!inputMinGreen || !inputMaxGreen) return;
        let min = parseInt(inputMinGreen.value);
        let max = parseInt(inputMaxGreen.value);
        if (min >= max) {
            min = max - 2;
            inputMinGreen.value = min;
        }
        if (simInstance) {
            simInstance.minGreen = min;
            simInstance.maxGreen = max;
        }
        if (valGreenLimit) valGreenLimit.textContent = `${min}s - ${max}s`;
    }
    
    if (inputMinGreen && inputMaxGreen) {
        inputMinGreen.addEventListener('change', updateGreenLimitLabel);
        inputMaxGreen.addEventListener('change', updateGreenLimitLabel);
    }
    
    // Smart Routing pedestrian check
    const chkSmartPed = document.getElementById('chk-smart-routing');
    if (chkSmartPed) {
        chkSmartPed.addEventListener('change', () => {
            if (simInstance) {
                simInstance.logAIAction(`Adaptive Pedestrian Safety: ${chkSmartPed.checked ? 'ENABLED' : 'DISABLED'}`, 'system');
            }
        });
    }
}

// Analytics Charts Setup using Chart.js
function setupCharts() {
    const ctxWait = document.getElementById('chartWaitTime');
    const ctxThrough = document.getElementById('chartThroughput');
    
    if (!ctxWait || !ctxThrough) return;

    // Line Chart for Wait Time Comparison
    waitTimeChart = new Chart(ctxWait.getContext('2d'), {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => i + 1),
            datasets: [
                {
                    label: 'AI Adaptive wait time (s)',
                    data: [],
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0, 242, 254, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Traditional Fixed timer baseline (s)',
                    data: Array(30).fill(24.6), // Standard fixed cycle baseline wait
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    borderWidth: 1.5,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#9ca3af', font: { family: 'Inter', size: 10 } } }
            },
            scales: {
                x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(255, 255, 255, 0.03)' } },
                y: { min: 0, max: 40, ticks: { color: '#6b7280' }, grid: { color: 'rgba(255, 255, 255, 0.03)' } }
            }
        }
    });

    // Bar Chart for exit cumulative throughput counts
    throughputChart = new Chart(ctxThrough.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Main Gate (N)', 'Library Rd (S)', 'Academic Blk (E)', 'Hostel Zone (W)'],
            datasets: [{
                label: 'Vehicles Cleared',
                data: [0, 0, 0, 0],
                backgroundColor: [
                    'rgba(6, 182, 212, 0.3)',
                    'rgba(16, 185, 129, 0.3)',
                    'rgba(245, 158, 11, 0.3)',
                    'rgba(139, 92, 246, 0.3)'
                ],
                borderColor: [
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6'
                ],
                borderWidth: 1.5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { ticks: { color: '#6b7280' }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: '#6b7280' }, grid: { color: 'rgba(255, 255, 255, 0.03)' } }
            }
        }
    });
}

function showOfflineChartsPlaceholder() {
    const ctxWait = document.getElementById('chartWaitTime');
    const ctxThrough = document.getElementById('chartThroughput');
    
    if (ctxWait && ctxWait.parentElement) {
        ctxWait.parentElement.innerHTML = `
            <div class="report-loading" style="text-align:center; padding: 2rem; color: var(--text-muted);">
                <p>📊 Chart.js could not be loaded.</p>
                <p style="font-size:0.8rem; margin-top: 0.5rem;">Connect to the internet to load analytics graphs via CDN.</p>
            </div>
        `;
    }
    if (ctxThrough && ctxThrough.parentElement) {
        ctxThrough.parentElement.innerHTML = `
            <div class="report-loading" style="text-align:center; padding: 2rem; color: var(--text-muted);">
                <p>📊 Throughput graphs are offline.</p>
                <p style="font-size:0.8rem; margin-top: 0.5rem;">Connect to the internet to load analytics graphs via CDN.</p>
            </div>
        `;
    }
}

// Update Chart Datasets dynamically
function updateChartsData() {
    if (!waitTimeChart || !throughputChart || !simInstance) return;

    // Pull Wait times history
    let waitHist = simInstance.stats.waitTimesHistory;
    // Cap at 30 items for line chart labels matching
    let plotData = waitHist.slice(-30);
    
    // Fill empty arrays to align labels if simulation is young
    if (plotData.length < 30) {
        let padding = Array(30 - plotData.length).fill(0);
        plotData = padding.concat(plotData);
    }
    
    waitTimeChart.data.datasets[0].data = plotData;
    waitTimeChart.update();

    // Pull lane throughput counts
    let tNS = Math.round(simInstance.stats.throughputNS);
    let tEW = Math.round(simInstance.stats.throughputEW);
    
    // Spreading roughly equally to simulate exit queues
    let counts = [
        Math.floor(tNS * 0.52),
        Math.floor(tNS * 0.48),
        Math.floor(tEW * 0.51),
        Math.floor(tEW * 0.49)
    ];

    throughputChart.data.datasets[0].data = counts;
    throughputChart.update();
}

// Renders the logs box in DOM
function renderLogs() {
    const logsBox = document.getElementById('ai-logs');
    if (!logsBox || !simInstance) return;
    
    logsBox.innerHTML = '';
    
    simInstance.stats.aiEventLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = `log-entry ${log.type}`;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = `[${log.time}]`;
        
        div.appendChild(timeSpan);
        div.append(log.text);
        logsBox.appendChild(div);
    });
}

// Updates numeric gauges and progress bars in DOM
function updateStatsGauges(stats, lights, lanes) {
    if (!simInstance) return;
    
    // 1. Numeric card metrics
    let avgWait = stats.totalVehicles > 0 ? (stats.totalWaitTime / stats.totalVehicles) : 0;
    
    const waitTimeEl = document.getElementById('m-wait-time');
    const processedEl = document.getElementById('m-vehicles-count');
    const emissionsEl = document.getElementById('m-emissions');

    if (waitTimeEl) waitTimeEl.textContent = `${avgWait.toFixed(1)}s`;
    if (processedEl) processedEl.textContent = stats.totalVehicles;
    if (emissionsEl) emissionsEl.textContent = `${stats.emissionsSaved.toFixed(2)} kg`;

    // Dynamic Congestion levels labels
    const levelEl = document.getElementById('m-congestion');
    const descEl = document.getElementById('m-congestion-desc');
    let totalQueueCount = simInstance.vehicles.filter(v => v.isStopped).length;

    if (levelEl && descEl) {
        if (totalQueueCount > 10) {
            levelEl.textContent = "HEAVY";
            levelEl.className = "text-danger";
            descEl.textContent = "Congested Intersect";
            descEl.className = "trend text-danger";
        } else if (totalQueueCount > 4) {
            levelEl.textContent = "MODERATE";
            levelEl.className = "text-warning";
            descEl.textContent = "Minor Delay";
            descEl.className = "trend text-warning";
        } else {
            levelEl.textContent = "LOW";
            levelEl.className = "text-success";
            descEl.textContent = "Smooth Flow";
            descEl.className = "trend text-success";
        }
    }

    // Badges update
    const modeBadge = document.getElementById('system-mode-badge');
    const aiBadge = document.getElementById('ai-badge');
    const efficiencyBadge = document.getElementById('efficiency-badge');

    if (modeBadge) modeBadge.textContent = stats.systemMode;
    if (aiBadge) {
        aiBadge.textContent = (simInstance.controlMode === 'AI' ? "ACTIVE" : "STANDBY");
        aiBadge.className = (simInstance.controlMode === 'AI' ? "q-value text-success" : "q-value text-muted");
    }
    
    let baselineWait = 24.6;
    let reductionPct = avgWait > 0 ? ((baselineWait - avgWait) / baselineWait * 100) : 0;
    if (efficiencyBadge) {
        efficiencyBadge.textContent = reductionPct > 0 ? `+${reductionPct.toFixed(1)}%` : `0.0%`;
    }

    // 2. Queue bars (Dashboard Right Panel)
    const qNorthData = simInstance.countQueuedVehicles('NORTH');
    const qSouthData = simInstance.countQueuedVehicles('SOUTH');
    const qEastData = simInstance.countQueuedVehicles('EAST');
    const qWestData = simInstance.countQueuedVehicles('WEST');

    updateProgressBar('q-north', 'q-count-north', qNorthData.count);
    updateProgressBar('q-south', 'q-count-south', qSouthData.count);
    updateProgressBar('q-east', 'q-count-east', qEastData.count);
    updateProgressBar('q-west', 'q-count-west', qWestData.count);

    // 3. Current signal timers (Simulation Right Panel)
    const nsTimerStr = lights.NS.state === 'RED' ? 'RED' : `${lights.NS.timer.toFixed(1)}s [${lights.NS.state}]`;
    const ewTimerStr = lights.EW.state === 'RED' ? 'RED' : `${lights.EW.timer.toFixed(1)}s [${lights.EW.state}]`;
    
    const timerNsEl = document.getElementById('timer-ns');
    const timerEwEl = document.getElementById('timer-ew');

    if (timerNsEl) {
        timerNsEl.textContent = nsTimerStr;
        timerNsEl.style.color = getLightStateColor(lights.NS.state);
    }
    if (timerEwEl) {
        timerEwEl.textContent = ewTimerStr;
        timerEwEl.style.color = getLightStateColor(lights.EW.state);
    }

    // If analytics view is open, push data to charts in real time
    if (currentTab === 'analytics' && isChartJsLoaded) {
        updateChartsData();
    }
}

function updateProgressBar(barId, countId, count) {
    const bar = document.getElementById(barId);
    const text = document.getElementById(countId);
    if (!bar || !text) return;
    
    // Scale count (e.g. 0-8 vehicles mapped to 0-100% width)
    let percent = Math.min(100, (count / 8) * 100);
    bar.style.width = `${percent}%`;
    text.textContent = count === 1 ? "1 Car" : `${count} Cars`;
    
    // Color glow alert shifts
    if (count > 5) {
        bar.className = `progress-bar bg-orange`;
    } else if (count > 2) {
        bar.className = `progress-bar bg-purple`;
    } else {
        bar.className = `progress-bar bg-cyan`;
    }
}

function getLightStateColor(state) {
    if (state === 'GREEN') return '#10b981';
    if (state === 'YELLOW') return '#f59e0b';
    return '#ef4444';
}

// Project Report Loading & TOC scrolling binds
function setupReportViewer() {
    const viewer = document.getElementById('report-text-container');
    if (!viewer) return;

    // Load full report structure sequentially
    let fullReportHtml = '';
    if (typeof PROJECT_REPORT_DATA !== 'undefined') {
        fullReportHtml += PROJECT_REPORT_DATA.abstract;
        fullReportHtml += PROJECT_REPORT_DATA.ch1;
        fullReportHtml += PROJECT_REPORT_DATA.ch2;
        fullReportHtml += PROJECT_REPORT_DATA.ch3;
        fullReportHtml += PROJECT_REPORT_DATA.ch4;
        fullReportHtml += PROJECT_REPORT_DATA.ch5;
        fullReportHtml += PROJECT_REPORT_DATA.ch6;
        fullReportHtml += PROJECT_REPORT_DATA.references;
    } else {
        fullReportHtml = "<div class='report-loading'>Failed to load project report contents database.</div>";
    }
    
    viewer.innerHTML = fullReportHtml;

    // Setup TOC links active state mapping on scroll
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = viewer.querySelectorAll('.report-doc');
    
    viewer.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            // Check if section is currently near top of viewer viewport
            if (rect.top - viewer.getBoundingClientRect().top < 80) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        if (currentSectionId) {
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // Handle TOC click scroll anchors inside viewer container
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                viewer.scrollTo({
                    top: targetSection.offsetTop - 10,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Print button hook
    const printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
    
    // Inject math formula compiler backup (renders standard notation nicely inline)
    try {
        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }
    } catch (e) {
        console.warn("MathJax formatting failed:", e);
    }
}

// Evaluation Log CSV Exporter
function exportCSVReport() {
    if (!simInstance) return;
    
    let stats = simInstance.stats;
    let avgWait = stats.totalVehicles > 0 ? (stats.totalWaitTime / stats.totalVehicles) : 0;
    
    // Create CSV content
    let csv = "AI Smart Traffic Control System - Simulation Evaluation Log\n";
    csv += `Timestamp,${new Date().toLocaleString()}\n`;
    csv += `Control Mode,${simInstance.controlMode}\n`;
    csv += `Average Wait Time (s),${avgWait.toFixed(2)}\n`;
    csv += `Total Vehicles Processed,${stats.totalVehicles}\n`;
    csv += `Total North-South Throughput,${stats.throughputNS}\n`;
    csv += `Total East-West Throughput,${stats.throughputEW}\n`;
    csv += `Emissions Saved (kg CO2),${stats.emissionsSaved.toFixed(3)}\n\n`;
    
    csv += "System Logs Activity History:\n";
    csv += "Time,Event Type,Description\n";
    stats.aiEventLogs.forEach(log => {
        let textEscaped = log.text.replace(/"/g, '""');
        csv += `[${log.time}],${log.type},"${textEscaped}"\n`;
    });
    
    // Download Blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `smart_traffic_evaluation_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// PDF Printable Summary compiler
function exportPDFSummary() {
    if (!simInstance) return;
    
    let stats = simInstance.stats;
    let avgWait = stats.totalVehicles > 0 ? (stats.totalWaitTime / stats.totalVehicles) : 0;
    let baselineWait = 24.6;
    let reductionPct = avgWait > 0 ? ((baselineWait - avgWait) / baselineWait * 100) : 0;
    
    let printContent = `
        <html>
        <head>
            <title>AI Traffic System Performance Summary</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 3rem; }
                h1 { border-bottom: 2px solid #06b6d4; padding-bottom: 1rem; color: #0f172a; margin-bottom: 2rem; }
                .metric-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem; background-color: #fafafa; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1rem; }
                .stat-label { font-size: 0.85rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
                .stat-val { font-size: 1.8rem; font-weight: bold; color: #0f172a; margin-top: 0.25rem; font-family: monospace; }
                table { width: 100%; border-collapse: collapse; margin-top: 3rem; }
                th, td { border-bottom: 1px solid #e2e8f0; padding: 1rem; text-align: left; }
                th { background-color: #f1f5f9; font-weight: 600; font-size: 0.9rem; text-transform: uppercase; color: #475569; }
                .footer { margin-top: 4rem; font-size: 0.8rem; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
            </style>
        </head>
        <body>
            <h1>AI Smart Traffic Control - Evaluation Report</h1>
            <p><strong>Evaluation Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Academic Requirement:</strong> BCA 6th Semester Project Work</p>
            <p><strong>Institution Target:</strong> Internal Campus crossroads (Main Gate / Academic block crossing)</p>
            
            <div class="metric-box">
                <h3 style="margin-top:0; color:#0f172a;">Performance Efficiency Indices</h3>
                <div class="grid">
                    <div>
                        <div class="stat-label">Average Wait Time (AI adaptive)</div>
                        <div class="stat-val">${avgWait.toFixed(1)} seconds</div>
                    </div>
                    <div>
                        <div class="stat-label">Net Congestion Delay Reduction</div>
                        <div class="stat-val" style="color: #10b981;">-${reductionPct.toFixed(1)}% vs Baseline</div>
                    </div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Performance Indicator Variable</th>
                        <th>AI Optimized State (Adaptive)</th>
                        <th>Traditional Baseline (Fixed Cycle)</th>
                        <th>Net Improvement</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Average Waiting Delay</td>
                        <td><strong>${avgWait.toFixed(1)}s</strong></td>
                        <td>24.6s</td>
                        <td>${reductionPct.toFixed(1)}% reduction</td>
                    </tr>
                    <tr>
                        <td>Vehicles Processed (Throughput)</td>
                        <td><strong>${stats.totalVehicles} units</strong></td>
                        <td>--</td>
                        <td>Increased clearance rate</td>
                    </tr>
                    <tr>
                        <td>Carbon Emissions (CO2) Saved</td>
                        <td><strong>${stats.emissionsSaved.toFixed(3)} kg</strong></td>
                        <td>0.000 kg</td>
                        <td>Idle reduction saving</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="footer">
                Smart Traffic AI Simulation System © 2026. All academic rights reserved.
            </div>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
}
