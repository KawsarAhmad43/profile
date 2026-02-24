// AI Portfolio Interactive Script

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializePortfolio();
    updateLocationAndTime();
    createParticles();
    initializeAIVoice();
    initVoiceCanvas();
});

// Initialize Portfolio
function initializePortfolio() {
    const profileCircle = document.getElementById('profileCircle');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');

    // Profile circle click event
    profileCircle.addEventListener('click', function () {
        playAIVoice();
    });

    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const section = this.getAttribute('data-section');
            navigateToSection(section, this);
        });
    });

    // Chat functionality
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial AI greeting after 1.5 seconds (give time for page to load)
    setTimeout(() => {
        // Only play if speech synthesis is available
        if ('speechSynthesis' in window) {
            playAIVoice();
        }
    }, 1500);
}

// Navigate to Section
function navigateToSection(sectionId, button) {
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to clicked button
    button.classList.add('active');

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section immediately
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Send Message
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const message = chatInput.value.trim();

    if (message === '') return;

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(userMessage);

    // Clear input
    chatInput.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Process AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        const aiMessage = document.createElement('div');
        aiMessage.className = 'ai-message';
        aiMessage.innerHTML = `<i class="fas fa-robot"></i><div class="ai-response-content">${aiResponse}</div>`;
        chatMessages.appendChild(aiMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // If response suggests a section, navigate to it
        const sectionMatch = aiResponse.match(/check out my (About|Skills|Experience|Projects|Achievements|Contact)/i);
        if (sectionMatch) {
            const section = sectionMatch[1].toLowerCase();
            setTimeout(() => {
                const button = document.querySelector(`[data-section="${section}"]`);
                if (button) {
                    navigateToSection(section, button);
                }
            }, 1000);
        }
    }, 1000);
}

// ============================================
// Smart Chat Helpers
// ============================================

// Collect all skills from the DOM and project data
function getAllSkills() {
    const skillTags = document.querySelectorAll('.skill-tag');
    const domSkills = Array.from(skillTags).map(tag => tag.textContent.trim());

    // Add skills from project technologies to ensure everything mentioned in projects is found
    const projectSkills = [];
    for (const project of Object.values(projectData)) {
        if (project.technologies) {
            projectSkills.push(...project.technologies);
        }
    }

    // Return unique case-insensitive unique skills
    const allSkills = [...domSkills, ...projectSkills];
    return [...new Set(allSkills)];
}

// Collect all achievements from the DOM
function getAllAchievements() {
    const achievementItems = document.querySelectorAll('.achievement-item');
    return Array.from(achievementItems).map(item => {
        const title = item.querySelector('h4')?.textContent.trim() || '';
        const orgElement = item.querySelector('.achievement-org');
        const org = orgElement?.textContent.trim() || '';
        return {
            title,
            description: org || 'Professional Achievement'
        };
    });
}

// Find matching skills (fuzzy match)
function findMatchingSkills(query, allSkills) {
    const lowerQuery = query.toLowerCase();
    const matched = allSkills.filter(skill => {
        const lowerSkill = skill.toLowerCase();
        // Check if query appears in skill name or skill name appears in query
        return lowerSkill.includes(lowerQuery) || lowerQuery.includes(lowerSkill);
    });
    // Return unique values
    return [...new Set(matched)];
}

// Search projects by keyword (checks technologies, title, description)
function searchProjectsByKeyword(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const results = [];
    for (const [id, project] of Object.entries(projectData)) {
        const techMatch = project.technologies.some(tech =>
            tech.toLowerCase().includes(lowerKeyword) || lowerKeyword.includes(tech.toLowerCase())
        );
        const titleMatch = project.title.toLowerCase().includes(lowerKeyword);
        const descMatch = project.description.toLowerCase().includes(lowerKeyword);
        if (techMatch || titleMatch || descMatch) {
            results.push({ id, ...project });
        }
    }
    return results;
}

// Generate AI Response
function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase().trim();
    const allSkills = getAllSkills();

    // ===== SPECIFIC SKILL INQUIRY =====
    // Patterns: "do you know X?", "do you have skill in X?", etc.
    const skillInquiryPatterns = [
        /(?:do you have|have you got)\s+(?:any\s+)?(?:skills?|knowledge|expertise|experience)\s+(?:in|on|of|with|about)\s+(.+?)[\?\.\!]?\s*$/,
        /(?:are you)\s+(?:skilled|experienced|proficient|good|expert)\s+(?:in|at|with)\s+(.+?)[\?\.\!]?\s*$/,
        /(?:can you)\s+(?:work with|use|code in|develop (?:in|with))\s+(.+?)[\?\.\!]?\s*$/,
        /(?:have you)\s+(?:worked with|used|learned)\s+(.+?)[\?\.\!]?\s*$/,
        /(?:knowledge|expertise|skill)\s+(?:in|on|of|with)\s+(.+?)[\?\.\!]?\s*$/,
        /(?:do you|you)\s+(?:know|have)\s+(.+?)[\?\.\!]?\s*$/,
    ];

    for (const pattern of skillInquiryPatterns) {
        const match = lowerMessage.match(pattern);
        if (match) {
            const queryTerm = match[1].trim().replace(/[?.!,]/g, '').trim();
            if (queryTerm.length < 2) continue;
            // Skip generic terms that shouldn't be treated as specific skill queries
            const genericTerms = ['coding', 'programming', 'anything', 'everything', 'nothing', 'something', 'skills', 'technologies', 'any skill', 'any technology'];
            if (genericTerms.includes(queryTerm)) break;

            const foundSkills = findMatchingSkills(queryTerm, allSkills);
            if (foundSkills.length > 0) {
                const displaySkills = foundSkills.slice(0, 5).join(', ');
                return `<span class="chat-skill-found"><i class="fas fa-check-circle"></i> Yes!</span> I have expertise in <strong>${displaySkills}</strong>. This is part of my professional skill set. Feel free to ask about my projects using ${foundSkills[0]} or explore my Skills section for more!`;
            } else {
                const capitalizedTerm = queryTerm.charAt(0).toUpperCase() + queryTerm.slice(1);
                return `<span class="chat-skill-not-found"><i class="fas fa-times-circle"></i> Not currently.</span> <strong>${capitalizedTerm}</strong> is not listed in my current skill set. However, I'm always expanding my knowledge! Explore my Skills section to see what I specialize in.`;
            }
        }
    }

    // ===== SPECIFIC PROJECT FILTER =====
    // Patterns: "projects on Vue", "Vue projects", "show me Vue.js projects", "AWS", "web3"
    const projectFilterPatterns = [
        /projects?\s+(?:on|with|using|in|about|related to|for)\s+(.+?)[\?\.\!]?\s*$/,
        /(?:show|list|find|get|display)\s+(?:me\s+)?(?:your\s+)?projects?\s+(?:on|with|using|in|about|for)\s+(.+?)[\?\.\!]?\s*$/,
        /(?:show|list|find|get|display)\s+(?:me\s+)?(.+?)\s+projects?[\?\.\!]?\s*$/,
        /^(.+?)\s+projects?[\?\.\!]?\s*$/,
    ];

    let queryTerm = null;

    // Check patterns first
    for (const pattern of projectFilterPatterns) {
        const match = lowerMessage.match(pattern);
        if (match) {
            queryTerm = match[1].trim().replace(/[?.!,]/g, '').trim();
            break;
        }
    }

    // Special case: If user just types a technology name (like "AWS" or "web3.js") 
    // and it matches a known technology in projects, treat it as a project search
    if (!queryTerm) {
        const words = lowerMessage.split(/\s+/);
        if (words.length <= 3) { // Only for short messages to avoid false positives
            const allTechs = [];
            Object.values(projectData).forEach(p => allTechs.push(...p.technologies));
            const uniqueTechs = [...new Set(allTechs.map(t => t.toLowerCase()))];

            for (const word of words) {
                const cleanWord = word.replace(/[?.!,]/g, '');
                if (cleanWord.length < 2) continue;
                if (uniqueTechs.some(tech => tech.includes(cleanWord) || cleanWord.includes(tech))) {
                    queryTerm = cleanWord;
                    break;
                }
            }
        }
    }

    if (queryTerm && queryTerm.length >= 2) {
        // Skip generic terms
        const genericTerms = ['your', 'the', 'all', 'some', 'any', 'my', 'his', 'her', 'show', 'me', 'what', 'about', 'those', 'these'];
        if (!genericTerms.includes(queryTerm)) {
            const matchingProjects = searchProjectsByKeyword(queryTerm);
            if (matchingProjects.length > 0) {
                let response = `Found <strong>${matchingProjects.length}</strong> project(s) related to <strong>${queryTerm}</strong>:<div class="chat-projects-list">`;
                matchingProjects.forEach(p => {
                    response += `<div class="chat-project-item" onclick="showProjectModal('${p.id}')"><i class="${p.icon}"></i> <strong>${p.title}</strong><br><small>${p.technologies.slice(0, 4).join(' &middot; ')}</small></div>`;
                });
                response += '</div><small style="opacity:0.6;">Click on any project to see full details.</small>';
                return response;
            }
        }
    }

    // ===== ACHIEVEMENT-SPECIFIC QUERIES =====
    if (lowerMessage.includes('achievement') || lowerMessage.includes('award') || lowerMessage.includes('recogni') || lowerMessage.includes('accomplishment') || lowerMessage.includes('certification') || lowerMessage.includes('certif')) {
        const achievements = getAllAchievements();
        if (achievements.length > 0) {
            let certificationCount = 0;
            let awardCount = 0;

            // Count certifications vs awards by analyzing titles
            achievements.forEach(a => {
                if (a.title.toLowerCase().includes('runner') || a.title.toLowerCase().includes('it olympiad')) {
                    awardCount++;
                } else {
                    certificationCount++;
                }
            });

            const certificateList = achievements.filter(a => !a.title.toLowerCase().includes('runner') && !a.title.toLowerCase().includes('it olympiad')).slice(0, 4).map(a => `<li class="cert-item"><strong>${a.title}</strong><br><small>${a.description}</small></li>`).join('');
            const awardList = achievements.filter(a => a.title.toLowerCase().includes('runner') || a.title.toLowerCase().includes('it olympiad')).map(a => `<li class="award-item"><strong>${a.title}</strong><br><small>${a.description}</small></li>`).join('');

            let response = `<span class="chat-achievement-highlight"><i class="fas fa-trophy"></i> My Certifications & Awards:</span>`;

            if (certificateList) {
                response += `<div class="chat-certs"><strong style="color: var(--primary-color);">📜 Certifications (${certificationCount})</strong><ul class="chat-achievements-list">${certificateList}</ul></div>`;
            }

            if (awardList) {
                response += `<div class="chat-awards"><strong style="color: #ffd700;">🏆 Awards</strong><ul class="chat-achievements-list">${awardList}</ul></div>`;
            }

            response += `<small style="opacity:0.7;">Visit my Achievements section to see my complete credentials!</small>`;
            return response;
        } else {
            return "I'm proud of my achievements including prestigious certifications and awards. Visit my Achievements section to see more!";
        }
    }

    // ===== GENERIC SECTION RESPONSES =====
    // These navigate to the full section when no specific query is detected
    if (lowerMessage.includes('about') || lowerMessage.includes('who')) {
        return "I'm Md. Kawsar Ahmad, a passionate Software Engineer specializing in AI and cutting-edge technologies. Feel free to check out my About section for more details!";
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('technology') || lowerMessage.includes('tech stack')) {
        return "I have expertise in Python, JavaScript, Laravel, Vue.js, Machine Learning, and more! Check out my Skills section to see my full tech stack.";
    } else if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
        return "I have extensive experience working with various companies and technologies. Visit my Experience section to learn about my professional journey!";
    } else if (lowerMessage.includes('project')) {
        return "I've worked on exciting projects including AI systems, enterprise applications, and research work. Check out my Projects section for details!";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('email')) {
        return "You can reach me through various channels! Check out my Contact section for all the ways to connect with me.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm the AI assistant for Kawsar's portfolio. Ask me about specific skills (e.g., <em>'Do you know AWS?'</em>), search projects by technology (e.g., <em>'Vue projects'</em>), or explore sections using the tabs above!";
    } else {
        return "That's an interesting question! Try asking about specific skills (e.g., <em>'Do you know Python?'</em>), filter projects by technology (e.g., <em>'Laravel projects'</em>), or explore different sections using the tabs above.";
    }
}

// Voice Wave Animation
let voiceAnimationFrame;
let voiceCanvas;
let voiceCtx;
let voiceBars = [];
let isVoicePlaying = false;

function initVoiceCanvas() {
    voiceCanvas = document.getElementById('voiceCanvas');
    if (!voiceCanvas) return;

    voiceCtx = voiceCanvas.getContext('2d');

    // Initialize voice bars
    const barCount = 40;
    for (let i = 0; i < barCount; i++) {
        voiceBars.push({
            height: 0,
            targetHeight: 0,
            speed: Math.random() * 0.5 + 0.3
        });
    }
}

function animateVoiceWave() {
    if (!voiceCtx || !isVoicePlaying || !voiceCanvas) {
        if (voiceAnimationFrame) {
            cancelAnimationFrame(voiceAnimationFrame);
            voiceAnimationFrame = null;
        }
        return;
    }

    const width = voiceCanvas.width;
    const height = voiceCanvas.height;
    const barWidth = width / voiceBars.length;

    // Clear canvas
    voiceCtx.clearRect(0, 0, width, height);

    // Draw bars
    voiceBars.forEach((bar, index) => {
        // Update target height randomly for realistic effect
        if (Math.random() > 0.9) {
            bar.targetHeight = Math.random() * height * 0.8;
        }

        // Smooth transition to target height
        bar.height += (bar.targetHeight - bar.height) * bar.speed;

        // Draw bar
        const x = index * barWidth;
        const barHeight = Math.max(2, bar.height);
        const y = (height - barHeight) / 2;

        // Gradient color
        const gradient = voiceCtx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(123, 47, 247, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0.8)');

        voiceCtx.fillStyle = gradient;
        voiceCtx.fillRect(x, y, barWidth - 2, barHeight);
    });

    if (isVoicePlaying) {
        voiceAnimationFrame = requestAnimationFrame(animateVoiceWave);
    }
}

function startVoiceAnimation() {
    isVoicePlaying = true;

    // Set random initial heights
    voiceBars.forEach(bar => {
        bar.targetHeight = Math.random() * 50 + 10;
    });

    animateVoiceWave();
}

function stopVoiceAnimation() {
    isVoicePlaying = false;

    // Immediately cancel animation frame
    if (voiceAnimationFrame) {
        cancelAnimationFrame(voiceAnimationFrame);
        voiceAnimationFrame = null;
    }

    // Smoothly reduce all bars to zero
    voiceBars.forEach(bar => {
        bar.height = 0;
        bar.targetHeight = 0;
    });

    // Clear canvas
    if (voiceCtx && voiceCanvas) {
        voiceCtx.clearRect(0, 0, voiceCanvas.width, voiceCanvas.height);
    }
}

// Play AI Voice
function playAIVoice() {
    const voiceIndicator = document.getElementById('voiceIndicator');

    // Use Web Speech API if available
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance('Ask me anything in the chatbox that you want to know about me, or choose from the tabs.');
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Start animation only when speech actually starts
        utterance.onstart = function () {
            voiceIndicator.classList.add('active');
            startVoiceAnimation();
        };

        utterance.onend = function () {
            voiceIndicator.classList.remove('active');
            stopVoiceAnimation();
        };

        utterance.onerror = function (event) {
            console.error('Speech synthesis error:', event);
            voiceIndicator.classList.remove('active');
            stopVoiceAnimation();
        };

        // Small delay to ensure voices are loaded
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 100);
    } else {
        // No speech synthesis available - don't show animation
        console.log('Speech synthesis not available in this browser');
    }

    // Add message to chat
    const chatMessages = document.getElementById('chatMessages');
    const aiMessage = document.createElement('div');
    aiMessage.className = 'ai-message';
    aiMessage.innerHTML = `<i class="fas fa-robot"></i><p>Ask me anything in the chatbox that you want to know about me, or choose from the tabs.</p>`;

    // Only add if it's not already there
    if (chatMessages.children.length === 1) {
        chatMessages.innerHTML = '';
        chatMessages.appendChild(aiMessage);
    }
}

// Update Location and Time
function updateLocationAndTime() {
    const locationElement = document.getElementById('location');
    const timeElement = document.getElementById('localTime');

    // Update time every second
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timeElement.textContent = timeString;
    }

    updateTime();
    setInterval(updateTime, 1000);

    // Get location from browser timezone (no permission or API needed)
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g. "Asia/Dhaka"
        if (timeZone && timeZone.includes('/')) {
            const parts = timeZone.split('/');
            const region = parts[0].replace(/_/g, ' ');
            const city = parts[parts.length - 1].replace(/_/g, ' ');
            locationElement.textContent = `${city}, ${region}`;
        } else {
            locationElement.textContent = timeZone || 'Unknown';
        }
    } catch (error) {
        locationElement.textContent = 'Unknown';
    }
}

// Create Particles
function createParticles() {
    const particlesContainer = document.getElementById('aiParticles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(${Math.random() > 0.5 ? '0, 240, 255' : '123, 47, 247'}, ${Math.random() * 0.5 + 0.2})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';

        particlesContainer.appendChild(particle);
    }

    // Add floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% {
                transform: translate(0, 0) scale(1);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// CV Download
document.getElementById('cvDownload').addEventListener('click', function (e) {
    e.preventDefault();

    // Optional: Alert message before download
    alert('Downloading CV...');

    // Create a temporary link to download the CV
    const link = document.createElement('a');
    link.href = 'assets/cv/CV.pdf'; // Path to your CV file
    link.download = 'Kawsar_Ahmad_CV.pdf'; // Name of the downloaded file
    document.body.appendChild(link); // Append link to body
    link.click(); // Trigger click to download
    document.body.removeChild(link); // Remove link after download
});

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add liquid glass effect on mouse move
document.addEventListener('mousemove', function (e) {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            card.style.background = `
                radial-gradient(circle at ${xPercent}% ${yPercent}%,
                rgba(0, 240, 255, 0.1) 0%,
                rgba(255, 255, 255, 0.05) 50%)
            `;
        }
    });
});

// Initialize AI Voice
function initializeAIVoice() {
    // Preload speech synthesis
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
    }
}

// Add typing effect for AI messages
function typeMessage(element, message, speed = 30) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < message.length) {
            element.textContent += message.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all content sections
document.querySelectorAll('.content-section').forEach(section => {
    observer.observe(section);
});

// Add parallax effect to profile circle
window.addEventListener('scroll', function () {
    const scrolled = window.pageYOffset;
    const profileCircle = document.getElementById('profileCircle');

    if (profileCircle) {
        profileCircle.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Prevent context menu on profile image (optional)
document.getElementById('profileImage').addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

console.log('🤖 AI Portfolio Initialized Successfully!');
console.log('💡 Developed by Md. Kawsar Ahmad');

// ============================================
// Skills Section Tab Functionality
// ============================================

// Initialize Skills Tabs
function initializeSkillsTabs() {
    // Role tabs (Software Engineer / Researcher)
    const roleTabButtons = document.querySelectorAll('.role-tab-btn');
    const roleContents = document.querySelectorAll('.role-content');

    roleTabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const role = this.getAttribute('data-role');

            // Remove active class from all role tabs
            roleTabButtons.forEach(btn => btn.classList.remove('active'));
            roleContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(role).classList.add('active');
        });
    });

    // Sub-tabs (Fullstack / ML Engineer)
    const subTabButtons = document.querySelectorAll('.sub-tab-btn');
    const subContents = document.querySelectorAll('.sub-content');

    subTabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const subtab = this.getAttribute('data-subtab');

            // Remove active class from all sub-tabs
            subTabButtons.forEach(btn => btn.classList.remove('active'));
            subContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked sub-tab
            this.classList.add('active');
            document.getElementById(subtab).classList.add('active');
        });
    });
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSkillsTabs);
} else {
    initializeSkillsTabs();
}

// ============================================
// Experience Modal Functionality
// ============================================

// Experience data
const experienceData = {
    exp1: {
        role: "Senior Software Engineer",
        company: "Tech Company Inc.",
        duration: "2022 - Present",
        logo: "assets/images/company-placeholder.svg",
        responsibilities: [
            "Leading development of AI-powered applications using TensorFlow and PyTorch",
            "Architecting scalable microservices infrastructure on AWS",
            "Mentoring team of 5 junior developers and conducting code reviews",
            "Implementing CI/CD pipelines and DevOps best practices",
            "Collaborating with product team to define technical requirements",
            "Optimizing application performance and reducing load times by 40%"
        ],
        technologies: ["Python", "Laravel", "Vue.js", "TensorFlow", "AWS", "Docker", "PostgreSQL", "Redis", "GraphQL"],
        achievements: [
            "Successfully launched 3 major AI-powered features serving 100K+ users",
            "Reduced system downtime by 60% through improved monitoring and alerting",
            "Implemented automated testing framework increasing code coverage to 85%",
            "Led migration from monolithic to microservices architecture"
        ]
    },
    exp2: {
        role: "Software Engineer",
        company: "Innovation Labs",
        duration: "2020 - 2022",
        logo: "assets/images/company-placeholder.svg",
        responsibilities: [
            "Developed scalable web applications using Laravel and Vue.js",
            "Implemented machine learning models for predictive analytics",
            "Built RESTful APIs serving mobile and web applications",
            "Collaborated with cross-functional teams in Agile environment",
            "Optimized database queries and improved application performance",
            "Participated in technical design discussions and sprint planning"
        ],
        technologies: ["PHP", "Laravel", "Vue.js", "Python", "Scikit-learn", "MySQL", "Docker", "Git"],
        achievements: [
            "Developed ML model with 92% accuracy for customer churn prediction",
            "Built real-time analytics dashboard processing 1M+ events daily",
            "Reduced API response time by 50% through caching strategies",
            "Mentored 2 junior developers and conducted technical workshops"
        ]
    },
    exp3: {
        role: "Junior Developer",
        company: "StartUp Solutions",
        duration: "2018 - 2020",
        logo: "assets/images/company-placeholder.svg",
        responsibilities: [
            "Built responsive web applications using modern frameworks",
            "Contributed to various client projects across different industries",
            "Implemented frontend features using JavaScript and CSS",
            "Participated in code reviews and team meetings",
            "Fixed bugs and improved existing codebase",
            "Learned best practices in software development"
        ],
        technologies: ["JavaScript", "PHP", "Laravel", "Bootstrap", "jQuery", "MySQL", "Git"],
        achievements: [
            "Successfully delivered 10+ client projects on time",
            "Improved website performance by 35% through optimization",
            "Received 'Rising Star' award for outstanding contributions",
            "Quickly adapted to new technologies and frameworks"
        ]
    }
};

// Initialize Experience Modal
function initializeExperienceModal() {
    const experienceItems = document.querySelectorAll('.timeline-item.clickable');
    const modal = document.getElementById('experienceModal');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalClose = modal.querySelector('.modal-close');

    experienceItems.forEach(item => {
        item.addEventListener('click', function () {
            const expId = this.getAttribute('data-experience');
            showExperienceModal(expId);
        });
    });

    // Close modal handlers
    modalClose.addEventListener('click', () => closeModal(modal));
    modalOverlay.addEventListener('click', () => closeModal(modal));

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

function showExperienceModal(expId) {
    const data = experienceData[expId];
    if (!data) return;

    const modal = document.getElementById('experienceModal');

    // Populate modal content
    document.getElementById('modalRole').textContent = data.role;
    document.getElementById('modalCompany').innerHTML = `<i class="fas fa-building"></i> ${data.company}`;
    document.getElementById('modalDuration').innerHTML = `<i class="fas fa-calendar-alt"></i> ${data.duration}`;
    document.getElementById('modalCompanyLogo').src = data.logo;

    // Responsibilities
    const responsibilitiesList = document.getElementById('modalResponsibilities');
    responsibilitiesList.innerHTML = data.responsibilities.map(resp => `<li>${resp}</li>`).join('');

    // Technologies
    const technologiesDiv = document.getElementById('modalTechnologies');
    technologiesDiv.innerHTML = data.technologies.map(tech => `<span class="tag">${tech}</span>`).join('');

    // Achievements
    const achievementsList = document.getElementById('modalAchievements');
    achievementsList.innerHTML = data.achievements.map(ach => `<li>${ach}</li>`).join('');

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================
// Project Tabs & Modal Functionality
// ============================================


// Updated projectData in script.js
const projectData = {
    "fs1": {
        title: "Housebrand AI",
        icon: "fas fa-couch",
        description: "Premium furniture marketplace connecting designers, manufacturers, and high-end clients. The platform provides advanced modules for product management, project workflows, order handling, marketing automation, event management, and content publishing while ensuring secure access through role-based permissions.",
        features: [
            "Project management with dashboards, task tracking, proposals, and invoices",
            "Designer portfolio and inspiration gallery modules",
            "Event management system with centralized calendar",
            "Marketing module for campaigns and tracking",
            "Dynamic role-based access control (RBAC)"
        ],
        technologies: ["Laravel", "REST API", "Vue.js", "MySQL", "Domain Driven Design"],
        projectLink: "https://housebrands.com/",
        githubLink: "#"
    },
    "fs2": {
        title: "Hotelinking",
        icon: "fas fa-hotel",
        description: "Global hotel management hub providing a unified solution for hotel groups to centralize guest data collection, ensure network resilience, and digitize front desk operations securely and scalably.",
        features: [
            "AWS infrastructure management and optimization",
            "Centralized guest data collection",
            "Digitized front desk operations",
            "Real-time problem solving and scalable infrastructure",
            "Safe builds with unit and feature testing"
        ],
        technologies: ["Amplify Gen 2", "Laravel", "REST API", "GraphQL", "DynamoDB", "Astro", "Vue.js", "Nanostores", "AWS"],
        projectLink: "https://www.hotelinking.com/en/",
        githubLink: "#"
    },
    "fs3": {
        title: "Linktiva",
        icon: "fas fa-plug",
        description: "AI-powered Chrome extension for social post automation and content generation, enabling social post automation across various platforms.",
        features: [
            "Backend APIs for Chrome extension",
            "Automation module with job queues",
            "OpenAI integration for text generation",
            "Prompt management and admin dashboard",
            "Stripe subscription system"
        ],
        technologies: ["Laravel", "Livewire", "OpenAI", "Google Clients", "MySQL", "Automated Tool"],
        projectLink: "https://linktiva.com/",
        githubLink: "#"
    },
    "fs4": {
        title: "Bangladesh Navy Ration & Clothing System",
        icon: "fas fa-ship",
        description: "Large-scale distributed management system for Bangladesh Navy handling resource management, ration distribution, and clothing inventory with high security.",
        features: [
            "Advanced inventory and allocation features",
            "Distributed system architecture",
            "Local sync capabilities",
            "Network orchestration",
            "Domain Driven Design implementation"
        ],
        technologies: ["Laravel", "REST API", "Local Sync", "Distributed System", "Vue.js", "Network Orchestration", "MySQL", "Domain Driven Design"],
        projectLink: "#",
        githubLink: "#"
    },
    "fs5": {
        title: "FBCCI Panel System",
        icon: "fas fa-building",
        description: "Comprehensive management platform for Federation of Bangladesh Chambers of Commerce & Industry (FBCCI), handling panel management and organizational workflows.",
        features: [
            "Organizational management modules",
            "Panel management system",
            "Administrative role features",
            "REST API integration with Vue.js",
            "Scalable solution design"
        ],
        technologies: ["Laravel", "RSET API", "Vue.js", "MySQL"],
        projectLink: "#",
        githubLink: "#"
    },
    "fs6": {
        title: "Cantonment English School & College",
        icon: "fas fa-school",
        description: "Highly Scaled School management System for Defence type education organization, providing a comprehensive digital solution for institutional management.",
        features: [
            "Student and faculty management",
            "Cloudflare orchestration for high availability",
            "Automated administrative workflows",
            "Result and attendance management",
            "Communication modules"
        ],
        technologies: ["Laravel", "RSET API", "Vue.js", "Cloudflare Orchestration", "MySQL"],
        projectLink: "#",
        githubLink: "#"
    },
    "fs7": {
        title: "Bangladesh Export Processing Zones Authority (BEPZA)",
        icon: "fas fa-home-user",
        description: "The pioneer investment promotion agency of Bangladesh, providing digital services to facilitate investments and operational management.",
        features: [
            "Investment facilitation modules",
            "Administrative workflow automation",
            "Secure data management for investors",
            "Integration with national systems",
            "Operational reporting and analytics"
        ],
        technologies: ["Laravel", "RSET API", "Vue.js", "MySQL"],
        projectLink: "https://bepza.gov.bd/",
        githubLink: "#"
    },
    "fs8": {
        title: "Bangladesh Energy Society",
        icon: "fas fa-thunderstorm",
        description: "Optimal organization hub for Bangladesh energy society, facilitating communication and organizational processes.",
        features: [
            "Member management system",
            "Event and publication tracking",
            "Administrative dashboard",
            "Secure payment integrations",
            "Collaborative portal for researchers"
        ],
        technologies: ["Laravel", "RSET API", "Vue.js", "MySQL"],
        projectLink: "https://bangladeshenergysociety.org/",
        githubLink: "#"
    },
    "fs9": {
        title: "Shopex",
        icon: "fas fa-shop",
        description: "AI Powered Agentic multi-vendor e-commerce Web application with advanced automation and intelligence.",
        features: [
            "Agentic AI for commerce automation",
            "Multi-vendor architecture",
            "OpenAI and Ollama integration",
            "LangChain PHP bindings for orchestration",
            "Seamless shopping experience with RAG"
        ],
        technologies: ["Laravel", "RSET API", "Vue.js", "OpenAI SDK", "Ollama", "Langchain php bindings", "MySQL"],
        projectLink: "#",
        githubLink: "#"
    },
    "fs10": {
        title: "PharmaHub",
        icon: "fas fa-laptop-medical",
        description: "Multi vendor Pharmacy management hub that handles automated supply chain management flow from manufacturers to consumers.",
        features: [
            "SaaS based multi-tenant architecture",
            "Automated supply chain management",
            "Inventory and expiration tracking",
            "Multi-vendor orchestration",
            "Real-time analytics for pharmacies"
        ],
        technologies: ["Laravel", "RSET API", "Vue.js", "SaaS", "Multi Tenant", "MySQL"],
        projectLink: "#",
        githubLink: "#"
    },
    "fs11": {
        title: "EX3 Hub",
        icon: "fas fa-money-bill-wave",
        description: "Crypto currency trading hub enabling secure and real-time trading of digital assets.",
        features: [
            "Web3 and Ethereum integration",
            "Real-time price tracking via WebSockets",
            "Secure wallet management",
            "Solidity based smart contracts",
            "Trading dashboard with live updates"
        ],
        technologies: ["Laravel", "RSET API", "web3.js", "Solidity", "Ethereum", "Socket.io", "WebSocket", "WebRTC", "Vue.js", "SaaS", "Multi Tenant", "MySQL"],
        projectLink: "#",
        githubLink: "#"
    },
    "fs12": {
        title: "Cvtron",
        icon: "fas fa-user-tie",
        description: "ATS Friendly AI Powered Resume Builder with multi profile management for job seekers.",
        features: [
            "AI-powered content generation for resumes",
            "ATS scoring and optimization",
            "Multi-profile management",
            "React.js based interactive UI",
            "SaaS multi-tenant architecture"
        ],
        technologies: ["Laravel", "RSET API", "React.js", "SaaS", "Typescript", "Multi Tenant", "MySQL"],
        projectLink: "#",
        githubLink: "#"
    },
    "ml1": {
        title: "FirstStep AI Assistant",
        icon: "fas fa-microchip",
        description: "High-performance Offline edge-optimized RAG system with inference batching, designed for low-latency AI responses on edge devices.",
        features: [
            "Offline edge-optimized RAG system",
            "Multi-threaded inference batching",
            "TensorRT-LLM and CUDA acceleration",
            "Deployment on NVIDIA Jetson Orin Xavier",
            "High availability and fault tolerance"
        ],
        technologies: ["FastAPI", "TensorRT-LLM", "LangChain", "Ollama", "RAG Orchestration", "Batch Inference", "CUDA Optimization", "Edge Computing", "Jetson Orin", "Jetson Orin Xavier"],
        projectLink: "#",
        githubLink: "#"
    },
    "ml2": {
        title: "AI Sales Assistant- Real estate",
        icon: "fas fa-microchip",
        description: "Highly optimized RAG sysetm for real state management system, facilitating intelligent property search and queries.",
        features: [
            "Real estate specific RAG pipeline",
            "FAISS and ChromaDB vector storage",
            "ConversationalBuffer Memory implementation",
            "Automated property inquiry handling",
            "Integration with OpenAI and Ollama"
        ],
        technologies: ["FastAPI", "OpenAI", "LangChain", "FAISS", "ChromaDB", "Ollama", "RAG Orchestration", "ConversationalBuffer Memory"],
        projectLink: "#",
        githubLink: "#"
    },
    "ml3": {
        title: "Carvu AI- Car Insurance forgery solution",
        icon: "fas fa-microchip",
        description: "highly optimized AI assistant to Identify fake Car accident issue and predict the cost estimation for the Govt.",
        features: [
            "Multimodal Model for image and text",
            "Forgery detection in accident images",
            "Cost estimation prediction",
            "RAG orchestration for insurance policies",
            "Dockerized deployment system"
        ],
        technologies: ["FastAPI", "OpenAI", "Multimodal Model", "LangChain", "Image Recognition", "FAISS", "ChromaDB", "Ollama", "Docker", "RAG Orchestration"],
        projectLink: "#",
        githubLink: "#"
    },
    "ml4": {
        title: "Geno AI - AI Coding Agent",
        icon: "fas fa-robot",
        description: "Highly Optimized Agentic system that will search and review and fix coding errors autonomously.",
        features: [
            "Autonomous coding agent pipeline",
            "LLM as Judge for code verification",
            "Pydantic AI for structured outputs",
            "Integration with ChromaDB for RAG",
            "Automated bug identification and patching"
        ],
        technologies: ["FastAPI", "Ollama", "OpenAI", "Agentic pipeline", "Pydantic AI", "ChromaDB", "RAGAS", "LLM as Judge"],
        projectLink: "#",
        githubLink: "#"
    },
    "ml5": {
        title: "Advanced RAG System",
        icon: "fas fa-robot",
        description: "Multifunctional and multi-typed RAG system for Business(Fintech), handling complex queries and multimodal data.",
        features: [
            "Multimodal pipeline integration",
            "LangGraph for complex agent flows",
            "Kokoro TTS for audio responses",
            "Fintech specific knowledge base",
            "Dockerized scalable deployment"
        ],
        technologies: ["FastAPI", "Langchain", "LangGraph", "FAISS", "Ollama", "OpenaAI", "Sentence Transformer", "Agentic pipeline", "Multimodal pipeline", "Kokoro TTS model", "Docker", "ChromaDB"],
        projectLink: "#",
        githubLink: "#"
    },
    "ml6": {
        title: "Graph RAG System",
        icon: "fas fa-robot",
        description: "Advanced Graph RAG system to handle Multihop Queries using knowledge graphs and Neo4j.",
        features: [
            "Multihop query resolution with Graphs",
            "Neo4j integration for knowledge graph",
            "NER and Corpus Registry",
            "Canonical mapping implementation",
            "LLM as Judge using RAGAS"
        ],
        technologies: ["FastAPI", "Ollama", "OpenAI", "NER", "Corpus Registry", "Neo4j", "Canocial mapping", "ChromaDB", "RAGAS", "LLM as Judge"],
        projectLink: "#",
        githubLink: "#"
    },
    "res1": {
        title: "A Secure Telemedicine Scheme based on Distributed database, machine Learning and IoT for diabetes Detection",
        icon: "fas fa-heartbeat",
        description: "A Secure Telemedicine Scheme based on Distributed database, machine Learning and IoT for diabetes Detection. AI-powered remote patient monitoring and diagnosis.",
        features: [
            "Distributed database for security",
            "IoT-based health monitoring",
            "Machine Learning for diagnosis",
            "Secure telemedicine scheme",
            "Remote patient interaction"
        ],
        technologies: ["Deep Learning", "Distributed database system", "Healthcare", "IoT"],
        projectLink: "#",
        githubLink: "#"
    },
    "res2": {
        title: "Bangla Sentence Classification Using Bangle BERT and XaI",
        icon: "fas fa-brain",
        description: "Bangla Sentence Classification Using Bangla BERT and XAI. Novel approach to deep transfer learning in Low level language.",
        features: [
            "Deep Transfer Learning with BERT",
            "Explainable AI (XaI) implementation",
            "CNN and BiLSTM ensemble",
            "Large-scale Bangla dataset processing",
            "Fine-tuned transformer models"
        ],
        technologies: ["Deep Transfer Learning", "Explainable AI", "CNN", "BiLSTM"],
        projectLink: "#",
        githubLink: "#"
    },
    "res3": {
        title: "A Comprehensive Epidemiological Dengue Dataset of Bangladesh",
        icon: "fas fa-network-wired",
        description: "A Comprehensive Epidemiological Dengue Dataset of Bangladesh. Impapactful opensource Dataset to predict Dengue disease.",
        features: [
            "Large-scale data collection and analysis",
            "Statistical analysis for epidemiology",
            "Machine learning feature extraction",
            "Peer-reviewed publication",
            "Publicly available research dataset"
        ],
        technologies: ["Research Methodologies", "Research Data", "Data Analysis", "Disease Detection"],
        projectLink: "#",
        githubLink: "#"
    }
};



// Initialize Project Tabs
function initializeProjectTabs() {
    const projectTabButtons = document.querySelectorAll('.project-tab-btn');
    const projectCategoryContents = document.querySelectorAll('.project-category-content');

    projectTabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const category = this.getAttribute('data-project-category');

            // Remove active class from all tabs
            projectTabButtons.forEach(btn => btn.classList.remove('active'));
            projectCategoryContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(category).classList.add('active');
        });
    });
}

// Initialize Project Modal
function initializeProjectModal() {
    const projectCards = document.querySelectorAll('.project-card.clickable');
    const modal = document.getElementById('projectModal');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalClose = modal.querySelector('.modal-close');

    projectCards.forEach(card => {
        card.addEventListener('click', function () {
            const projectId = this.getAttribute('data-project');
            showProjectModal(projectId);
        });
    });

    // Close modal handlers
    modalClose.addEventListener('click', () => closeModal(modal));
    modalOverlay.addEventListener('click', () => closeModal(modal));

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal(modal);
        }
    });
}

function showProjectModal(projectId) {
    const data = projectData[projectId];
    if (!data) return;

    const modal = document.getElementById('projectModal');

    // Populate modal content
    document.getElementById('modalProjectTitle').textContent = data.title;
    document.getElementById('modalProjectIcon').className = data.icon;
    document.getElementById('modalProjectDescription').textContent = data.description;

    // Features
    const featuresList = document.getElementById('modalProjectFeatures');
    featuresList.innerHTML = data.features.map(feature => `<li>${feature}</li>`).join('');

    // Technologies
    const techDiv = document.getElementById('modalProjectTech');
    techDiv.innerHTML = data.technologies.map(tech => `<span class="tag">${tech}</span>`).join('');

    // Links
    document.getElementById('modalProjectLink').href = data.projectLink;
    document.getElementById('modalProjectGithub').href = data.githubLink;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal function
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize all modal and tab functionality
function initializeModalsAndTabs() {
    initializeExperienceModal();
    initializeProjectTabs();
    initializeProjectModal();
}

// Call initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModalsAndTabs);
} else {
    initializeModalsAndTabs();
}
