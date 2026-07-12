/* AI Smart Traffic Control Simulation Engine */

// Utility for cross-browser rounded rectangle compatibility
function safeRoundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radius);
    } else {
        // Fallback for older browser engines
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }
}

class TrafficLight {
    constructor(direction, x, y) {
        this.direction = direction; // 'NS' or 'EW'
        this.x = x;
        this.y = y;
        this.state = 'RED'; // 'RED', 'YELLOW', 'GREEN'
        this.timer = 0; // seconds remaining in current state
    }
}

class Vehicle {
    constructor(id, type, lane, x, y, speed, targetSpeed, color, length = 28, width = 16) {
        this.id = id;
        this.type = type; // 'car', 'shuttle', 'ambulance'
        this.lane = lane; // 'NORTH', 'SOUTH', 'EAST', 'WEST' (relative to start position)
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.targetSpeed = targetSpeed;
        this.acceleration = 0.08;
        this.deceleration = 0.2;
        this.color = color;
        this.length = length;
        this.width = width;
        
        this.waitingTime = 0; // in frames or seconds
        this.isStopped = false;
        this.active = true;
        this.hasExited = false;
        
        // Physics direction multipliers
        this.dx = 0;
        this.dy = 0;
        if (lane === 'WEST') { this.dx = 1; this.dy = 0; } // Spawns West (Left), moves East (Right)
        if (lane === 'EAST') { this.dx = -1; this.dy = 0; } // Spawns East (Right), moves West (Left)
        if (lane === 'NORTH') { this.dx = 0; this.dy = 1; } // Spawns North (Top), moves South (Down)
        if (lane === 'SOUTH') { this.dx = 0; this.dy = -1; } // Spawns South (Bottom), moves North (Up)
        
        // Blinking light state for emergency siren
        this.sirenTimer = 0;
    }

    update(simSpeed, leadVehicle, lightState, stopLineX, stopLineY, sensorRange) {
        let actualSpeedLimit = this.targetSpeed * simSpeed;
        let actualAccel = this.acceleration * simSpeed;
        let actualDecel = this.deceleration * simSpeed;

        this.sirenTimer += 0.2 * simSpeed;
        
        // Find distance to stop line
        let distToStop = Infinity;
        if (this.lane === 'WEST') distToStop = stopLineX - this.x - this.length/2;
        if (this.lane === 'EAST') distToStop = this.x - stopLineX - this.length/2;
        if (this.lane === 'NORTH') distToStop = stopLineY - this.y - this.length/2;
        if (this.lane === 'SOUTH') distToStop = this.y - stopLineY - this.length/2;

        let shouldStopForLight = false;
        // Light check: Red or yellow signals stop before the stop line
        if (lightState === 'RED' || lightState === 'YELLOW') {
            // Stop only if we are approaching and not yet passed the line
            if (distToStop > -5 && distToStop < sensorRange) {
                shouldStopForLight = true;
            }
        }

        // Check distance to lead vehicle
        let distToLead = Infinity;
        if (leadVehicle) {
            if (this.lane === 'WEST') distToLead = leadVehicle.x - leadVehicle.length/2 - (this.x + this.length/2);
            if (this.lane === 'EAST') distToLead = this.x - this.length/2 - (leadVehicle.x + leadVehicle.length/2);
            if (this.lane === 'NORTH') distToLead = leadVehicle.y - leadVehicle.length/2 - (this.y + this.length/2);
            if (this.lane === 'SOUTH') distToLead = this.y - this.length/2 - (leadVehicle.y + leadVehicle.length/2);
        }

        // Decision logic: Stop or go
        let targetVelocity = actualSpeedLimit;
        
        // Emergency ambulance overrides traffic signal (but still respects lead vehicles)
        if (shouldStopForLight && this.type !== 'ambulance') {
            let stopFactor = Math.max(0, distToStop - 5);
            targetVelocity = Math.min(targetVelocity, (stopFactor / 40) * actualSpeedLimit);
        }

        // Adjust speed for lead vehicle (safe following distance)
        const safeGap = 20;
        if (distToLead < 100) {
            if (distToLead <= safeGap) {
                targetVelocity = 0;
            } else {
                // Smooth deceleration behind leading car
                let leadFactor = (distToLead - safeGap) / 80;
                targetVelocity = Math.min(targetVelocity, leadFactor * leadVehicle.speed);
            }
        }

        // Apply physics
        if (this.speed < targetVelocity) {
            this.speed += actualAccel;
            if (this.speed > targetVelocity) this.speed = targetVelocity;
        } else if (this.speed > targetVelocity) {
            this.speed -= actualDecel;
            if (this.speed < targetVelocity) this.speed = targetVelocity;
        }

        // Update positions
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Waiting time calculation
        if (this.speed < 0.1 && distToStop > -10 && distToStop < sensorRange + 10) {
            this.isStopped = true;
            this.waitingTime += (1 / 60) * simSpeed; // 60 FPS update logic
        } else {
            this.isStopped = false;
        }

        // Check if out of canvas bounds
        if (this.x < -100 || this.x > 900 || this.y < -100 || this.y > 600) {
            this.active = false;
            this.hasExited = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Rotate drawing based on lane heading
        if (this.lane === 'EAST') ctx.rotate(Math.PI);
        if (this.lane === 'NORTH') ctx.rotate(Math.PI / 2);
        if (this.lane === 'SOUTH') ctx.rotate(-Math.PI / 2);

        // Shadow
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';

        // Draw chassis
        ctx.fillStyle = this.color;
        ctx.beginPath();
        safeRoundRect(ctx, -this.length/2, -this.width/2, this.length, this.width, 4);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-this.length/3, -this.width/2 - 1, 6, 2);
        ctx.fillRect(this.length/4, -this.width/2 - 1, 6, 2);
        ctx.fillRect(-this.length/3, this.width/2 - 1, 6, 2);
        ctx.fillRect(this.length/4, this.width/2 - 1, 6, 2);

        // Windshield and Windows
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        safeRoundRect(ctx, -this.length/8, -this.width/2 + 2, this.length/2, this.width - 4, 2);
        ctx.fill();

        // Front Windshield Glass highlight
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(this.length/8, -this.width/2 + 3, 3, this.width - 6);

        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(this.length/2 - 2, -this.width/2 + 2, 2, 3);
        ctx.fillRect(this.length/2 - 2, this.width/2 - 5, 2, 3);

        // Siren for Ambulance
        if (this.type === 'ambulance') {
            // Blinking light
            let sirenColor = Math.floor(this.sirenTimer) % 2 === 0 ? '#ef4444' : '#3b82f6';
            ctx.fillStyle = sirenColor;
            ctx.beginPath();
            ctx.arc(-2, 0, 4, 0, Math.PI * 2);
            ctx.fill();
            // Pulse glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = sirenColor;
            ctx.strokeStyle = sirenColor;
            ctx.strokeRect(-this.length/2 - 2, -this.width/2 - 2, this.length + 4, this.width + 4);
        }

        ctx.restore();
    }
}

class Pedestrian {
    constructor(x, y, startSide, targetSide, laneToCross) {
        this.x = x;
        this.y = y;
        this.startSide = startSide;
        this.targetSide = targetSide;
        this.laneToCross = laneToCross; // 'NS' or 'EW'
        this.speed = 1.0;
        this.radius = 4;
        this.color = '#a7f3d0'; // Mint
        this.active = true;
        this.waiting = true;
    }

    update(simSpeed, pedLightState, crosswalkBounds) {
        let actualSpeed = this.speed * simSpeed;
        
        if (this.waiting) {
            if (pedLightState === 'WALK') {
                this.waiting = false;
            }
            return;
        }

        // Move across road
        if (this.startSide === 'LEFT') {
            this.x += actualSpeed;
            if (this.x > crosswalkBounds.target) {
                this.active = false;
            }
        } else if (this.startSide === 'RIGHT') {
            this.x -= actualSpeed;
            if (this.x < crosswalkBounds.target) {
                this.active = false;
            }
        } else if (this.startSide === 'TOP') {
            this.y += actualSpeed;
            if (this.y > crosswalkBounds.target) {
                this.active = false;
            }
        } else if (this.startSide === 'BOTTOM') {
            this.y -= actualSpeed;
            if (this.y < crosswalkBounds.target) {
                this.active = false;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class IntersectionSim {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Sim Dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Intersection Geometry Constants
        this.roadWidth = 120;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Lane Centerlines
        this.lanes = {
            // Inbound lanes (spawning side -> intersection center)
            WEST:  { y: this.centerY + 30, stopX: this.centerX - 70, lightGroup: 'EW', dirName: 'Hostel Zone (W)' },
            EAST:  { y: this.centerY - 30, stopX: this.centerX + 70, lightGroup: 'EW', dirName: 'Academic Blk (E)' },
            NORTH: { x: this.centerX - 30, stopY: this.centerY - 70, lightGroup: 'NS', dirName: 'Main Gate (N)' },
            SOUTH: { x: this.centerX + 30, stopY: this.centerY + 70, lightGroup: 'NS', dirName: 'Library Rd (S)' }
        };

        // Pedestrian crosswalk regions
        this.crosswalks = {
            NS_NORTH: { startX: this.centerX - 60, endX: this.centerX + 60, y: this.centerY - 90, active: false },
            NS_SOUTH: { startX: this.centerX - 60, endX: this.centerX + 60, y: this.centerY + 90, active: false }
        };
        
        // State parameters
        this.simSpeed = 1.0;
        this.isPaused = false;
        this.controlMode = 'AI'; // 'AI' or 'FIXED'
        
        // AI Algorithm Constants
        this.sensorRange = 120; // pixels from stop line
        this.minGreen = 5; // seconds
        this.maxGreen = 45; // seconds
        this.pedDuration = 12; // seconds
        this.spawnProbability = {
            NORTH: 0.012,
            SOUTH: 0.012,
            EAST: 0.012,
            WEST: 0.012
        };
        
        // Core objects
        this.vehicles = [];
        this.pedestrians = [];
        this.lights = {
            NS: new TrafficLight('NS', this.centerX + 70, this.centerY - 80),
            EW: new TrafficLight('EW', this.centerX - 80, this.centerY - 70)
        };
        
        // Initialize Lights
        this.lights.NS.state = 'GREEN';
        this.lights.NS.timer = 15.0;
        this.lights.EW.state = 'RED';
        this.lights.EW.timer = 15.0;
        
        // Metrics Statistics
        this.stats = {
            totalVehicles: 0,
            totalWaitTime: 0,
            waitTimesHistory: [],
            throughputNS: 0,
            throughputEW: 0,
            emissionsSaved: 0, // kg
            currentAIQueueScoreNS: 0,
            currentAIQueueScoreEW: 0,
            systemMode: 'AI OPTIMIZED',
            aiEventLogs: []
        };
        
        this.pedestrianCrossingRequest = false;
        this.pedestrianSignalState = 'DONT_WALK'; // 'WALK' or 'DONT_WALK'
        this.pedTimer = 0;
        
        // Animation Handle
        this.animationId = null;
        
        // Auto Spawner loop
        this.vehicleIdCounter = 0;
        this.frameCounter = 0;

        // Custom emergency flags
        this.emergencyActive = false;
        this.emergencyLane = null;
    }

    logAIAction(message, type = 'ai') {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
        this.stats.aiEventLogs.unshift({ time: timeStr, text: message, type: type });
        if (this.stats.aiEventLogs.length > 25) this.stats.aiEventLogs.pop();
        
        // Call global dashboard log updater if it exists
        if (window.updateDashboardLogs) {
            window.updateDashboardLogs();
        }
    }

    start() {
        this.isPaused = false;
        this.loop();
    }

    pause() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    reset() {
        this.vehicles = [];
        this.pedestrians = [];
        this.vehicleIdCounter = 0;
        this.frameCounter = 0;
        this.pedestrianCrossingRequest = false;
        this.pedestrianSignalState = 'DONT_WALK';
        this.emergencyActive = false;
        this.emergencyLane = null;
        
        this.lights.NS.state = 'GREEN';
        this.lights.NS.timer = 15.0;
        this.lights.EW.state = 'RED';
        this.lights.EW.timer = 15.0;
        
        this.stats.totalVehicles = 0;
        this.stats.totalWaitTime = 0;
        this.stats.throughputNS = 0;
        this.stats.throughputEW = 0;
        this.stats.emissionsSaved = 0;
        this.stats.aiEventLogs = [];
        this.logAIAction("Simulation stats reset successfully.", "system");
        
        this.draw();
    }

    // Spawn regular car
    spawnVehicle(forcedLane = null, forcedType = 'car') {
        const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        let lane = forcedLane || directions[Math.floor(Math.random() * directions.length)];
        
        let type = forcedType;
        let color = '#38bdf8'; // Default Cyan
        let targetSpeed = 1.6 + Math.random() * 0.6; // random target speed
        let sizeWidth = 15;
        let sizeLength = 26;

        if (type === 'ambulance') {
            color = '#ef4444'; // Red base for Emergency
            targetSpeed = 2.8;
            this.emergencyActive = true;
            this.emergencyLane = lane;
            this.logAIAction(`🚨 Emergency detected on ${this.lanes[lane].dirName}! Priority cycle requested.`, 'danger');
        } else if (Math.random() < 0.15) {
            // Heavy Campus Shuttle
            type = 'shuttle';
            color = '#f59e0b'; // Amber shuttle
            targetSpeed = 1.2;
            sizeWidth = 19;
            sizeLength = 40;
        } else {
            // Random cool color palettes for student/staff cars
            const colors = ['#00f2fe', '#10b981', '#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6'];
            color = colors[Math.floor(Math.random() * colors.length)];
        }

        // Check starting coordinates based on direction
        let x, y;
        if (lane === 'WEST') { x = -40; y = this.lanes.WEST.y; }
        if (lane === 'EAST') { x = this.width + 40; y = this.lanes.EAST.y; }
        if (lane === 'NORTH') { x = this.lanes.NORTH.x; y = -40; }
        if (lane === 'SOUTH') { x = this.lanes.SOUTH.x; y = this.height + 40; }

        // Prevent spawning directly on top of another car at the start line
        let spawnClear = true;
        for (let v of this.vehicles) {
            if (v.lane === lane) {
                let dist = 0;
                if (lane === 'WEST') dist = Math.abs(v.x - x);
                if (lane === 'EAST') dist = Math.abs(v.x - x);
                if (lane === 'NORTH') dist = Math.abs(v.y - y);
                if (lane === 'SOUTH') dist = Math.abs(v.y - y);
                if (dist < 60) {
                    spawnClear = false;
                    break;
                }
            }
        }

        if (spawnClear) {
            this.vehicleIdCounter++;
            let vehicle = new Vehicle(this.vehicleIdCounter, type, lane, x, y, targetSpeed, targetSpeed, color, sizeLength, sizeWidth);
            this.vehicles.push(vehicle);
        }
    }

    triggerPedestrianCrossing() {
        if (this.pedestrianCrossingRequest) return; // already pending
        this.pedestrianCrossingRequest = true;
        this.logAIAction("Pedestrian button pressed on Academic crosswalk. Active signal queue updated.", "ai");
    }

    forceNSGreen() {
        this.lights.NS.state = 'GREEN';
        this.lights.NS.timer = 999.0;
        this.lights.EW.state = 'RED';
        this.lights.EW.timer = 0.0;
        this.logAIAction("Manual Override: North-South green light forced.", "system");
    }

    forceEWGreen() {
        this.lights.EW.state = 'GREEN';
        this.lights.EW.timer = 999.0;
        this.lights.NS.state = 'RED';
        this.lights.NS.timer = 0.0;
        this.logAIAction("Manual Override: East-West green light forced.", "system");
    }

    spawnPedestrians() {
        // Spawn 3-5 pedestrian dots waiting on North crosswalk
        let count = 3 + Math.floor(Math.random() * 3);
        let side = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
        let y = this.centerY - 90; // North crosswalk
        
        for (let i = 0; i < count; i++) {
            let startX = side === 'LEFT' ? this.centerX - 100 - i*10 : this.centerX + 100 + i*10;
            let targetX = side === 'LEFT' ? this.centerX + 95 : this.centerX - 95;
            let ped = new Pedestrian(startX, y, side, side === 'LEFT' ? 'RIGHT' : 'LEFT', 'NS');
            this.pedestrians.push(ped);
        }
        
        // Spawn on South crosswalk
        side = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
        y = this.centerY + 90;
        for (let i = 0; i < count; i++) {
            let startX = side === 'LEFT' ? this.centerX - 100 - i*10 : this.centerX + 100 + i*10;
            let targetX = side === 'LEFT' ? this.centerX + 95 : this.centerX - 95;
            let ped = new Pedestrian(startX, y, side, side === 'LEFT' ? 'RIGHT' : 'LEFT', 'NS');
            this.pedestrians.push(ped);
        }
    }

    // Count vehicles within AI camera sensors range
    countQueuedVehicles(lane) {
        let count = 0;
        let maxWait = 0;
        let stopLineX = this.lanes[lane].stopX;
        let stopLineY = this.lanes[lane].stopY;

        for (let v of this.vehicles) {
            if (v.lane === lane && v.active) {
                let dist = Infinity;
                if (lane === 'WEST') dist = stopLineX - v.x;
                if (lane === 'EAST') dist = v.x - stopLineX;
                if (lane === 'NORTH') dist = stopLineY - v.y;
                if (lane === 'SOUTH') dist = v.y - stopLineY;

                // If vehicle is approaching the intersection and within camera/sensor field
                if (dist > -15 && dist < this.sensorRange) {
                    count++;
                    if (v.waitingTime > maxWait) {
                        maxWait = v.waitingTime;
                    }
                }
            }
        }
        return { count, maxWait };
    }

    runSchedulingLogic() {
        const simStepSeconds = (1 / 60) * this.simSpeed;

        // Reduce timers on lights
        this.lights.NS.timer = Math.max(0, this.lights.NS.timer - simStepSeconds);
        this.lights.EW.timer = Math.max(0, this.lights.EW.timer - simStepSeconds);

        // ------------------ CONTROL MODE: MANUAL OVERRIDE ------------------
        if (this.controlMode === 'MANUAL') {
            this.stats.systemMode = "MANUAL OVERRIDE";
            if (this.pedestrianSignalState === 'WALK') {
                this.pedTimer = Math.max(0, this.pedTimer - simStepSeconds);
                if (this.pedTimer <= 0) {
                    this.pedestrianSignalState = 'DONT_WALK';
                    this.pedestrianCrossingRequest = false;
                    this.logAIAction("Pedestrian crossing complete. Returning to manual override mode.", "system");
                    this.lights.NS.state = 'GREEN';
                    this.lights.EW.state = 'RED';
                }
            }
            return;
        }

        if (this.pedestrianSignalState === 'WALK') {
            this.pedTimer = Math.max(0, this.pedTimer - simStepSeconds);
            if (this.pedTimer <= 0) {
                this.pedestrianSignalState = 'DONT_WALK';
                this.pedestrianCrossingRequest = false;
                this.logAIAction("Pedestrian crossing window complete. Resuming vehicle phases.", "system");
                // Reset lights to vehicular cycle
                this.lights.NS.state = 'GREEN';
                this.lights.NS.timer = this.minGreen;
                this.lights.EW.state = 'RED';
            }
            return; // Pedestrian walk locks vehicular lights for safety
        }

        // Fetch counts and wait times
        let nData = this.countQueuedVehicles('NORTH');
        let sData = this.countQueuedVehicles('SOUTH');
        let eData = this.countQueuedVehicles('EAST');
        let wData = this.countQueuedVehicles('WEST');

        let q_ns = nData.count + sData.count;
        let q_ew = eData.count + wData.count;
        let w_ns = Math.max(nData.maxWait, sData.maxWait);
        let w_ew = Math.max(eData.maxWait, wData.maxWait);

        // Update dashboard values
        this.stats.currentAIQueueScoreNS = (1.5 * q_ns + 0.1 * w_ns).toFixed(1);
        this.stats.currentAIQueueScoreEW = (1.5 * q_ew + 0.1 * w_ew).toFixed(1);

        // ------------------ EMERGENCY EMERGENCY OVERRIDE ------------------
        if (this.emergencyActive) {
            let activeGroup = this.lanes[this.emergencyLane].lightGroup; // 'NS' or 'EW'
            
            // Check if emergency vehicle has exited
            let emergencyExited = true;
            for (let v of this.vehicles) {
                if (v.type === 'ambulance' && v.active) {
                    emergencyExited = false;
                    break;
                }
            }

            if (emergencyExited) {
                this.emergencyActive = false;
                this.emergencyLane = null;
                this.logAIAction("Ambulance exited safely. Resuming regular scheduling.", "success");
                // set short timer to clear remaining queues
                this.lights.NS.timer = this.minGreen;
                this.lights.EW.timer = this.minGreen;
                return;
            }

            // Trigger override
            if (activeGroup === 'NS' && this.lights.NS.state !== 'GREEN') {
                if (this.lights.EW.state === 'GREEN') {
                    this.lights.EW.state = 'YELLOW';
                    this.lights.EW.timer = 2.0; // quick yellow transition
                    this.logAIAction("AI Sensor triggered emergency interrupt: Yellow transition EW.", "ai");
                } else if (this.lights.EW.state === 'YELLOW' && this.lights.EW.timer <= 0) {
                    this.lights.EW.state = 'RED';
                    this.lights.NS.state = 'GREEN';
                    this.lights.NS.timer = 10.0;
                    this.logAIAction("AI Priority override: Green phase NS activated.", "success");
                }
            } else if (activeGroup === 'EW' && this.lights.EW.state !== 'GREEN') {
                if (this.lights.NS.state === 'GREEN') {
                    this.lights.NS.state = 'YELLOW';
                    this.lights.NS.timer = 2.0;
                    this.logAIAction("AI Sensor triggered emergency interrupt: Yellow transition NS.", "ai");
                } else if (this.lights.NS.state === 'YELLOW' && this.lights.NS.timer <= 0) {
                    this.lights.NS.state = 'RED';
                    this.lights.EW.state = 'GREEN';
                    this.lights.EW.timer = 10.0;
                    this.logAIAction("AI Priority override: Green phase EW activated.", "success");
                }
            }
            return; // emergency handles timing
        }

        // ------------------ PEDESTRIAN WALK OVERRIDE ------------------
        if (this.pedestrianCrossingRequest && this.controlMode === 'AI') {
            // Trigger crossing when current vehicular phases finish or wait time gets long
            let activeGreenState = this.lights.NS.state === 'GREEN' ? 'NS' : (this.lights.EW.state === 'GREEN' ? 'EW' : null);
            let timeInActiveGreen = activeGreenState === 'NS' ? this.lights.NS.timer : this.lights.EW.timer;
            
            if (activeGreenState && timeInActiveGreen <= 0) {
                // Time is up for active phase, trigger pedestrian crossing
                if (activeGreenState === 'NS') {
                    this.lights.NS.state = 'YELLOW';
                    this.lights.NS.timer = 3.0;
                } else {
                    this.lights.EW.state = 'YELLOW';
                    this.lights.EW.timer = 3.0;
                }
                this.logAIAction("AI Coordinator triggering yellow light to enable pedestrian path.", "ai");
                return;
            }
        }

        // ------------------ CONTROL MODE: FIXED TIMERS ------------------
        if (this.controlMode === 'FIXED') {
            this.stats.systemMode = "FIXED TIMER";
            if (this.lights.NS.state === 'GREEN' && this.lights.NS.timer <= 0) {
                this.lights.NS.state = 'YELLOW';
                this.lights.NS.timer = 3.0;
            } else if (this.lights.NS.state === 'YELLOW' && this.lights.NS.timer <= 0) {
                this.lights.NS.state = 'RED';
                this.lights.EW.state = 'GREEN';
                this.lights.EW.timer = 20.0; // Fixed 20s
            } else if (this.lights.EW.state === 'GREEN' && this.lights.EW.timer <= 0) {
                this.lights.EW.state = 'YELLOW';
                this.lights.EW.timer = 3.0;
            } else if (this.lights.EW.state === 'YELLOW' && this.lights.EW.timer <= 0) {
                this.lights.EW.state = 'RED';
                this.lights.NS.state = 'GREEN';
                this.lights.NS.timer = 20.0;
            }
            return;
        }

        // ------------------ CONTROL MODE: AI ADAPTIVE ------------------
        this.stats.systemMode = "AI OPTIMIZED";
        
        let score_ns = 1.5 * q_ns + 0.1 * w_ns;
        let score_ew = 1.5 * q_ew + 0.1 * w_ew;

        if (this.lights.NS.state === 'GREEN') {
            let activeTimerElapsed = this.maxGreen - this.lights.NS.timer; // simulated green time
            
            // Check transition conditions
            if (activeTimerElapsed >= this.minGreen) {
                // If NS lane has cleared, OR EW queue delay score is significantly larger
                let nsCleared = (q_ns === 0);
                let ewUrgent = (score_ew > score_ns + 5.0) || (w_ew > 30.0);
                let limitReached = (this.lights.NS.timer <= 0); // MaxGreen exceeded
                
                if ((nsCleared && q_ew > 0) || ewUrgent || limitReached) {
                    this.lights.NS.state = 'YELLOW';
                    this.lights.NS.timer = 3.0;
                    
                    let reason = nsCleared ? "NS cleared" : (limitReached ? "MaxGreen limit reached" : `EW priority (EW Score: ${score_ew.toFixed(1)} vs NS: ${score_ns.toFixed(1)})`);
                    this.logAIAction(`AI Cycle Switch: Yellow light NS. Reason: ${reason}`, 'ai');
                }
            }
        } 
        else if (this.lights.NS.state === 'YELLOW' && this.lights.NS.timer <= 0) {
            this.lights.NS.state = 'RED';
            
            // Check if pedestrian request should take precedence
            if (this.pedestrianCrossingRequest) {
                this.pedestrianSignalState = 'WALK';
                this.pedTimer = this.pedDuration;
                this.spawnPedestrians();
                this.logAIAction(`🛡️ Pedestrian Walk cycle activated for ${this.pedDuration}s. All cars stopped.`, 'system');
            } else {
                this.lights.EW.state = 'GREEN';
                // Dynamically allocate green timer based on EW queue size (e.g. 8s base + 3s per car, capped at maxGreen)
                let calculatedTime = Math.min(this.maxGreen, Math.max(this.minGreen, 8 + q_ew * 3.5));
                this.lights.EW.timer = calculatedTime;
                this.logAIAction(`AI Phase EW: Allocated ${calculatedTime.toFixed(1)}s Green. Queue size: ${q_ew} vehicles.`, 'success');
            }
        } 
        else if (this.lights.EW.state === 'GREEN') {
            let activeTimerElapsed = this.maxGreen - this.lights.EW.timer;
            
            if (activeTimerElapsed >= this.minGreen) {
                let ewCleared = (q_ew === 0);
                let nsUrgent = (score_ns > score_ew + 5.0) || (w_ns > 30.0);
                let limitReached = (this.lights.EW.timer <= 0);

                if ((ewCleared && q_ns > 0) || nsUrgent || limitReached) {
                    this.lights.EW.state = 'YELLOW';
                    this.lights.EW.timer = 3.0;

                    let reason = ewCleared ? "EW cleared" : (limitReached ? "MaxGreen limit reached" : `NS priority (NS Score: ${score_ns.toFixed(1)} vs EW: ${score_ew.toFixed(1)})`);
                    this.logAIAction(`AI Cycle Switch: Yellow light EW. Reason: ${reason}`, 'ai');
                }
            }
        } 
        else if (this.lights.EW.state === 'YELLOW' && this.lights.EW.timer <= 0) {
            this.lights.EW.state = 'RED';

            if (this.pedestrianCrossingRequest) {
                this.pedestrianSignalState = 'WALK';
                this.pedTimer = this.pedDuration;
                this.spawnPedestrians();
                this.logAIAction(`🛡️ Pedestrian Walk cycle activated for ${this.pedDuration}s. All cars stopped.`, 'system');
            } else {
                this.lights.NS.state = 'GREEN';
                let calculatedTime = Math.min(this.maxGreen, Math.max(this.minGreen, 8 + q_ns * 3.5));
                this.lights.NS.timer = calculatedTime;
                this.logAIAction(`AI Phase NS: Allocated ${calculatedTime.toFixed(1)}s Green. Queue size: ${q_ns} vehicles.`, 'success');
            }
        }
    }

    loop() {
        if (this.isPaused) return;

        this.frameCounter++;
        
        // Dynamic vehicle spawning loop per lane
        const directions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        for (let dir of directions) {
            let prob = this.spawnProbability[dir] * this.simSpeed;
            if (Math.random() < prob) {
                this.spawnVehicle(dir);
            }
        }

        // Update traffic logic
        this.runSchedulingLogic();

        // Update Vehicles physics
        // Sort vehicles by positions in their respective lanes to check lead vehicle properties
        const lanesMap = { NORTH: [], SOUTH: [], EAST: [], WEST: [] };
        for (let v of this.vehicles) {
            if (v.active) lanesMap[v.lane].push(v);
        }

        // Sort: North moves Down (y increasing), South moves Up (y decreasing),
        // East moves Left (x decreasing), West moves Right (x increasing).
        lanesMap.NORTH.sort((a, b) => b.y - a.y); // Index 0 is further down (lead car)
        lanesMap.SOUTH.sort((a, b) => a.y - b.y); // Index 0 is further up (lead car)
        lanesMap.EAST.sort((a, b) => a.x - b.x);   // Index 0 is further left (lead car)
        lanesMap.WEST.sort((a, b) => b.x - a.x);   // Index 0 is further right (lead car)

        // Reset statistics registers to accumulate
        let accumulatedWait = 0;

        for (let direction in lanesMap) {
            let list = lanesMap[direction];
            let lightState = (direction === 'NORTH' || direction === 'SOUTH') ? this.lights.NS.state : this.lights.EW.state;
            let stopLineX = this.lanes[direction].stopX;
            let stopLineY = this.lanes[direction].stopY;

            for (let i = 0; i < list.length; i++) {
                let v = list[i];
                let lead = (i === 0) ? null : list[i - 1];
                v.update(this.simSpeed, lead, lightState, stopLineX, stopLineY, this.sensorRange);
                
                if (v.isStopped) {
                    accumulatedWait += (1 / 60) * this.simSpeed;
                }
            }
        }

        // Handle exited vehicles stats
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            let v = this.vehicles[i];
            if (!v.active) {
                if (v.hasExited) {
                    this.stats.totalVehicles++;
                    this.stats.totalWaitTime += v.waitingTime;
                    
                    // Lane exit throughput counts
                    if (v.lane === 'NORTH' || v.lane === 'SOUTH') this.stats.throughputNS++;
                    if (v.lane === 'EAST' || v.lane === 'WEST') this.stats.throughputEW++;

                    // Emissions Calculation: Idling cars release roughly 0.15g of CO2 per second.
                    // AI adaptive reduces wait time, saving idle fuel.
                    // Savings calculation compares current wait time against a baseline simulated wait time (~24s).
                    let baselineWait = 24.6;
                    let savedSeconds = baselineWait - v.waitingTime;
                    if (savedSeconds > 0) {
                        this.stats.emissionsSaved += (savedSeconds * 0.15) / 1000; // convert to kg
                    }
                }
                this.vehicles.splice(i, 1);
            }
        }

        // Update Pedestrians
        let pedWalkState = this.pedestrianSignalState === 'WALK' ? 'WALK' : 'DONT_WALK';
        let crosswalkBounds = { target: this.centerX + 120 }; // default walk bounds
        
        for (let i = this.pedestrians.length - 1; i >= 0; i--) {
            let p = this.pedestrians[i];
            p.update(this.simSpeed, pedWalkState, crosswalkBounds);
            if (!p.active) {
                this.pedestrians.splice(i, 1);
            }
        }

        // Trigger updates to dashboard display charts and stats
        if (this.frameCounter % 30 === 0) { // update UI stats twice a second
            this.pushWaitTimeHistory();
            if (window.updateDashboardStats) {
                window.updateDashboardStats(this.stats, this.lights, this.lanes);
            }
        }

        // Draw Frame
        this.draw();

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    pushWaitTimeHistory() {
        let avg = this.stats.totalVehicles > 0 ? (this.stats.totalWaitTime / this.stats.totalVehicles) : 0;
        this.stats.waitTimesHistory.push(avg);
        if (this.stats.waitTimesHistory.length > 50) {
            this.stats.waitTimesHistory.shift();
        }
    }

    draw() {
        let ctx = this.ctx;
        if (!ctx) return;

        // Clear Canvas
        ctx.fillStyle = '#070a13';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Green Grass Sidewalk Lawns
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2); // Top Left
        ctx.fillRect(this.centerX + this.roadWidth/2, 0, this.width, this.centerY - this.roadWidth/2); // Top Right
        ctx.fillRect(0, this.centerY + this.roadWidth/2, this.centerX - this.roadWidth/2, this.height); // Bottom Left
        ctx.fillRect(this.centerX + this.roadWidth/2, this.centerY + this.roadWidth/2, this.width, this.height); // Bottom Right

        // Draw Roads (Asphalt Gray)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.centerX - this.roadWidth/2, 0, this.roadWidth, this.height); // NS Road
        ctx.fillRect(0, this.centerY - this.roadWidth/2, this.width, this.roadWidth); // EW Road

        // Draw Lane dividers & borders (yellow and dashed white markings)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;

        // Outer Road boundaries
        ctx.beginPath();
        // NS borders
        ctx.moveTo(this.centerX - this.roadWidth/2, 0);
        ctx.lineTo(this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2);
        ctx.moveTo(this.centerX - this.roadWidth/2, this.centerY + this.roadWidth/2);
        ctx.lineTo(this.centerX - this.roadWidth/2, this.height);

        ctx.moveTo(this.centerX + this.roadWidth/2, 0);
        ctx.lineTo(this.centerX + this.roadWidth/2, this.centerY - this.roadWidth/2);
        ctx.moveTo(this.centerX + this.roadWidth/2, this.centerY + this.roadWidth/2);
        ctx.lineTo(this.centerX + this.roadWidth/2, this.height);
        
        // EW borders
        ctx.moveTo(0, this.centerY - this.roadWidth/2);
        ctx.lineTo(this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2);
        ctx.moveTo(this.centerX + this.roadWidth/2, this.centerY - this.roadWidth/2);
        ctx.lineTo(this.width, this.centerY - this.roadWidth/2);

        ctx.moveTo(0, this.centerY + this.roadWidth/2);
        ctx.lineTo(this.centerX - this.roadWidth/2, this.centerY + this.roadWidth/2);
        ctx.moveTo(this.centerX + this.roadWidth/2, this.centerY + this.roadWidth/2);
        ctx.lineTo(this.width, this.centerY + this.roadWidth/2);
        ctx.stroke();

        // Dashed Lane Centerlines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(this.centerX, 0); ctx.lineTo(this.centerX, this.centerY - this.roadWidth/2);
        ctx.moveTo(this.centerX, this.centerY + this.roadWidth/2); ctx.lineTo(this.centerX, this.height);
        ctx.moveTo(0, this.centerY); ctx.lineTo(this.centerX - this.roadWidth/2, this.centerY);
        ctx.moveTo(this.centerX + this.roadWidth/2, this.centerY); ctx.lineTo(this.width, this.centerY);
        ctx.stroke();
        ctx.setLineDash([]); // reset line dash

        // Stop Lines
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // NORTH inbound (top-left, heading down)
        ctx.moveTo(this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2 - 8);
        ctx.lineTo(this.centerX, this.centerY - this.roadWidth/2 - 8);
        // SOUTH inbound (bottom-right, heading up)
        ctx.moveTo(this.centerX, this.centerY + this.roadWidth/2 + 8);
        ctx.lineTo(this.centerX + this.roadWidth/2, this.centerY + this.roadWidth/2 + 8);
        // WEST inbound (left-bottom, heading right)
        ctx.moveTo(this.centerX - this.roadWidth/2 - 8, this.centerY);
        ctx.lineTo(this.centerX - this.roadWidth/2 - 8, this.centerY + this.roadWidth/2);
        // EAST inbound (right-top, heading left)
        ctx.moveTo(this.centerX + this.roadWidth/2 + 8, this.centerY - this.roadWidth/2);
        ctx.lineTo(this.centerX + this.roadWidth/2 + 8, this.centerY);
        ctx.stroke();

        // Pedestrian Zebra Crosswalks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        // North Crosswalk
        ctx.beginPath();
        ctx.moveTo(this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2 - 25);
        ctx.lineTo(this.centerX + this.roadWidth/2, this.centerY - this.roadWidth/2 - 25);
        ctx.moveTo(this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2 - 35);
        ctx.lineTo(this.centerX + this.roadWidth/2, this.centerY - this.roadWidth/2 - 35);
        // South Crosswalk
        ctx.moveTo(this.centerX - this.roadWidth/2, this.centerY + this.roadWidth/2 + 25);
        ctx.lineTo(this.centerX + this.roadWidth/2, this.centerY + this.roadWidth/2 + 25);
        ctx.moveTo(this.centerX - this.roadWidth/2, this.centerY + this.roadWidth/2 + 35);
        ctx.lineTo(this.centerX + this.roadWidth/2, this.centerY + this.roadWidth/2 + 35);
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // Draw Sensor Detection Bounds (Overlay in AI Mode)
        if (this.controlMode === 'AI') {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.03)';
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
            ctx.lineWidth = 1;
            
            // North Sensor box
            ctx.fillRect(this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2 - 8 - this.sensorRange, this.roadWidth/2, this.sensorRange);
            ctx.strokeRect(this.centerX - this.roadWidth/2, this.centerY - this.roadWidth/2 - 8 - this.sensorRange, this.roadWidth/2, this.sensorRange);
            
            // South Sensor box
            ctx.fillRect(this.centerX, this.centerY + this.roadWidth/2 + 8, this.roadWidth/2, this.sensorRange);
            ctx.strokeRect(this.centerX, this.centerY + this.roadWidth/2 + 8, this.roadWidth/2, this.sensorRange);

            // West Sensor box
            ctx.fillRect(this.centerX - this.roadWidth/2 - 8 - this.sensorRange, this.centerY, this.sensorRange, this.roadWidth/2);
            ctx.strokeRect(this.centerX - this.roadWidth/2 - 8 - this.sensorRange, this.centerY, this.sensorRange, this.roadWidth/2);

            // East Sensor box
            ctx.fillRect(this.centerX + this.roadWidth/2 + 8, this.centerY - this.roadWidth/2, this.sensorRange, this.roadWidth/2);
            ctx.strokeRect(this.centerX + this.roadWidth/2 + 8, this.centerY - this.roadWidth/2, this.sensorRange, this.roadWidth/2);
        }

        // Draw Labels for Roads
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 9px "JetBrains Mono"';
        ctx.fillText("MAIN GATE (N)", this.centerX - 130, 25);
        ctx.fillText("LIBRARY RD (S)", this.centerX - 130, this.height - 20);
        
        ctx.save();
        ctx.translate(30, this.centerY + 55);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("HOSTEL ZONE (W)", 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(this.width - 20, this.centerY - 55);
        ctx.rotate(Math.PI / 2);
        ctx.fillText("ACADEMIC BLK (E)", 0, 0);
        ctx.restore();

        // Draw Pedestrians
        for (let p of this.pedestrians) {
            p.draw(ctx);
        }

        // Draw Vehicles
        for (let v of this.vehicles) {
            v.draw(ctx);
        }

        // Draw Traffic Signal Lights
        this.drawLightSoles(ctx);

        // Draw Pedestrian crossing warning light on post
        if (this.pedestrianCrossingRequest) {
            ctx.fillStyle = this.pedestrianSignalState === 'WALK' ? '#10b981' : '#f59e0b';
            ctx.beginPath();
            ctx.arc(this.centerX - this.roadWidth/2 - 25, this.centerY - this.roadWidth/2 - 30, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px "Inter"';
            ctx.fillText(this.pedestrianSignalState === 'WALK' ? "WALK" : "WAIT", this.centerX - this.roadWidth/2 - 58, this.centerY - this.roadWidth/2 - 27);
        }
    }

    drawLightSoles(ctx) {
        // Draw signal frames and state lights
        const lightsConfigs = [
            { lightGroup: 'NS', x: this.centerX + 70, y: this.centerY - 85, angle: 0 },
            { lightGroup: 'NS', x: this.centerX - 70, y: this.centerY + 85, angle: Math.PI },
            { lightGroup: 'EW', x: this.centerX - 85, y: this.centerY - 70, angle: -Math.PI / 2 },
            { lightGroup: 'EW', x: this.centerX + 85, y: this.centerY + 70, angle: Math.PI / 2 }
        ];

        for (let config of lightsConfigs) {
            let lightObj = this.lights[config.lightGroup];
            ctx.save();
            ctx.translate(config.x, config.y);
            ctx.rotate(config.angle);

            // Sole background card
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            safeRoundRect(ctx, -10, -26, 20, 52, 6);
            ctx.fill();
            ctx.stroke();

            // Draw Red, Yellow, Green circles
            // Red
            ctx.fillStyle = (lightObj.state === 'RED') ? '#ef4444' : '#7f1d1d';
            if (lightObj.state === 'RED') {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ef4444';
            }
            ctx.beginPath();
            ctx.arc(0, -16, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            // Yellow
            ctx.fillStyle = (lightObj.state === 'YELLOW') ? '#f59e0b' : '#78350f';
            if (lightObj.state === 'YELLOW') {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#f59e0b';
            }
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Green
            ctx.fillStyle = (lightObj.state === 'GREEN') ? '#10b981' : '#064e3b';
            if (lightObj.state === 'GREEN') {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#10b981';
            }
            ctx.beginPath();
            ctx.arc(0, 16, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.restore();
        }
    }
}
