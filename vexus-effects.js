document.addEventListener('DOMContentLoaded', function() {
    const textGridContainer = document.querySelector('.text-reveal-zone');
    const hiddenText = document.querySelector('.brand-text');
    
    if (textGridContainer && hiddenText) {
        const rect = textGridContainer.getBoundingClientRect();
        let mouseX = rect.width / 2, mouseY = rect.height / 2;
        let currentX = mouseX, currentY = mouseY;
        let time = 0;
        
        let mousePresent = false;
        
        // Create background image element
        const bgImage = document.createElement('img');
        bgImage.src = 'r-Vexus.png';
        bgImage.style.position = 'absolute';
        bgImage.style.top = '0';
        bgImage.style.left = '0';
        bgImage.style.width = '100%';
        bgImage.style.height = '100%';
        bgImage.style.objectFit = 'cover';
        bgImage.style.opacity = '0';
        bgImage.style.zIndex = '1';
        bgImage.style.pointerEvents = 'none';
        textGridContainer.appendChild(bgImage);
        
        const sprites = document.querySelectorAll('.orbiter');
        const spritePositions = Array.from(sprites).map((sprite, i) => {
            const angle = Math.PI * 2 * i / sprites.length;
            const x = mouseX + Math.cos(angle) * 500;
            const y = mouseY + Math.sin(angle) * 500;
            sprite.style.opacity = '0';
            sprite.style.left = x + 'px';
            sprite.style.top = y + 'px';
            return { x, y };
        });
        
        const particles = [];
        const maxParticles = 150;
        
        const cyberNav = document.querySelector('.cyber-nav');
        
        textGridContainer.addEventListener('mouseenter', () => {
            mousePresent = true;
            if (cyberNav) {
                cyberNav.style.transform = 'translateY(-80%)';
                cyberNav.style.opacity = '0.1';
            }
        });
        
        textGridContainer.addEventListener('mousemove', (e) => {
            const newRect = textGridContainer.getBoundingClientRect();
            mouseX = e.clientX - newRect.left;
            mouseY = e.clientY - newRect.top;
            mousePresent = true;
        });
        

        textGridContainer.addEventListener('mouseleave', () => {
            mousePresent = false;
            const newRect = textGridContainer.getBoundingClientRect();
            mouseX = newRect.width / 2;
            mouseY = newRect.height / 2;
            if (cyberNav) {
                cyberNav.style.transform = 'translateY(0)';
                cyberNav.style.opacity = '1';
            }
            
            // Create intense glow ring
            const glowRing = document.createElement('div');
            glowRing.style.position = 'absolute';
            glowRing.style.left = '50%';
            glowRing.style.top = '50%';
            glowRing.style.transform = 'translate(-50%, -50%)';
            glowRing.style.borderRadius = '50%';
            glowRing.style.pointerEvents = 'none';
            glowRing.style.zIndex = '5';
            textGridContainer.appendChild(glowRing);
            
            let ringSize = 20;
            const animate = () => {
                ringSize += 8;
                const progress = ringSize / 400;
                const opacity = Math.max(0, 1 - progress);
                
                glowRing.style.width = ringSize + 'px';
                glowRing.style.height = ringSize + 'px';
                glowRing.style.border = `4px solid rgba(0, 255, 255, ${opacity})`;
                glowRing.style.boxShadow = `
                    0 0 ${ringSize / 2}px rgba(0, 255, 255, ${opacity}),
                    0 0 ${ringSize / 3}px rgba(255, 0, 255, ${opacity * 0.8}),
                    inset 0 0 ${ringSize / 4}px rgba(0, 255, 255, ${opacity * 0.4})
                `;
                
                if (progress < 1) requestAnimationFrame(animate);
                else glowRing.remove();
            };
            animate();
        });
        
        let isDispersing = true;
        const disperseTargets = [];
        
        function animate() {
            time += 0.008;
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;
            
            if (!isDispersing) {
                const pulse = 0.8 + Math.sin(time * 2) * 0.2;
                const glitch = Math.sin(time * 15) > 0.9 ? (Math.random() - 0.5) * 20 : 0;
                const glitchY = Math.sin(time * 18) > 0.92 ? (Math.random() - 0.5) * 15 : 0;
                const innerRadius = 60 + Math.sin(time * 3) * 15;
                
                const cyanCore = `radial-gradient(circle ${innerRadius}px at ${currentX + glitch}px ${currentY + glitchY}px, rgba(0, 255, 255, ${0.6 * pulse}), transparent 50%)`;
                const magentaRing = `radial-gradient(circle 120px at ${currentX - glitch}px ${currentY - glitchY}px, rgba(255, 0, 255, ${0.3 * pulse}), transparent)`;
                const dataStream = `radial-gradient(circle 200px at ${currentX + Math.sin(time * 8) * 15}px ${currentY + Math.cos(time * 12) * 10}px, rgba(0, 255, 255, 0.08), transparent)`;
                const ambient = `radial-gradient(circle 300px at ${currentX}px ${currentY}px, rgba(20, 0, 40, 0.7), transparent)`;
                
                textGridContainer.style.background = `${cyanCore}, ${magentaRing}, ${dataStream}, ${ambient}, #0a0015`;
                
                const newRect = textGridContainer.getBoundingClientRect();
                const textDistance = Math.sqrt((currentX - newRect.width/2)**2 + (currentY - newRect.height/2)**2);
                const textProximity = Math.max(0, 1 - textDistance / 120);
                
                // Show background image when sprites are centered
                bgImage.style.opacity = textProximity > 0.1 ? textProximity * 0.15 : 0;
                
                if (textProximity > 0.3) {
                    const shimmer = Math.sin(time * 8) * 0.1 + 0.9;
                    const letterSpacing = (1 - textProximity) * 15;
                    const digitalGlitch = Math.sin(time * 25) > 0.95 ? (Math.random() - 0.5) * 4 : 0;
                    const verticalGlitch = Math.sin(time * 30) > 0.97 ? (Math.random() - 0.5) * 2 : 0;
                    const chromaShift = Math.sin(time * 22) > 0.93 ? 2 : 0;
                    
                    if (Math.sin(time * 35) > 0.98) {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
                        const glitchText = 'VEXUS'.split('').map(char => 
                            Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : char
                        ).join('');
                        hiddenText.textContent = glitchText;
                        setTimeout(() => hiddenText.textContent = 'VEXUS', 50);
                    }
                    
                    hiddenText.style.textShadow = `${chromaShift}px 0 rgba(0,255,255,${textProximity * 0.8}), ${-chromaShift}px 0 rgba(255,0,255,${textProximity * 0.6}), 0 0 ${textProximity * 12}px rgba(0,255,255,${textProximity * 0.2})`;
                    hiddenText.style.letterSpacing = letterSpacing + 'px';
                    hiddenText.style.opacity = textProximity * shimmer * 0.6;
                    hiddenText.style.transform = `translate(${digitalGlitch}px, ${verticalGlitch}px)`;
                } else {
                    hiddenText.style.textShadow = 'none';
                    hiddenText.style.opacity = '0';
                    hiddenText.style.letterSpacing = '3px';
                    hiddenText.style.transform = 'translateX(0)';
                }
                
                sprites.forEach((sprite, i) => {
                    const delay = i * 0.3;
                    const erratic = Math.sin(time * (3 + i)) * 15;
                    
                    const prevX = spritePositions[i].x;
                    const prevY = spritePositions[i].y;
                    
                    spritePositions[i].x += (currentX - spritePositions[i].x) * (0.03 + i * 0.01);
                    spritePositions[i].y += (currentY - spritePositions[i].y) * (0.03 + i * 0.01);
                    
                    const orbitRadius = mousePresent ? erratic : erratic * 3;
                    const finalX = spritePositions[i].x + Math.sin(time * 4 + delay) * orbitRadius;
                    const finalY = spritePositions[i].y + Math.cos(time * 3 + delay) * orbitRadius;
                    
                    const dx = finalX - prevX;
                    const dy = finalY - prevY;
                    const speed = Math.sqrt(dx * dx + dy * dy);
                    const emissionRate = Math.min(0.9, speed * 0.05);
                    
                    if (Math.random() < emissionRate) {
                        particles.push({
                            x: finalX,
                            y: finalY,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2,
                            life: 0.4 + Math.random() * 0.3,
                            decay: 0.05 + Math.random() * 0.04,
                            size: 1 + Math.random() * 2,
                            spriteId: i
                        });
                    }
                    
                    sprite.style.opacity = '0.7';
                    sprite.style.left = finalX + 'px';
                    sprite.style.top = finalY + 'px';
                });
                
                for (let i = particles.length - 1; i >= 0; i--) {
                    const particle = particles[i];
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.life -= particle.decay;
                    particle.vx *= 0.98;
                    particle.vy *= 0.98;
                    
                    if (particle.life <= 0) {
                        particle.element?.remove();
                        particles.splice(i, 1);
                        continue;
                    }
                    
                    if (!particle.element) {
                        particle.element = document.createElement('div');
                        particle.element.style.position = 'absolute';
                        particle.element.style.pointerEvents = 'none';
                        particle.element.style.borderRadius = '50%';
                        particle.element.style.zIndex = '4';
                        textGridContainer.appendChild(particle.element);
                    }
                    
                    const colors = ['rgba(0,255,255,', 'rgba(255,0,255,'];
                    const color = colors[particle.spriteId % 2];
                    particle.element.style.background = `${color}${particle.life})`;
                    particle.element.style.boxShadow = `0 0 ${particle.size * 2}px ${color}${particle.life * 0.5})`;
                    particle.element.style.width = particle.size + 'px';
                    particle.element.style.height = particle.size + 'px';
                    particle.element.style.left = particle.x + 'px';
                    particle.element.style.top = particle.y + 'px';
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        setTimeout(() => { isDispersing = false; }, 100);
        animate();
    }
    
    // Form enhancements
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#ff00ff';
            this.style.boxShadow = '0 0 10px rgba(255, 0, 255, 0.3)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = 'rgba(0, 255, 255, 0.3)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Nav matrix text reveal effect
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const originalText = link.textContent;
        
        link.addEventListener('mouseenter', function() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
            let iterations = 0;
            
            const interval = setInterval(() => {
                this.textContent = originalText.split('').map((char, index) => {
                    if (index < iterations) return originalText[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join('');
                
                if (iterations >= originalText.length) clearInterval(interval);
                iterations += 1/3;
            }, 30);
        });
    });
    
    // Submit button effect
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff)';
        });
        
        submitBtn.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(45deg, #00ffff, #ff00ff)';
        });
    }
});