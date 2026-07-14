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
    initLoginBgAnimation();
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

    // Password visibility switcher (Show/Hide key)
    const btnTogglePwd = document.getElementById('btn-toggle-pwd');
    const pwdInput = document.getElementById('password');
    if (btnTogglePwd && pwdInput) {
        btnTogglePwd.addEventListener('click', () => {
            const isPassword = pwdInput.type === 'password';
            pwdInput.type = isPassword ? 'text' : 'password';
            
            const eyeShow = btnTogglePwd.querySelector('.eye-show');
            const eyeHide = btnTogglePwd.querySelector('.eye-hide');
            if (eyeShow && eyeHide) {
                eyeShow.style.display = isPassword ? 'none' : 'block';
                eyeHide.style.display = isPassword ? 'block' : 'none';
            }
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
                    if (window.speakAnnouncement) {
                        window.speakAnnouncement(`Access granted. Welcome, ${displayName}. AI traffic scheduling core online.`);
                    }
                    
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
            'btn-spawn-ambulance', 'btn-spawn-pedestrian', 'btn-spawn-bike',
            'btn-spawn-auto', 'btn-spawn-cycle',
            'btn-manual-ns', 'btn-manual-ew', 'btn-mode-ai', 'btn-mode-fixed', 'btn-mode-manual',
            'btn-export-csv', 'btn-export-json', 'btn-export-pdf'
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
        window.simInstance = simInstance; // Bind globally
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
            // Update labels
            const statusTxt = document.getElementById('txt-theme-status');
            if (statusTxt) statusTxt.textContent = isLight ? "Theme: LIGHT" : "Theme: DARK";
            
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
            const statusTxt = document.getElementById('txt-theme-status');
            if (statusTxt) statusTxt.textContent = "Theme: LIGHT";
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
            
            // Update icons & text
            const iconOff = btnEyeComfort.querySelector('.eye-icon-off');
            const iconOn = btnEyeComfort.querySelector('.eye-icon-on');
            if (iconOff && iconOn) {
                iconOff.style.display = isComfort ? 'none' : 'block';
                iconOn.style.display = isComfort ? 'block' : 'none';
            }
            const statusTxt = document.getElementById('txt-eye-status');
            if (statusTxt) statusTxt.textContent = isComfort ? "Eye Comfort: ON" : "Eye Comfort: OFF";
            
            // Color feedback
            btnEyeComfort.style.color = isComfort ? 'var(--warning)' : 'var(--text-primary)';
            btnEyeComfort.style.borderColor = isComfort ? 'var(--warning-glow)' : 'var(--border-color)';
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
            const statusTxt = document.getElementById('txt-eye-status');
            if (statusTxt) statusTxt.textContent = "Eye Comfort: ON";
            btnEyeComfort.style.color = 'var(--warning)';
            btnEyeComfort.style.borderColor = 'var(--warning-glow)';
        }
    }
    
    // 9. Bind Fullscreen Actions
    const btnFullscreen = document.getElementById('btn-fullscreen');
    if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
            const iconEnter = btnFullscreen.querySelector('.fullscreen-icon-enter');
            const iconExit = btnFullscreen.querySelector('.fullscreen-icon-exit');
            const statusTxt = document.getElementById('txt-fullscreen-status');
            
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    if (iconEnter && iconExit) {
                        iconEnter.style.display = 'none';
                        iconExit.style.display = 'block';
                    }
                    if (statusTxt) statusTxt.textContent = "Fullscreen: ON";
                }).catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen().then(() => {
                    if (iconEnter && iconExit) {
                        iconEnter.style.display = 'block';
                        iconExit.style.display = 'none';
                    }
                    if (statusTxt) statusTxt.textContent = "Fullscreen: OFF";
                }).catch(err => {
                    console.error(`Error attempting to exit fullscreen: ${err.message}`);
                });
            }
        });
        
        // Handle changes initiated by Escape key or native UI changes
        document.addEventListener('fullscreenchange', () => {
            const iconEnter = btnFullscreen.querySelector('.fullscreen-icon-enter');
            const iconExit = btnFullscreen.querySelector('.fullscreen-icon-exit');
            const statusTxt = document.getElementById('txt-fullscreen-status');
            if (iconEnter && iconExit) {
                if (document.fullscreenElement) {
                    iconEnter.style.display = 'none';
                    iconExit.style.display = 'block';
                    if (statusTxt) statusTxt.textContent = "Fullscreen: ON";
                } else {
                    iconEnter.style.display = 'block';
                    iconExit.style.display = 'none';
                    if (statusTxt) statusTxt.textContent = "Fullscreen: OFF";
                }
            }
        });
    }
    
    // 10. Bind Weather Actions
    const btnWeather = document.getElementById('btn-weather');
    if (btnWeather) {
        btnWeather.addEventListener('click', () => {
            document.body.classList.toggle('weather-rain');
            const isRain = document.body.classList.contains('weather-rain');
            
            // Save preference to localStorage
            localStorage.setItem('weather_preference', isRain ? 'rain' : 'clear');
            
            // Update icons & text
            const iconClear = btnWeather.querySelector('.weather-icon-clear');
            const iconRain = btnWeather.querySelector('.weather-icon-rain');
            if (iconClear && iconRain) {
                iconClear.style.display = isRain ? 'none' : 'block';
                iconRain.style.display = isRain ? 'block' : 'none';
            }
            const statusTxt = document.getElementById('txt-weather-status');
            if (statusTxt) statusTxt.textContent = isRain ? "Rain: ON" : "Rain: OFF";
            btnWeather.style.color = isRain ? '#3b82f6' : 'var(--text-primary)';
            btnWeather.style.borderColor = isRain ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-color)';
            
            // Log action to AI logs
            if (simInstance) {
                if (isRain) {
                    simInstance.weather = 'rain';
                    simInstance.logAIAction("🌧️ Precipitation system activated. Road speed coefficients set to 0.70x for safe-braking calibration.", "warning");
                } else {
                    simInstance.weather = 'clear';
                    simInstance.logAIAction("☀️ Weather cleared. Standard road dry friction coefficients restored.", "success");
                }
                renderLogs();
            }
        });
        
        // Restore saved weather preference
        const savedWeather = localStorage.getItem('weather_preference');
        if (savedWeather === 'rain') {
            document.body.classList.add('weather-rain');
            const iconClear = btnWeather.querySelector('.weather-icon-clear');
            const iconRain = btnWeather.querySelector('.weather-icon-rain');
            if (iconClear && iconRain) {
                iconClear.style.display = 'none';
                iconRain.style.display = 'block';
            }
            const statusTxt = document.getElementById('txt-weather-status');
            if (statusTxt) statusTxt.textContent = "Rain: ON";
            btnWeather.style.color = '#3b82f6';
            btnWeather.style.borderColor = 'rgba(59, 130, 246, 0.4)';
        }
    }
    
    // 11. Bind Audio Actions
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
        btnAudio.addEventListener('click', () => {
            document.body.classList.toggle('audio-muted');
            const isMuted = document.body.classList.contains('audio-muted');
            
            // Save preference to localStorage
            localStorage.setItem('audio_preference', isMuted ? 'muted' : 'unmuted');
            
            // Update icons & text
            const iconOn = btnAudio.querySelector('.audio-icon-on');
            const iconOff = btnAudio.querySelector('.audio-icon-off');
            if (iconOn && iconOff) {
                iconOn.style.display = isMuted ? 'none' : 'block';
                iconOff.style.display = isMuted ? 'block' : 'none';
            }
            const statusTxt = document.getElementById('txt-audio-status');
            if (statusTxt) statusTxt.textContent = isMuted ? "Sound: OFF" : "Sound: ON";
            btnAudio.style.color = isMuted ? 'var(--text-muted)' : 'var(--text-primary)';
            
            // Stop sound immediately if muted
            if (isMuted && window.sirenSynth) {
                window.sirenSynth.stop();
            } else if (!isMuted && window.sirenSynth && simInstance && simInstance.emergencyActive) {
                window.sirenSynth.start();
            }
        });
        
        // Restore saved audio preference
        const savedAudio = localStorage.getItem('audio_preference');
        if (savedAudio === 'muted') {
            document.body.classList.add('audio-muted');
            const iconOn = btnAudio.querySelector('.audio-icon-on');
            const iconOff = btnAudio.querySelector('.audio-icon-off');
            if (iconOn && iconOff) {
                iconOn.style.display = 'none';
                iconOff.style.display = 'block';
            }
            const statusTxt = document.getElementById('txt-audio-status');
            if (statusTxt) statusTxt.textContent = "Sound: OFF";
        }
    }
    
    // 12. Bind Heatmap Actions
    const btnHeatmap = document.getElementById('btn-heatmap');
    if (btnHeatmap) {
        btnHeatmap.addEventListener('click', () => {
            document.body.classList.toggle('heatmap-on');
            const isActive = document.body.classList.contains('heatmap-on');
            
            // Save preference to localStorage
            localStorage.setItem('heatmap_preference', isActive ? 'on' : 'off');
            
            // Update icon color & text
            const icon = btnHeatmap.querySelector('.heatmap-icon');
            if (icon) {
                icon.style.color = isActive ? '#f97316' : 'var(--text-primary)';
            }
            const statusTxt = document.getElementById('txt-heatmap-status');
            if (statusTxt) statusTxt.textContent = isActive ? "Heatmap: ON" : "Heatmap: OFF";
            btnHeatmap.style.color = isActive ? '#f97316' : 'var(--text-primary)';
            btnHeatmap.style.borderColor = isActive ? 'rgba(249, 115, 22, 0.4)' : 'var(--border-color)';
            
            // Update simulation state
            if (simInstance) {
                simInstance.heatmapActive = isActive;
                if (isActive) {
                    simInstance.logAIAction("🔴 Real-Time Congestion Heatmap overlay activated.", "system");
                } else {
                    simInstance.logAIAction("🟢 Congestion Heatmap deactivated.", "system");
                }
                renderLogs();
            }
        });
        
        // Restore saved heatmap preference
        const savedHeatmap = localStorage.getItem('heatmap_preference');
        if (savedHeatmap === 'on') {
            document.body.classList.add('heatmap-on');
            const icon = btnHeatmap.querySelector('.heatmap-icon');
            if (icon) {
                icon.style.color = '#f97316';
            }
            const statusTxt = document.getElementById('txt-heatmap-status');
            if (statusTxt) statusTxt.textContent = "Heatmap: ON";
            btnHeatmap.style.color = '#f97316';
            btnHeatmap.style.borderColor = 'rgba(249, 115, 22, 0.4)';
            
            // Sync simulation state
            setTimeout(() => {
                if (simInstance) simInstance.heatmapActive = true;
            }, 300);
        }
    }
    
    // 13. Bind Rush Hour Actions
    const btnToggleRush = document.getElementById('btn-toggle-rush');
    if (btnToggleRush) {
        btnToggleRush.addEventListener('click', () => {
            if (!simInstance) return;
            
            simInstance.rushHourActive = !simInstance.rushHourActive;
            const isActive = simInstance.rushHourActive;
            
            // Update button visual styles
            const icon = btnToggleRush.querySelector('.rush-icon');
            const label = btnToggleRush.querySelector('span');
            
            if (isActive) {
                btnToggleRush.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-hover))';
                btnToggleRush.style.color = '#fff';
                btnToggleRush.style.borderColor = 'transparent';
                if (label) label.textContent = "Conclude Rush Hour";
                if (icon) icon.style.stroke = '#fff';
                
                simInstance.logAIAction("📈 Campus peak rush hour simulated! High-density vehicle arrivals initiated on all crossroads.", "warning");
                if (window.speakAnnouncement) {
                    window.speakAnnouncement("Attention: Rush hour mode activated. Campus traffic density is high. AI scheduling is adapting green light durations.");
                }
                
                // Automatically resume simulation to show the rush
                if (simInstance.isPaused) {
                    simInstance.start();
                    const btnPause = document.getElementById('btn-sim-pause');
                    if (btnPause) {
                        btnPause.querySelector('span').textContent = "Pause";
                        const iconPause = btnPause.querySelector('i');
                        if (iconPause && typeof lucide !== 'undefined') iconPause.setAttribute('data-lucide', 'pause');
                    }
                }
            } else {
                btnToggleRush.style.background = 'var(--primary-alpha)';
                btnToggleRush.style.color = 'var(--primary)';
                btnToggleRush.style.borderColor = 'var(--primary)';
                if (label) label.textContent = "Simulate Rush Hour";
                if (icon) icon.style.stroke = 'currentColor';
                
                simInstance.logAIAction("📉 Campus rush hour concluded. Traffic spawn rates returned to baseline.", "success");
                if (window.speakAnnouncement) {
                    window.speakAnnouncement("Campus rush hour concluded. Traffic spawn rates returned to baseline.");
                }
            }
            
            if (typeof lucide !== 'undefined') lucide.createImages();
            renderLogs();
        });
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
            // Re-render challans when entering portal
            if (targetTab === 'challan') {
                updateChallanPortal();
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
    } else if (tab === 'challan') {
        titleEl.textContent = "Automated E-Challan Portal";
        subtitleEl.textContent = "AI-powered detection log of campus traffic speed and signal violations.";
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
                if (window.speakAnnouncement) {
                    window.speakAnnouncement("AI adaptive scheduling engine enabled.");
                }
                if (simInstance.isPaused) simInstance.draw();
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
                if (window.speakAnnouncement) {
                    window.speakAnnouncement("Switching to fixed interval timer mode.");
                }
                if (simInstance.isPaused) simInstance.draw();
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
                if (window.speakAnnouncement) {
                    window.speakAnnouncement("Manual signal override active.");
                }
                if (simInstance.isPaused) simInstance.draw();
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
            if (simInstance) {
                simInstance.spawnVehicle(null, 'ambulance');
                // Automatically resume simulation to show emergency in action
                if (simInstance.isPaused) {
                    simInstance.start();
                    const btnPause = document.getElementById('btn-sim-pause');
                    if (btnPause) {
                        btnPause.querySelector('span').textContent = "Pause";
                        const icon = btnPause.querySelector('i');
                        if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
                    }
                    if (typeof lucide !== 'undefined') lucide.createImages();
                }
            }
        });
    }

    // Spawn pedestrian
    const btnPed = document.getElementById('btn-spawn-pedestrian');
    if (btnPed) {
        btnPed.addEventListener('click', () => {
            if (simInstance) {
                simInstance.triggerPedestrianCrossing();
                // Automatically resume simulation to show pedestrian action
                if (simInstance.isPaused) {
                    simInstance.start();
                    const btnPause = document.getElementById('btn-sim-pause');
                    if (btnPause) {
                        btnPause.querySelector('span').textContent = "Pause";
                        const icon = btnPause.querySelector('i');
                        if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
                    }
                    if (typeof lucide !== 'undefined') lucide.createImages();
                }
            }
        });
    }

    // Spawn student bike
    const btnBike = document.getElementById('btn-spawn-bike');
    if (btnBike) {
        btnBike.addEventListener('click', () => {
            if (simInstance) {
                simInstance.spawnVehicle(null, 'bike');
                // Automatically resume simulation to show bike action
                if (simInstance.isPaused) {
                    simInstance.start();
                    const btnPause = document.getElementById('btn-sim-pause');
                    if (btnPause) {
                        btnPause.querySelector('span').textContent = "Pause";
                        const icon = btnPause.querySelector('i');
                        if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
                    }
                    if (typeof lucide !== 'undefined') lucide.createImages();
                }
            }
        });
    }

    // Spawn auto-rickshaw
    const btnAuto = document.getElementById('btn-spawn-auto');
    if (btnAuto) {
        btnAuto.addEventListener('click', () => {
            if (simInstance) {
                simInstance.spawnVehicle(null, 'auto');
                // Automatically resume simulation to show action
                if (simInstance.isPaused) {
                    simInstance.start();
                    const btnPause = document.getElementById('btn-sim-pause');
                    if (btnPause) {
                        btnPause.querySelector('span').textContent = "Pause";
                        const icon = btnPause.querySelector('i');
                        if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
                    }
                    if (typeof lucide !== 'undefined') lucide.createImages();
                }
            }
        });
    }

    // Spawn manual bicycle
    const btnCycle = document.getElementById('btn-spawn-cycle');
    if (btnCycle) {
        btnCycle.addEventListener('click', () => {
            if (simInstance) {
                simInstance.spawnVehicle(null, 'cycle');
                // Automatically resume simulation to show action
                if (simInstance.isPaused) {
                    simInstance.start();
                    const btnPause = document.getElementById('btn-sim-pause');
                    if (btnPause) {
                        btnPause.querySelector('span').textContent = "Pause";
                        const icon = btnPause.querySelector('i');
                        if (icon && typeof lucide !== 'undefined') icon.setAttribute('data-lucide', 'pause');
                    }
                    if (typeof lucide !== 'undefined') lucide.createImages();
                }
            }
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

    // Traffic Preset Selection Dropdown
    const selectTrafficPreset = document.getElementById('select-traffic-preset');
    if (selectTrafficPreset) {
        selectTrafficPreset.addEventListener('change', () => {
            let val = selectTrafficPreset.value;
            if (val === 'custom') return;
            
            let targetPct = 50; // default medium
            if (val === 'low') targetPct = 25;
            if (val === 'heavy') targetPct = 85;
            
            const directionsList = ['north', 'south', 'east', 'west'];
            directionsList.forEach(dir => {
                const slider = document.getElementById(`slider-density-${dir}`);
                const valueDisplay = document.getElementById(`val-density-${dir}`);
                if (slider) {
                    slider.value = targetPct;
                    let uppercaseDir = dir.toUpperCase();
                    if (simInstance) {
                        simInstance.spawnProbability[uppercaseDir] = (targetPct / 4000);
                    }
                    
                    let label = "Medium";
                    if (targetPct < 30) label = `Low (${targetPct}%)`;
                    else if (targetPct > 75) label = `Rush Hour (${targetPct}%)`;
                    else label = `Medium (${targetPct}%)`;
                    
                    if (valueDisplay) valueDisplay.textContent = label;
                }
            });
            
            if (simInstance) {
                simInstance.logAIAction(`Traffic preset changed to ${val.toUpperCase()} (${targetPct}% density).`, "system");
            }
        });
    }

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
                
                // Reset select preset to custom
                if (selectTrafficPreset) selectTrafficPreset.value = 'custom';
                
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
    const btnExportJson = document.getElementById('btn-export-json');
    const btnExportPdf = document.getElementById('btn-export-pdf');
    if (btnExportCsv) btnExportCsv.addEventListener('click', exportCSVReport);
    if (btnExportJson) btnExportJson.addEventListener('click', exportJSONReport);
    if (btnExportPdf) btnExportPdf.addEventListener('click', exportPDFSummary);

    const sliderSensorRange = document.getElementById('slider-sensor-range');
    const valSensorRange = document.getElementById('val-sensor-range');
    if (sliderSensorRange) {
        sliderSensorRange.addEventListener('input', () => {
            let meters = parseInt(sliderSensorRange.value);
            if (simInstance) {
                simInstance.sensorRange = meters;
                if (simInstance.isPaused) simInstance.draw();
            }
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
    csv += `Exported At,${new Date().toLocaleString()}\n`;
    csv += `Control Mode,${simInstance.controlMode}\n`;
    csv += `Average Wait Time (s),${avgWait.toFixed(2)}\n`;
    csv += `Total Vehicles Processed,${stats.totalVehicles}\n`;
    csv += `Total North-South Throughput,${stats.throughputNS}\n`;
    csv += `Total East-West Throughput,${stats.throughputEW}\n`;
    csv += `Emissions Saved (kg CO2),${stats.emissionsSaved.toFixed(3)}\n\n`;
    
    // Detailed vehicles log
    csv += "Processed Vehicles Records:\n";
    csv += "Timestamp,Vehicle License Plate,Vehicle Type,Junction Direction,Speed (km/h),Waiting Time (s),Challan Issued?\n";
    
    let logRecords = stats.processedVehiclesLog || [];
    logRecords.forEach(v => {
        csv += `${v.timestamp},${v.id},${v.type},${v.direction},${v.speed},${v.waitTime},${v.challan}\n`;
    });
    csv += "\n";
    
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

// Evaluation Log JSON Exporter
function exportJSONReport() {
    if (!simInstance) return;
    
    let stats = simInstance.stats;
    let avgWait = stats.totalVehicles > 0 ? (stats.totalWaitTime / stats.totalVehicles) : 0;
    
    let reportData = {
        title: "AI Smart Traffic Control System - Simulation Evaluation Profile",
        timestamp: new Date().toISOString(),
        controlMode: simInstance.controlMode,
        summaryMetrics: {
            averageWaitTimeSeconds: parseFloat(avgWait.toFixed(2)),
            totalVehiclesProcessed: stats.totalVehicles,
            throughputNS: stats.throughputNS,
            throughputEW: stats.throughputEW,
            emissionsSavedKgCO2: parseFloat(stats.emissionsSaved.toFixed(3))
        },
        processedVehiclesRecords: stats.processedVehiclesLog || [],
        systemLogsActivityHistory: stats.aiEventLogs
    };
    
    // Download Blob
    const blob = new Blob([JSON.stringify(reportData, null, 4)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `smart_traffic_evaluation_${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Futuristic Constellation Network Background Animation on Login Page
function initLoginBgAnimation() {
    const canvas = document.getElementById('login-bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    const particles = [];
    const particleCount = 45;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: 1.2 + Math.random() * 1.8
        });
    }
    
    function animate() {
        const loginPortal = document.getElementById('login-portal');
        if (loginPortal && loginPortal.style.display === 'none') {
            return; // stop execution loop once logged in
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw constellation links
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        // Draw and update node coordinates
        ctx.fillStyle = 'rgba(0, 242, 254, 0.3)';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });
        
        requestAnimationFrame(animate);
    }
    animate();
}

// E-Challan system database & actions
window.eChallans = [];

window.triggerChallan = function(vehicleId, vehicleType, violationType, amount) {
    // Avoid duplicate triggers for the same vehicle in a short window
    const recentDuplicate = window.eChallans.find(c => c.vehicleId === vehicleId && c.violationType === violationType && (Date.now() - c.timestampRaw < 10000));
    if (recentDuplicate) return;

    const challanId = `#CH-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const newChallan = {
        id: challanId,
        vehicleId: vehicleId,
        vehicleType: vehicleType,
        violationType: violationType,
        amount: amount,
        time: timeStr,
        timestampRaw: Date.now(),
        status: 'Pending'
    };

    window.eChallans.unshift(newChallan); // Add to top
    
    // Log in AI Action Log
    if (simInstance) {
        simInstance.logAIAction(`📸 Violation Alert: ${violationType} by vehicle ${vehicleId}. Fine: ₹${amount} issued.`, "error");
        if (typeof renderLogs === 'function') renderLogs();
    }

    // Play citation sound if audio is unmuted and AudioContext is active
    const isMuted = document.body.classList.contains('audio-muted');
    if (!isMuted) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'triangle';
            // double beep like speed camera
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1000, audioCtx.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.warn("Could not play citation sound:", e);
        }
    }

    // Sync UI elements
    updateChallanPortal();
};

function updateChallanPortal() {
    const tableBody = document.getElementById('challan-table-body');
    if (!tableBody) return;

    if (window.eChallans.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📋</div>
                    <p>No traffic violations detected yet.</p>
                    <p style="font-size: 0.8rem; margin-top: 0.25rem;">Speeding vehicles or red light jumps will automatically issue fine receipts.</p>
                </td>
            </tr>
        `;
        document.getElementById('c-total-fines').textContent = "₹0";
        document.getElementById('c-total-count').textContent = "0 Violations";
        document.getElementById('c-pending-fines').textContent = "₹0";
        document.getElementById('c-pending-count').textContent = "0 Unpaid";
        document.getElementById('c-paid-fines').textContent = "₹0";
        document.getElementById('c-paid-count').textContent = "0 Payments";
        document.getElementById('c-recovery-rate').textContent = "0%";
        
        const badge = document.getElementById('challan-notification-badge');
        if (badge) {
            badge.style.display = 'none';
            badge.textContent = '0';
        }
        return;
    }

    // Compute metrics
    let totalAmount = 0;
    let pendingAmount = 0;
    let paidAmount = 0;
    let paidCount = 0;

    window.eChallans.forEach(c => {
        totalAmount += c.amount;
        if (c.status === 'Paid') {
            paidAmount += c.amount;
            paidCount++;
        } else {
            pendingAmount += c.amount;
        }
    });

    let recoveryRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    // Update cards
    document.getElementById('c-total-fines').textContent = `₹${totalAmount}`;
    document.getElementById('c-total-count').textContent = `${window.eChallans.length} Violations`;
    document.getElementById('c-pending-fines').textContent = `₹${pendingAmount}`;
    document.getElementById('c-pending-count').textContent = `${window.eChallans.length - paidCount} Unpaid`;
    document.getElementById('c-paid-fines').textContent = `₹${paidAmount}`;
    document.getElementById('c-paid-count').textContent = `${paidCount} Payments`;
    document.getElementById('c-recovery-rate').textContent = `${recoveryRate}%`;

    // Update notification badge count (unpaid challans only)
    const unpaidCount = window.eChallans.length - paidCount;
    const badge = document.getElementById('challan-notification-badge');
    if (badge) {
        if (unpaidCount > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = unpaidCount;
        } else {
            badge.style.display = 'none';
            badge.textContent = '0';
        }
    }

    // Render table rows
    tableBody.innerHTML = window.eChallans.map((c, index) => {
        const badgeClass = c.status === 'Paid' ? 'bg-success' : 'bg-warning';
        const actionBtn = c.status === 'Paid' 
            ? `<span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">✔️ Paid</span>`
            : `<button class="btn btn-sm btn-success pay-challan-btn" data-index="${index}" style="padding: 2px 8px; font-size: 0.72rem; border-radius: 4px;">💸 Pay Fine</button>`;

        const vehicleEmojiMap = {
            'car': '🚗 Car',
            'bike': '🏍️ Motorbike',
            'cycle': '🚲 Bicycle',
            'auto': '🛺 Auto-Rickshaw',
            'shuttle': '🚐 Shuttle Bus',
            'ambulance': '🚑 Ambulance'
        };
        const vehicleLabel = vehicleEmojiMap[c.vehicleType] || `🚗 ${c.vehicleType}`;

        return `
            <tr style="${c.status === 'Paid' ? 'opacity: 0.7;' : ''}">
                <td style="font-family: var(--font-mono); font-weight: bold; color: var(--primary);">${c.id}</td>
                <td style="font-family: var(--font-mono); font-size: 0.8rem;">${c.vehicleId}</td>
                <td><span style="text-transform: capitalize;">${vehicleLabel}</span></td>
                <td style="color: var(--danger); font-weight: 500;">🚨 ${c.violationType}</td>
                <td style="font-weight: bold;">₹${c.amount}</td>
                <td style="font-size: 0.8rem; color: var(--text-muted);">${c.time}</td>
                <td><span class="badge ${badgeClass}">${c.status}</span></td>
                <td style="text-align: right;">${actionBtn}</td>
            </tr>
        `;
    }).join('');

    // Attach click listeners to "Pay Fine" buttons
    const payBtns = tableBody.querySelectorAll('.pay-challan-btn');
    payBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-index'));
            payChallan(idx);
        });
    });
}

function payChallan(index) {
    if (index < 0 || index >= window.eChallans.length) return;
    
    window.eChallans[index].status = 'Paid';

    // Play register cash register sound if unmuted
    const isMuted = document.body.classList.contains('audio-muted');
    if (!isMuted) {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
        } catch (e) {
            console.warn("Could not play pay sound:", e);
        }
    }

    // Refresh display
    updateChallanPortal();
}
