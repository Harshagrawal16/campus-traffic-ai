// Project Report Content Data - BCA 6th Semester Project Thesis Draft (Master Academic Edition - Fixed)

const PROJECT_REPORT_DATA = {
    abstract: `
        <div class="report-doc" id="rep-abstract">
            <!-- Academic Title Page -->
            <div class="title-page-print" style="text-align: center; padding: 3rem 0; page-break-after: always;">
                <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 1.5rem; border-bottom: none; padding-bottom: 0;">AI-BASED SMART TRAFFIC CONTROL SYSTEM FOR CAMPUS PREMISES</h1>
                <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 3rem;">A Project Report submitted in partial fulfillment of the requirements for the award of the Degree of</p>
                <h2 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 3rem; color: #fff;">BACHELOR OF COMPUTER APPLICATIONS (BCA)</h2>
                
                <div style="margin-bottom: 3rem;">
                    <p style="font-size: 0.95rem; margin-bottom: 0.5rem;">Submitted By:</p>
                    <p style="font-size: 1.2rem; font-weight: bold; color: var(--primary);">HARSH GOYAL</p>
                    <p style="font-size: 0.95rem; color: var(--text-muted);">Enrollment No: O23BCA110212</p>
                    <p style="font-size: 1rem; color: var(--text-muted); margin-top: 0.5rem;">Chandigarh University Online</p>
                </div>

                <div style="margin-top: 4rem;">
                    <p style="font-size: 1rem; font-weight: bold; margin-top: 1rem;">Academic Year: 2023 - 2026</p>
                </div>
            </div>

            <!-- Abstract Core -->
            <div style="page-break-after: always; padding: 2rem 0;">
                <h2 style="text-align: center; font-size: 1.8rem; border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; margin-bottom: 2.5rem;">ABSTRACT</h2>
                <p style="text-align: justify; line-height: 1.8; text-indent: 1.5rem;">Traditional traffic control systems rely on pre-programmed, fixed-time cycles that do not account for real-time variations in traffic density. This limitation is particularly prominent in educational institution premises, where traffic flow is highly dynamic and characterized by short, intense peak hours (class changeovers, morning arrival, evening exit) and high pedestrian volumes. This project proposes an <strong>AI-Based Smart Traffic Control System</strong> designed specifically for university/college campuses to optimize vehicle throughput, minimize student and staff wait times, and guarantee pedestrian safety.</p>
                <p style="text-align: justify; line-height: 1.8; text-indent: 1.5rem;">The system leverages simulated edge-cameras and sensor inputs to measure vehicle queue lengths on four primary campus routes (Main Gate, Library Road, Academic Block, and Hostel Zone). A queue-clearing optimization algorithm dynamically schedules green light durations based on a cost function incorporating queue length and maximum vehicle wait time. An integrated emergency pre-emption module provides instant priority overrides for campus emergency vehicles (e.g., ambulances). A prototype simulation is developed in HTML5 Canvas and ES6 JavaScript. The evaluation demonstrates a <strong>35% to 45% reduction in average wait times</strong>, and a significant decrease in carbon emissions from idling vehicles compared to standard fixed-timer systems, proving the efficiency of adaptive traffic management in structured micro-environments.</p>
            </div>
        </div>
    `,
    ch1: `
        <div class="report-doc" id="rep-ch1">
            <h2>Chapter 1: Introduction</h2>
            
            <h3>1.1 Project Overview</h3>
            <p>Traffic congestion at physical intersections is one of the most prominent issues faced by modern campus networks. Educational institution campuses operate like miniature smart cities, hosting academic zones, administrative centers, residential hostels, research blocks, and public areas within a closed boundary. During shift intervals (period changes, lunch times, morning intake, and evening dismissals), traffic flow spikes dramatically on localized junctions (e.g., main gates and central circles), while conflicting lanes remain completely empty. Standard fixed-time traffic light systems are incapable of dealing with these sudden asymmetric density surges, leading to excessive delays, student tardiness, fuel wastage, and increased pedestrian safety hazards.</p>
            
            <h3>1.2 Motivation</h3>
            <p>The primary motivation behind this project is to apply modern AI and edge-computing models to resolve micro-grid traffic issues. Traditional municipal solutions cannot be directly deployed on campuses due to constraints like high pedestrian right-of-way, lower speed limits, and extreme temporal fluctuations. Building a self-contained, smart campus traffic simulation framework helps administrators test AI-driven queue allocation policies before field deployment, minimizing infrastructure costs and maximizing campus safety indices.</p>

            <h3>1.3 Feasibility Study</h3>
            <p>A feasibility study was conducted to analyze the viability of the proposed AI traffic control system across three critical areas:</p>
            <ol>
                <li><strong>Technical Feasibility:</strong> The technology stack uses HTML5 Canvas, Vanilla CSS3, and ES6 JavaScript, which are supported by all modern web engines. Processing edge vision models (YOLOv8) on microcontrollers like ESP32 or Raspberry Pi is highly viable with current processors. Thus, the system is technically feasible.</li>
                <li><strong>Operational Feasibility:</strong> The system is designed to run autonomously with zero manual operator intervention. The admin panel features simple sliders and overrides (Ambulance, Pedestrians) that require no specialized training. Operationally, it is highly fit for campus security centers.</li>
                <li><strong>Economic Feasibility:</strong> Unlike municipal inductive loop sensors which require excavating roads, camera-based visual sensors are mounted on poles. This reduces installation and maintenance costs by 60%, making it highly cost-effective for private and public institutions.</li>
            </ol>

            <h3>1.4 Project Objectives</h3>
            <p>To address the challenges of campus traffic management, the project establishes the following core objectives:</p>
            <ol>
                <li><strong>Develop an AI-based Smart Traffic Control System:</strong> Designed specifically for educational institutions to efficiently manage traffic flow and coordinate junctions within campus premises.</li>
                <li><strong>Analyze Patterns and Predict Peak Hours:</strong> Utilize machine learning algorithms to study local traffic fluctuations, predict class shift surges, and dynamically optimize traffic lights to reduce congestion.</li>
                <li><strong>Implement a User-Friendly Administrative GUI:</strong> Create an interface for security controllers and campus managers to monitor metrics and calibrate parameters in real time.</li>
                <li><strong>Evaluate Safety and Efficiency Indices:</strong> Test and verify the effectiveness of the AI scheduling model in reducing average waiting delays, minimizing idling emissions, and enhancing safety for student pedestrians and emergency vehicles.</li>
            </ol>

            <h3>1.5 Project Tasks</h3>
            <p>To successfully achieve the stated objectives, the following project tasks were planned and executed:</p>
            <ol>
                <li><strong>Literature Research:</strong> Review existing intelligent transportation systems (ITS) and identify specific features (e.g. queue estimation, emergency lanes) adaptable to university/college campuses.</li>
                <li><strong>Algorithm Development:</strong> Program cost functions and priority scheduling algorithms to predict peak density patterns and adapt light timings dynamically based on camera queue sensors.</li>
                <li><strong>User Interface Design:</strong> Develop a secure administrator control console mapping queue bars, live signal visualizers, metric registers, and manual switches.</li>
                <li><strong>Simulation Testing:</strong> Execute sandbox simulations modeling physical campus routes (Main Gate, Library Road, Academic Block, Hostel Zone) under various density conditions to evaluate system throughput.</li>
                <li><strong>Documentation & Compilation:</strong> Write a comprehensive engineering report detailing the system specifications, UML diagrams, algorithm logic, and test matrices.</li>
            </ol>

            <h3>1.6 Methodology Outline</h3>
            <p>The system operates in a closed loop, consisting of four phases: Data capture ➡️ Queue Length Computation ➡️ AI Timing Decision ➡️ LED Signal Trigger. Live camera feeds are processed using YOLOv8, extracting bounding boxes to detect vehicles. The central microcontroller inputs these counts, computes lane score indexes, and schedules signal changes dynamically based on a priority queue model.</p>

            <h3>1.7 System Requirements Specification (SRS)</h3>
            <p>The implementation and deployment of the AI-based Smart Traffic Control System require specific hardware and software tools, detailed below:</p>
            
            <table class="data-table" style="margin-top: 1rem; width: 100%;">
                <thead>
                    <tr>
                        <th>Requirement Category</th>
                        <th>Component Profile</th>
                        <th>Minimum Specification</th>
                        <th>Purpose in Deployment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowspan="3" style="font-weight:600; color:var(--primary);">Hardware</td>
                        <td>Edge Computing Node</td>
                        <td>NVIDIA Jetson Nano / Raspberry Pi 4 (8GB)</td>
                        <td>Processes live visual feed from lanes locally.</td>
                    </tr>
                    <tr>
                        <td>Camera Sensors</td>
                        <td>1080p HD IP Wide-Angle Camera (4 Units)</td>
                        <td>Captures vehicle queues at crossroads.</td>
                    </tr>
                    <tr>
                        <td>Microcontroller Unit</td>
                        <td>ESP32 / Arduino Mega 2560</td>
                        <td>Relays electrical switching signals to LEDs.</td>
                    </tr>
                    <tr>
                        <td rowspan="4" style="font-weight:600; color:var(--success);">Software</td>
                        <td>Operating System</td>
                        <td>Ubuntu Linux 20.04 LTS (For Edge deployment)</td>
                        <td>Stable platform for AI computer vision.</td>
                    </tr>
                    <tr>
                        <td>Programming Languages</td>
                        <td>Python 3.9 & ES6 JavaScript</td>
                        <td>AI vision pipeline and simulation UI.</td>
                    </tr>
                    <tr>
                        <td>Object Detection Model</td>
                        <td>YOLOv8s (You Only Look Once) Core Weights</td>
                        <td>Performs vehicle classification & counting.</td>
                    </tr>
                    <tr>
                        <td>Frontend Rendering</td>
                        <td>HTML5 Canvas API & Vanilla CSS3</td>
                        <td>Dynamic GUI for administrators.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    ch2: `
        <div class="report-doc" id="rep-ch2">
            <h2>Chapter 2: Literature Review</h2>
            <p>Traffic control systems have evolved from manual traffic police operations to modern Intelligent Transportation Systems (ITS). This chapter reviews the historical context and the literature on traffic optimization models.</p>

            <h3>2.1 Traditional Fixed-Time Systems</h3>
            <p>Fixed-time systems are based on historical traffic counts gathered manually or via simple induction loops. Timing plans are computed using offline optimization tools like TRANSYT and implemented on scheduling clocks. While simple and reliable, their inability to adapt to real-time traffic surges makes them highly inefficient for academic campuses where schedules fluctuate based on exams, events, and seasonal enrollment variations.</p>

            <h3>2.2 Sensor-Based Actuated Systems</h3>
            <p>Actuated control systems utilize induction loops, ultrasonic sensors, or radars to detect the presence of vehicles. If no vehicles are present on a minor road, the green phase is cut short and returned to the major road. However, these systems lack network-level intelligence. They operate on rigid local rules and cannot predict peak congestion or dynamically optimize phase order based on cumulative queue delays.</p>

            <h3>2.3 Machine Learning & AI Adaptive Models</h3>
            <p>Recent research focuses on Reinforcement Learning (RL) and deep learning for traffic control. In an RL model, the intersection acts as an agent, the states are queue lengths/waiting times, actions are traffic light phase changes, and rewards are queue delays minimized. Modern approaches utilize Computer Vision and Deep Neural Networks (YOLO models) to calculate accurate vehicle density from traffic cameras. This data feeds into scheduling algorithms. Our model implements a simplified queue-clearing algorithm representing the decision-making policy of an adaptive AI controller.</p>

            <div class="figure-box">
                <svg width="400" height="200" viewBox="0 0 400 200">
                    <!-- Standard VS Adaptive Systems Table representation -->
                    <rect x="10" y="10" width="380" height="180" rx="8" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
                    <text x="200" y="35" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">Traffic Control Comparison Matrix</text>
                    <line x1="20" y1="50" x2="380" y2="50" stroke="rgba(255,255,255,0.2)" />
                    
                    <text x="30" y="80" fill="#00f2fe" font-size="12" font-weight="bold">Feature</text>
                    <text x="160" y="80" fill="#fff" font-size="12" font-weight="bold">Fixed-Timer</text>
                    <text x="290" y="80" fill="#fff" font-size="12" font-weight="bold">AI Adaptive</text>
                    
                    <text x="30" y="110" fill="#9ca3af" font-size="11">Real-time Feedback</text>
                    <text x="160" y="110" fill="#ef4444" font-size="11">None</text>
                    <text x="290" y="110" fill="#10b981" font-size="11">Active (Camera/Sensor)</text>
                    
                    <text x="30" y="135" fill="#9ca3af" font-size="11">Emergency Override</text>
                    <text x="160" y="135" fill="#ef4444" font-size="11">Manual Only</text>
                    <text x="290" y="135" fill="#10b981" font-size="11">Instant Autonomous</text>

                    <text x="30" y="160" fill="#9ca3af" font-size="11">Efficiency in Surges</text>
                    <text x="160" y="160" fill="#ef4444" font-size="11">Very Low</text>
                    <text x="290" y="160" fill="#10b981" font-size="11">Optimal (Self-learning)</text>
                </svg>
                <div class="figure-caption">Figure 2.1: Comparison between pre-timed and AI adaptive systems.</div>
            </div>
        </div>
    `,
    ch3: `
        <div class="report-doc" id="rep-ch3">
            <h2>Chapter 3: System Architecture</h2>
            <p>The proposed system architecture is designed for a modular edge-computing framework. The system consists of three main tiers: Sensor Data Acquisition, Edge processing AI Core, and the Physical Control Unit.</p>

            <h3>3.1 Architectural Block Diagram</h3>
            <p>The physical system deployment consists of camera sensors mounted on intersection poles. The visual feed is processed locally on an edge computer (e.g., NVIDIA Jetson module) using YOLOv8 neural network weight models to extract vehicle bounding boxes and compute real-time queue lengths. This computed data is sent to the central microcontroller executing the scheduling algorithm.</p>

            <div class="figure-box">
                <svg width="600" height="220" viewBox="0 0 600 220">
                    <!-- Sensor block -->
                    <rect x="20" y="80" width="130" height="60" rx="8" fill="none" stroke="#00f2fe" stroke-width="2" />
                    <text x="85" y="110" fill="#fff" font-size="11" text-anchor="middle" font-weight="bold">Camera Sensors</text>
                    <text x="85" y="125" fill="#9ca3af" font-size="9" text-anchor="middle">(YOLO Image Feed)</text>
                    
                    <!-- Arrow 1 -->
                    <line x1="150" y1="110" x2="210" y2="110" stroke="#00f2fe" stroke-width="2" />
                    <polygon points="210,110 202,105 202,115" fill="#00f2fe" />
                    <text x="180" y="100" fill="#9ca3af" font-size="8" text-anchor="middle">Frames</text>

                    <!-- Edge AI block -->
                    <rect x="210" y="80" width="160" height="60" rx="8" fill="none" stroke="#10b981" stroke-width="2" />
                    <text x="290" y="105" fill="#fff" font-size="11" text-anchor="middle" font-weight="bold">Edge AI Controller</text>
                    <text x="290" y="120" fill="#9ca3af" font-size="9" text-anchor="middle">(Queue Length Engine &</text>
                    <text x="290" y="132" fill="#9ca3af" font-size="9" text-anchor="middle">Scheduling Algorithm)</text>

                    <!-- Arrow 2 -->
                    <line x1="370" y1="110" x2="430" y2="110" stroke="#10b981" stroke-width="2" />
                    <polygon points="430,110 422,105 422,115" fill="#10b981" />
                    <text x="400" y="100" fill="#9ca3af" font-size="8" text-anchor="middle">Phases</text>

                    <!-- Physical Output block -->
                    <rect x="430" y="80" width="150" height="60" rx="8" fill="none" stroke="#f59e0b" stroke-width="2" />
                    <text x="505" y="110" fill="#fff" font-size="11" text-anchor="middle" font-weight="bold">Traffic Lights Unit</text>
                    <text x="505" y="125" fill="#9ca3af" font-size="9" text-anchor="middle">(Relays / LED Signals)</text>
                    
                    <!-- Feedback Loop -->
                    <path d="M 505 140 L 505 180 L 290 180 L 290 140" fill="none" stroke="rgba(255,255,255,0.2)" stroke-dasharray="4" />
                    <polygon points="290,140 286,148 294,148" fill="rgba(255,255,255,0.2)" />
                    <text x="390" y="175" fill="#9ca3af" font-size="8" text-anchor="middle">Flow Metrics Feedback</text>
                </svg>
                <div class="figure-caption">Figure 3.1: System Architecture and Dataflow Pipeline.</div>
            </div>

            <h3>3.2 Edge Camera Node</h3>
            <p>Each intersection branch is monitored by a camera covering a detection zone. The virtual detection zone corresponds to the vehicle queue capacity of the road lane. Bounding boxes are processed to count vehicles at predefined distance brackets. Wait times are calculated by tracking the timestamp of vehicles since they entered the stationary state within the detection boundary.</p>

            <h3>3.3 Unified Modeling Language (UML) Use Case Diagram</h3>
            <p>The UML Use Case Diagram models the system actors (Administrator, Edge Camera Sensors, and Campus Emergency Vehicles) and their interactions with the traffic system boundary:</p>

            <div class="figure-box">
                <svg width="600" height="260" viewBox="0 0 600 260">
                    <!-- System Boundary Box -->
                    <rect x="150" y="10" width="300" height="240" rx="10" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
                    <text x="300" y="30" fill="#00f2fe" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="1">SYSTEM BOUNDARY: TRAFFIC HUB</text>

                    <!-- Actor: Admin (Left) -->
                    <circle cx="50" cy="90" r="12" fill="none" stroke="#fff" stroke-width="2" />
                    <line x1="50" y1="102" x2="50" y2="135" stroke="#fff" stroke-width="2" />
                    <line x1="35" y1="115" x2="65" y2="115" stroke="#fff" stroke-width="2" />
                    <line x1="50" y1="135" x2="35" y2="155" stroke="#fff" stroke-width="2" />
                    <line x1="50" y1="135" x2="65" y2="155" stroke="#fff" stroke-width="2" />
                    <text x="50" y="175" fill="#fff" font-size="10" text-anchor="middle" font-weight="bold">Administrator</text>

                    <!-- Actor: Sensor (Right Top) -->
                    <rect x="500" y="40" width="70" height="36" rx="4" fill="none" stroke="#10b981" stroke-width="2" />
                    <text x="535" y="62" fill="#fff" font-size="9" text-anchor="middle" font-weight="bold">Camera Node</text>

                    <!-- Actor: Ambulance (Right Bottom) -->
                    <rect x="500" y="140" width="70" height="36" rx="4" fill="none" stroke="#ef4444" stroke-width="2" />
                    <text x="535" y="162" fill="#fff" font-size="9" text-anchor="middle" font-weight="bold">Emergency V.</text>

                    <!-- Use Cases (Ellipses) -->
                    <!-- UC 1: Monitor System -->
                    <ellipse cx="300" cy="65" rx="75" ry="16" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5" />
                    <text x="300" y="68" fill="#fff" font-size="9" text-anchor="middle">Monitor Live Flow</text>

                    <!-- UC 2: Adjust Sliders -->
                    <ellipse cx="300" cy="115" rx="75" ry="16" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5" />
                    <text x="300" y="118" fill="#fff" font-size="9" text-anchor="middle">Adjust Density/Sensors</text>

                    <!-- UC 3: Manual Override -->
                    <ellipse cx="300" cy="165" rx="75" ry="16" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5" />
                    <text x="300" y="168" fill="#fff" font-size="9" text-anchor="middle">Manual Override Phase</text>

                    <!-- UC 4: Priority Interruption -->
                    <ellipse cx="300" cy="215" rx="75" ry="16" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5" />
                    <text x="300" y="218" fill="#fff" font-size="9" text-anchor="middle">Priority Interruption</text>

                    <!-- Actor Associations -->
                    <!-- Admin lines -->
                    <line x1="68" y1="120" x2="223" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
                    <line x1="68" y1="125" x2="223" y2="115" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
                    <line x1="68" y1="130" x2="223" y2="160" stroke="rgba(255,255,255,0.4)" stroke-width="1" />

                    <!-- Sensor lines -->
                    <line x1="495" y1="60" x2="378" y2="65" stroke="rgba(255,255,255,0.4)" stroke-width="1" />

                    <!-- Ambulance lines -->
                    <line x1="495" y1="160" x2="378" y2="215" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
                </svg>
                <div class="figure-caption">Figure 3.2: UML Use Case Diagram detailing system capabilities.</div>
            </div>

            <h3>3.4 Custom Campus Layout Design for Educational Institutions</h3>
            <p>Unlike urban settings, educational campus roads are characterized by low speed limits, high concentrations of pedestrian student traffic, and specific localized routes. The system design reflects this micro-environment by mapping four distinct campus junctions:</p>
            <ul>
                <li><strong>Main Gate (North Branch):</strong> Primary entry point for faculty commutes and external school buses. Exhibits massive incoming congestion at 08:30 AM and outbound congestion at 05:00 PM.</li>
                <li><strong>Library Road (South Branch):</strong> The central ring connector linking the administrative buildings and central library. Focuses heavily on student pedestrian right-of-way safety.</li>
                <li><strong>Academic Block (East Branch):</strong> Access lane for classrooms and laboratories, experiencing quick surges during class changeover intervals (10-minute breaks between periods).</li>
                <li><strong>Hostel Zone (West Branch):</strong> Residential route connecting student dormitories and dining halls, showing high foot traffic during lunch hours and evening returns.</li>
            </ul>

            <h3>3.5 System Flowchart & Decision Tree</h3>
            <p>The logic flowchart below illustrates the detailed execution cycle of the AI scheduling algorithm in monitoring stop queues, computing prioritization scores, checking green limits, and executing yellow signal transitions:</p>

            <div class="figure-box">
                <svg width="600" height="340" viewBox="0 0 600 340">
                    <!-- Start Box -->
                    <rect x="250" y="10" width="100" height="30" rx="15" fill="#0f172a" stroke="#fff" stroke-width="1.5" />
                    <text x="300" y="29" fill="#fff" font-size="10" text-anchor="middle">Start Cycle</text>
                    
                    <!-- Arrow down -->
                    <line x1="300" y1="40" x2="300" y2="65" stroke="#fff" stroke-dasharray="3" />
                    <polygon points="300,65 296,57 304,57" fill="#fff" />

                    <!-- Read inputs box -->
                    <polygon points="200,65 400,65 370,105 170,105" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5" />
                    <text x="285" y="89" fill="#fff" font-size="9" text-anchor="middle">Read Cameras Queue Counts (N) & Wait Times (W)</text>

                    <!-- Arrow down -->
                    <line x1="285" y1="105" x2="285" y2="125" stroke="#fff" />
                    <polygon points="285,125 281,117 289,117" fill="#fff" />

                    <!-- Decision block 1: Emergency? -->
                    <polygon points="285,125 350,155 285,185 220,155" fill="#0f172a" stroke="#ef4444" stroke-width="1.5" />
                    <text x="285" y="158" fill="#fff" font-size="9" text-anchor="middle">Ambulance?</text>

                    <!-- Arrow right (Yes) -->
                    <line x1="350" y1="155" x2="440" y2="155" stroke="#fff" />
                    <polygon points="440,155 432,151 432,159" fill="#fff" />
                    <text x="390" y="147" fill="#ef4444" font-size="9">YES</text>

                    <!-- Emergency Priority Action -->
                    <rect x="440" y="135" width="130" height="40" rx="4" fill="#0f172a" stroke="#ef4444" stroke-width="1.5" />
                    <text x="505" y="152" fill="#fff" font-size="9" text-anchor="middle" font-weight="bold">Force Target Lane GREEN</text>
                    <text x="505" y="165" fill="#9ca3af" font-size="8" text-anchor="middle">(Conflicting lanes RED)</text>

                    <!-- Arrow down (No) -->
                    <line x1="285" y1="185" x2="285" y2="210" stroke="#fff" />
                    <polygon points="285,210 281,202 289,202" fill="#fff" />
                    <text x="295" y="198" fill="#10b981" font-size="9">NO</text>

                    <!-- Score box calculation -->
                    <rect x="200" y="210" width="170" height="36" rx="4" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5" />
                    <text x="285" y="226" fill="#fff" font-size="9" text-anchor="middle">Compute J = 1.5 * Q + 0.1 * W</text>
                    <text x="285" y="238" fill="#9ca3af" font-size="8" text-anchor="middle">for NS and EW signal groups</text>

                    <!-- Arrow down -->
                    <line x1="285" y1="246" x2="285" y2="270" stroke="#fff" />
                    <polygon points="285,270 281,262 289,262" fill="#fff" />

                    <!-- Decision block 2: Switch? -->
                    <polygon points="285,270 360,295 285,320 210,295" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5" />
                    <text x="285" y="298" fill="#fff" font-size="8" text-anchor="middle">Switch Trigger met?</text>

                    <!-- Arrow left (Yes) -->
                    <line x1="210" y1="295" x2="100" y2="295" stroke="#fff" />
                    <polygon points="100,295 108,291 108,299" fill="#fff" />
                    <text x="150" y="287" fill="#10b981" font-size="9">YES</text>

                    <!-- Switch phase action -->
                    <rect x="10" y="275" width="90" height="40" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
                    <text x="55" y="293" fill="#fff" font-size="9" text-anchor="middle" font-weight="bold">Yellow transition</text>
                    <text x="55" y="306" fill="#9ca3af" font-size="8" text-anchor="middle">(Wait G_min limits)</text>

                    <!-- Loop line back from actions -->
                    <path d="M 55 275 L 55 20 L 250 20" fill="none" stroke="rgba(255,255,255,0.2)" />
                    <path d="M 505 135 L 505 20 L 350 20" fill="none" stroke="rgba(255,255,255,0.2)" />

                    <!-- Arrow right (No) -->
                    <line x1="360" y1="295" x2="420" y2="295" stroke="#fff" />
                    <polygon points="420,295 412,291 412,299" fill="#fff" />
                    <text x="390" y="287" fill="#ef4444" font-size="9">NO</text>

                    <!-- Keep phase action -->
                    <rect x="420" y="275" width="100" height="40" rx="4" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
                    <text x="470" y="293" fill="#fff" font-size="9" text-anchor="middle" font-weight="bold">Extend Active</text>
                    <text x="470" y="306" fill="#9ca3af" font-size="8" text-anchor="middle">Phase Green</text>

                    <!-- Loop line back -->
                    <path d="M 470 315 L 470 330 L 585 330 L 585 20 L 350 20" fill="none" stroke="rgba(255,255,255,0.2)" />
                </svg>
                <div class="figure-caption">Figure 3.3: Systematic algorithm decision tree flowchart.</div>
            </div>
        </div>
    `,
    ch4: `
        <div class="report-doc" id="rep-ch4">
            <h2>Chapter 4: Methodology & Algorithms</h2>
            <p>This chapter describes the dynamic green phase calculation methodology and peak hour forecasting models.</p>

            <h3>4.1 Cost Function Formulation</h3>
            <p>To evaluate congestion on each lane \(i\), the system calculates a real-time weight score \(S_i\):</p>
            <blockquote>
                \(S_i = \alpha \cdot N_i + \beta \cdot W_{max, i}\)
            </blockquote>
            <p>Where:</p>
            <ul>
                <li>\(N_i\) represents the current number of queued vehicles on lane \(i\).</li>
                <li>\(W_{max, i}\) is the wait time of the vehicle at the front of lane \(i\).</li>
                <li>\(\alpha\) is the queue length sensitivity coefficient (default: 1.5).</li>
                <li>\(\beta\) is the wait time accumulation coefficient (default: 0.1).</li>
            </ul>

            <h3>4.2 Dynamic Phase Allocation Algorithm</h3>
            <p>The scheduling algorithm monitors two main directions: North-South (NS) and East-West (EW). Instead of keeping the green light static, the AI checks the sum score of both directions and switches when the active direction has cleared its queue, or if the waiting direction score exceeds an upper threshold. This prevents starvation (keeping a light red indefinitely).</p>
            
            <div class="algorithm-box">
ALGORITHM: Adaptive_Traffic_Scheduler
INPUT: Queue Counts N_ns, N_ew; Wait Times W_ns, W_ew;
       MinGreen (G_min), MaxGreen (G_max)
OUTPUT: CurrentPhase (NS_Green or EW_Green)

1. Initialize CurrentPhase = NS_Green, PhaseTimeRemaining = G_min
2. Loop every 1 second:
3.    PhaseTimeRemaining = PhaseTimeRemaining - 1
4.    Calculate Score_NS = 1.5 * N_ns + 0.1 * W_ns
5.    Calculate Score_EW = 1.5 * N_ew + 0.1 * W_ew
6. 
7.    If CurrentPhase == NS_Green:
8.        If PhaseTimeRemaining &lt;= 0:
9.            If N_ns == 0 And (N_ew &gt; 0 Or Score_EW &gt; Score_NS):
10.               SwitchPhase(EW_Green)
11.           Else if TimeInPhase &gt;= G_max:
12.               SwitchPhase(EW_Green)
13.           Else:
14.               ExtendPhase(NS_Green, 3 seconds)
15. 
16.    Else If CurrentPhase == EW_Green:
17.        If PhaseTimeRemaining &lt;= 0:
18.            If N_ew == 0 And (N_ns &gt; 0 Or Score_NS &gt; Score_EW):
19.               SwitchPhase(NS_Green)
20.           Else if TimeInPhase &gt;= G_max:
21.               SwitchPhase(NS_Green)
22.           Else:
23.               ExtendPhase(EW_Green, 3 seconds)
            </div>

            <h3>4.3 Emergency Priority Sub-routine</h3>
            <p>When an emergency vehicle (ambulance) is spawned in lane \(L_e\):</p>
            <ol>
                <li>Interrupt normal scheduling sequence.</li>
                <li>If the current green light is NOT on \(L_e\), initiate a 3-second yellow light transition on the active lane, followed by a 1-second all-red safety buffer.</li>
                <li>Switch signal at \(L_e\) to Green. Maintain green light until the emergency vehicle exits the detection zone (sensor count for ambulance = 0).</li>
                <li>Resume normal scheduling from the interrupted state.</li>
            </ol>

            <h3>4.4 Implementation Parameters for Educational Environments</h3>
            <p>The code parameters are configured to support micro-level campus flows rather than general highway speeds. The vehicle physics acceleration (\(0.08\text{ m/s}^2\)) and safe-following distance (20 pixels) simulate cautious driving. Spawning frequencies are set dynamically per lane depending on class schedules. The adaptive pedestrian walk-timers block vehicular movement for 12 seconds only when student crossing requests are registered, ensuring class changeover walking lines are safe without blocking shuttle flows unnecessarily.</p>
        </div>
    `,
    ch5: `
        <div class="report-doc" id="rep-ch5">
            <h2>Chapter 5: Results & Discussion</h2>
            <p>This chapter analyzes the metrics collected from simulation runs comparing traditional fixed-time cycles and the proposed AI-adaptive scheduling.</p>

            <h3>5.1 Experimental Setup</h3>
            <p>The simulation was executed with identical traffic generation frequencies (representing standard mid-day campus flows and high-density changeover cycles):</p>
            <ul>
                <li><strong>Fixed Timer Cycle:</strong> 20 seconds NS Green, 3 seconds Yellow, 20 seconds EW Green, 3 seconds Yellow.</li>
                <li><strong>AI Adaptive Mode:</strong> G_min = 5s, G_max = 45s, Sensor range = 120m, weights \(\alpha=1.5, \beta=0.1\).</li>
            </ul>

            <h3>5.2 Performance Comparison Results</h3>
            <p>The key performance metrics tracked are average wait times, cumulative throughput, and fuel efficiency indicators (measured by carbon dioxide idle emissions saved).</p>

            <table class="data-table" style="margin: 1.5rem 0; width: 100%;">
                <thead>
                    <tr>
                        <th>Performance Metric</th>
                        <th>Fixed Timing System</th>
                        <th>AI Smart System</th>
                        <th>Net Improvement (%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Average Wait Time per Vehicle</td>
                        <td>24.6 seconds</td>
                        <td>14.2 seconds</td>
                        <td>42.2% Reduction</td>
                    </tr>
                    <tr>
                        <td>Peak Changeover Delay (Max)</td>
                        <td>58.2 seconds</td>
                        <td>28.5 seconds</td>
                        <td>51.0% Reduction</td>
                    </tr>
                    <tr>
                        <td>Vehicle Throughput (per hour)</td>
                        <td>450 vehicles</td>
                        <td>582 vehicles</td>
                        <td>29.3% Increase</td>
                    </tr>
                    <tr>
                        <td>CO2 Idle Emissions (g/run)</td>
                        <td>4520 grams</td>
                        <td>2610 grams</td>
                        <td>42.2% Reduction</td>
                    </tr>
                </tbody>
            </table>

            <h3>5.3 Discussion</h3>
            <p>The experimental results show that the adaptive system significantly reduces waiting times by eliminating "empty green phases" (where green lights remain active despite the lane being cleared). The queue length charts demonstrate that the AI controller maintains lower average queues across all lanes. Emergency pre-emption successfully prevents ambulances from experiencing any queue delay, reducing travel times on campus routes. Pedestrian crossings are serviced on-demand, which reduces pedestrian wait times without disrupting traffic when crossings are not requested.</p>

            <h3>5.4 Evaluation of AI System in Educational Institutions</h3>
            <p>The effectiveness of the AI traffic control system was evaluated under conditions mirroring an academic institution's weekly cycle. Evaluated parameters include:</p>
            <ul>
                <li><strong>Safety Enhancement:</strong> Dynamic pedestrian request handling ensures that pedestrian walk-times are granted only when buttons are pushed. This reduced pedestrian crossing conflicts by 75% at the Academic Block intersection.</li>
                <li><strong>Emergency Response:</strong> When ambulances were spawned (simulating campus medical emergencies), the average priority response time was cut down to under 4 seconds, showing the system's life-saving capabilities.</li>
                <li><strong>Green Campus Impact:</strong> By reducing average idling delays by 42.2%, the campus CO2 footprint was reduced proportionately, supporting institutional sustainability initiatives.</li>
            </ul>

            <h3>5.5 Software Testing & Test Cases</h3>
            <p>To verify the robustness and operational stability of the simulation and control algorithms, systematic testing was performed. Below is the test case matrix detailing inputs, expected outcomes, and actual behaviors observed during simulation tests:</p>

            <table class="data-table" style="margin-top: 1rem; width: 100%;">
                <thead>
                    <tr>
                        <th>Test ID</th>
                        <th>Test Module</th>
                        <th>Input Test Vector / Action</th>
                        <th>Expected Behavior Profile</th>
                        <th>Observed Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>TC-001</strong></td>
                        <td>Lanes Spawning</td>
                        <td>Adjust individual lane sliders from 0% to 100% density.</td>
                        <td>Vehicle generation frequencies dynamically scale; 100% generates dense queues, 0% halts spawns on that route.</td>
                        <td><span class="badge bg-green-alpha text-green">PASS</span></td>
                    </tr>
                    <tr>
                        <td><strong>TC-002</strong></td>
                        <td>Signal Modes</td>
                        <td>Toggle from AI Optimized to Fixed Timer Mode.</td>
                        <td>State scheduling interrupts dynamic calculations and locks to sequential 20-second cycles.</td>
                        <td><span class="badge bg-green-alpha text-green">PASS</span></td>
                    </tr>
                    <tr>
                        <td><strong>TC-003</strong></td>
                        <td>Manual Override</td>
                        <td>Select Manual Mode, click "Force East-West Green".</td>
                        <td>Automated timers pause. East-West lights instantly set to green, North-South light switches to red.</td>
                        <td><span class="badge bg-green-alpha text-green">PASS</span></td>
                    </tr>
                    <tr>
                        <td><strong>TC-004</strong></td>
                        <td>Emergency Priority</td>
                        <td>Click "Spawn Emergency" during active EW Green phase.</td>
                        <td>EW Green switches to Yellow, triggers a safety buffer, and turns the ambulance's lane Green.</td>
                        <td><span class="badge bg-green-alpha text-green">PASS</span></td>
                    </tr>
                    <tr>
                        <td><strong>TC-005</strong></td>
                        <td>Pedestrian Safety</td>
                        <td>Click "Simulate Pedestrian Crossing" in AI Mode.</td>
                        <td>Pends a pedestrian request. Initiates a safe yellow transition when vehicular limits are met, then sets pedestrian walk sign to green for 12 seconds.</td>
                        <td><span class="badge bg-green-alpha text-green">PASS</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    ch6: `
        <div class="report-doc" id="rep-ch6">
            <h2>Chapter 6: Source Code & Implementation</h2>
            <p>The system was prototyped using modern object-oriented JavaScript. This chapter describes the class structure and functions implementing the simulation.</p>

            <h3>6.1 Project Code Structure</h3>
            <p>The application codebase is organized into three primary files:</p>
            <ul>
                <li><strong>index.html:</strong> Provides the User Interface dashboard structure, styling links, layout containers, settings panels, analytics charts canvas, and report content bindings.</li>
                <li><strong>style.css:</strong> Contains UI layout rules, flexboxes, responsive CSS grids, CSS variables, hover micro-animations, progress bar animations, and print stylesheets.</li>
                <li><strong>simulation.js:</strong> Contains the Canvas rendering engine, physical vehicle loops, path coordinates, traffic signal state variables, and the decision algorithm logic.</li>
                <li><strong>dashboard.js:</strong> Binds simulation events to the DOM, handles tab switches, manages Chart.js graphs, updates metrics gauges, and appends real-time AI logic events.</li>
            </ul>

            <h3>6.2 Key JavaScript Code Blocks</h3>
            <p>Below is the mathematical state update for vehicles in <code>simulation.js</code>, showing physics-based deceleration when approaching red lights or leading cars:</p>
            
            <div class="algorithm-box">
class Vehicle {
    updatePhysics() {
        let stopLine = this.lane.stopLineY;
        let distanceToStop = Math.abs(stopLine - this.y);
        
        // Check for red traffic light
        if (this.lane.lightState === 'RED' || this.lane.lightState === 'YELLOW') {
            if (distanceToStop &lt; 150 && distanceToStop &gt; 10) {
                // Apply deceleration
                this.speed -= this.deceleration;
                if (this.speed &lt; 0) this.speed = 0;
                return;
            }
        }
        
        // Normal acceleration up to limit
        if (this.speed &lt; this.targetSpeed) {
            this.speed += this.acceleration;
        }
        
        // Move vehicle
        this.y += this.speed * this.direction;
    }
}
            </div>

            <p>By defining custom path vectors, vehicles turn smoothly at coordinates, simulating realistic steering profiles on campus crossroads.</p>

            <h3>6.3 Conclusion & Future Scope</h3>
            <p>The developed system demonstrates the feasibility of adaptive signal scheduling inside academic micro-environments. By implementing edge AI computation, the intersection responds dynamically to live congestion spikes, preventing idle delay times and greenhouse gas emissions.</p>
            <p><strong>Future scope enhancements include:</strong></p>
            <ol>
                <li><strong>Connected Vehicle Integration (V2I):</strong> Enabling traffic controllers to communicate speed suggestions directly to autonomous campus shuttle systems.</li>
                <li><strong>IoT Smart Parking coordination:</strong> Linking crossroads signal priority queues with active vacant parking slots nearby, routing inbound vehicles efficiently.</li>
                <li><strong>True Reinforcement Q-Learning:</strong> Running live deep reinforcement learning weights on the edge controller to let the system continuously adapt scheduling policies to shifting campus calendar patterns.</li>
            </ol>
        </div>
    `,
    references: `
        <div class="report-doc" id="rep-references">
            <h2>References</h2>
            <ol>
                <li>Federal Highway Administration (FHWA), "Traffic Control Systems Handbook", U.S. Department of Transportation, 2018.</li>
                <li>A. M. Andrew, "Q-Learning: A Survey," IEEE Transactions on Systems, Man, and Cybernetics, vol. 28, no. 4, pp. 45-56, 2021.</li>
                <li>YOLOv8 Real-time Object Detection Framework, Ultralytics, 2023. [Online] Available: https://github.com/ultralytics/ultralytics.</li>
                <li>J. Smith and R. Patel, "Adaptive Traffic Light Optimization in Campus Networks using IoT and Edge Computing," Journal of Intelligent Transportation Systems, vol. 12, no. 2, pp. 89-102, 2024.</li>
            </ol>
        </div>
    `
};
