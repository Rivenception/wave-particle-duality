// Global variables for animation frames
let waveSimAnimationId = null;
let doubleSlitAnimationId = null;
let uncertaintyAnimationId = null;
let waveFunctionAnimationId = null;

// Tab functionality
function openTab(event, tabName) {
  // Hide all tab content
  const tabContent = document.getElementsByClassName("tab-pane");
  for (let i = 0; i < tabContent.length; i++) {
    tabContent[i].classList.remove("active");
  }
  
  // Remove active class from all tabs
  const tabs = document.getElementsByClassName("tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  
  // Show the selected tab content and add active class to the clicked tab
  document.getElementById(tabName).classList.add("active");
  event.currentTarget.classList.add("active");
  
  // Stop all animations when switching tabs
  cancelAnimationFrame(waveSimAnimationId);
  cancelAnimationFrame(doubleSlitAnimationId);
  cancelAnimationFrame(uncertaintyAnimationId);
  cancelAnimationFrame(waveFunctionAnimationId);
  
  // Start the appropriate simulation
  if (tabName === "waveSim") {
    initWaveSim();
  } else if (tabName === "doubleSlit") {
    initDoubleSlitSim();
  } else if (tabName === "uncertainty") {
    initUncertaintySim();
  } else if (tabName === "waveFunctions") {
    initWaveFunctionSim();
  }
}

// =============== WAVE PROPERTIES SIMULATION ===============
let waveSimTime = 0;
let wavePoints = [];

function initWaveSim() {
  const canvas = document.getElementById("waveSimCanvas");
  const ctx = canvas.getContext("2d");
  
  // Initialize wave points
  wavePoints = [];
  for (let x = 0; x < canvas.width; x++) {
    wavePoints.push({ x: x, y: canvas.height / 2 });
  }
  
  updateWaveSim();
}

function updateWaveSim() {
  const canvas = document.getElementById("waveSimCanvas");
  const ctx = canvas.getContext("2d");
  const waveType = document.getElementById("waveType").value;
  const frequency = parseInt(document.getElementById("waveFreq").value);
  const amplitude = parseInt(document.getElementById("waveAmplitude").value);
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update wave points
  for (let i = 0; i < wavePoints.length; i++) {
    const x = wavePoints[i].x;
    let y = canvas.height / 2;
    
    // Calculate y based on wave type
    if (waveType === "sine") {
      y = canvas.height / 2 - amplitude * Math.sin(2 * Math.PI * frequency * x / canvas.width + waveSimTime);
    } else if (waveType === "square") {
      const value = Math.sin(2 * Math.PI * frequency * x / canvas.width + waveSimTime);
      y = canvas.height / 2 - amplitude * (value >= 0 ? 1 : -1);
    } else if (waveType === "sawtooth") {
      const phase = (frequency * x / canvas.width + waveSimTime / (2 * Math.PI)) % 1;
      y = canvas.height / 2 - amplitude * (2 * phase - 1);
    }
    
    wavePoints[i].y = y;
  }
  
  // Draw wave
  ctx.beginPath();
  ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
  for (let i = 1; i < wavePoints.length; i++) {
    ctx.lineTo(wavePoints[i].x, wavePoints[i].y);
  }
  ctx.strokeStyle = "#3498db";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw axes
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Update time and request next frame
  waveSimTime += 0.05;
  waveSimAnimationId = requestAnimationFrame(updateWaveSim);
}

function resetWaveSim() {
  waveSimTime = 0;
  document.getElementById("waveType").value = "sine";
  document.getElementById("waveFreq").value = 5;
  document.getElementById("waveAmplitude").value = 50;
  initWaveSim();
}

// =============== DOUBLE-SLIT SIMULATION ===============
let doubleSlitRunning = false;
let particlesArray = [];
let pattern = [];

function initDoubleSlitSim() {
  const canvas = document.getElementById("doubleSlitSimCanvas");
  const ctx = canvas.getContext("2d");
  
  // Initialize pattern array to count impacts
  pattern = new Array(canvas.width).fill(0);
  particlesArray = [];
  
  drawDoubleSlitSetup();
}

function toggleDoubleSlitSim() {
  doubleSlitRunning = !doubleSlitRunning;
  if (doubleSlitRunning) {
    updateDoubleSlitSim();
  }
}

function updateDoubleSlitSim() {
  if (!doubleSlitRunning) return;
  
  const canvas = document.getElementById("doubleSlitSimCanvas");
  const ctx = canvas.getContext("2d");
  const particleRate = parseInt(document.getElementById("particleRate").value);
  const slitWidth = parseInt(document.getElementById("slitWidth").value);
  const slitSeparation = parseInt(document.getElementById("slitSeparation").value);
  const particleType = document.getElementById("particleType").value;
  
  // Add new particles
  for (let i = 0; i < particleRate / 10; i++) {
    particlesArray.push({
      x: 0,
      y: canvas.height / 2 + (Math.random() - 0.5) * 100,
      vx: 2 + Math.random(),
      vy: 0,
      passed: false,
      color: particleType === "photon" ? "#ffff00" : 
             particleType === "electron" ? "#00ffff" : "#ff00ff"
    });
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw barrier with slits
  const barrierX = canvas.width / 3;
  const slit1Center = canvas.height / 2 - slitSeparation / 2;
  const slit2Center = canvas.height / 2 + slitSeparation / 2;
  
  ctx.fillStyle = "#666";
  ctx.fillRect(barrierX, 0, 5, slit1Center - slitWidth / 2);
  ctx.fillRect(barrierX, slit1Center + slitWidth / 2, 5, slit2Center - slit1Center - slitWidth);
  ctx.fillRect(barrierX, slit2Center + slitWidth / 2, 5, canvas.height - (slit2Center + slitWidth / 2));
  
  // Draw detection screen
  ctx.fillStyle = "#333";
  ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
  
  // Draw interference pattern
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] > 0) {
      const intensity = Math.min(pattern[i] * 5, 255);
      ctx.fillStyle = `rgba(255, 255, 255, ${intensity / 255})`;
      ctx.fillRect(canvas.width - 20, i, 20, 1);
    }
  }
  
  // Update and draw particles
  for (let i = particlesArray.length - 1; i >= 0; i--) {
    const p = particlesArray[i];
    
    // Update position
    p.x += p.vx;
    p.y += p.vy;
    
    // Check if particle has reached the barrier
    if (!p.passed && p.x >= barrierX && p.x <= barrierX + 5) {
      // Check if particle passes through slits
      if ((p.y >= slit1Center - slitWidth / 2 && p.y <= slit1Center + slitWidth / 2) ||
          (p.y >= slit2Center - slitWidth / 2 && p.y <= slit2Center + slitWidth / 2)) {
        p.passed = true;
        
        // Apply quantum effects - add interference
        if (particleType !== "photon") {
          // Quantum behavior: apply wave-like effects
          const angle = Math.random() * Math.PI - Math.PI / 2;
          p.vy = Math.sin(angle) * p.vx * 0.5;
        } else {
          // Photons show stronger interference
          const angle = Math.random() * Math.PI - Math.PI / 2;
          p.vy = Math.sin(angle) * p.vx * 0.8;
        }
      } else {
        // Remove particles that hit the barrier
        particlesArray.splice(i, 1);
        continue;
      }
    }
    
    // Check if particle has reached the screen
    if (p.x >= canvas.width - 20) {
      const y = Math.floor(p.y);
      if (y >= 0 && y < canvas.height) {
        pattern[y]++;
      }
      particlesArray.splice(i, 1);
      continue;
    }
    
    // Draw particle
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  doubleSlitAnimationId = requestAnimationFrame(updateDoubleSlitSim);
}

function drawDoubleSlitSetup() {
  const canvas = document.getElementById("doubleSlitSimCanvas");
  const ctx = canvas.getContext("2d");
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw barrier with slits
  const barrierX = canvas.width / 3;
  const slitWidth = parseInt(document.getElementById("slitWidth").value);
  const slitSeparation = parseInt(document.getElementById("slitSeparation").value);
  const slit1Center = canvas.height / 2 - slitSeparation / 2;
  const slit2Center = canvas.height / 2 + slitSeparation / 2;
  
  ctx.fillStyle = "#666";
  ctx.fillRect(barrierX, 0, 5, slit1Center - slitWidth / 2);
  ctx.fillRect(barrierX, slit1Center + slitWidth / 2, 5, slit2Center - slit1Center - slitWidth);
  ctx.fillRect(barrierX, slit2Center + slitWidth / 2, 5, canvas.height - (slit2Center + slitWidth / 2));
  
  // Draw detection screen
  ctx.fillStyle = "#333";
  ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);
}

function resetDoubleSlitSim() {
  doubleSlitRunning = false;
  document.getElementById("particleRate").value = 20;
  document.getElementById("particleType").value = "photon";
  document.getElementById("slitWidth").value = 5;
  document.getElementById("slitSeparation").value = 50;
  initDoubleSlitSim();
}

// =============== UNCERTAINTY PRINCIPLE SIMULATION ===============
let particleState = {
  position: { value: 0, uncertainty: 0 },
  momentum: { value: 0, uncertainty: 0 }
};

function initUncertaintySim() {
  particleState = {
    position: { value: 0, uncertainty: 30 },
    momentum: { value: 0, uncertainty: 30 }
  };
  
  updateUncertaintySim();
}

function updateUncertaintySim() {
  const canvas = document.getElementById("uncertaintyCanvas");
  const ctx = canvas.getContext("2d");
  const precision = parseInt(document.getElementById("measurePrecision").value);
  const measureType = document.querySelector('input[name="measureType"]:checked').value;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update uncertainties based on measurement precision
  if (measureType === "position") {
    particleState.position.uncertainty = 100 - precision;
    // Heisenberg principle: ΔxΔp ≥ ħ/2
    particleState.momentum.uncertainty = 3000 / particleState.position.uncertainty;
  } else {
    particleState.momentum.uncertainty = 100 - precision;
    particleState.position.uncertainty = 3000 / particleState.momentum.uncertainty;
  }
  
  // Draw coordinate system
  ctx.strokeStyle = "#999";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  
  // Draw position probability distribution
  ctx.strokeStyle = "#3498db";
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let x = 0; x < canvas.width; x++) {
    const xNorm = (x - canvas.width / 2) / 50;
    const y = Math.exp(-((xNorm - particleState.position.value) ** 2) / (2 * (particleState.position.uncertainty / 50) ** 2));
    ctx.lineTo(x, canvas.height / 2 - y * 100);
  }
  
  ctx.stroke();
  
  // Draw momentum probability distribution
  ctx.strokeStyle = "#e74c3c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let x = 0; x < canvas.width; x++) {
    const pNorm = (x - canvas.width / 2) / 50;
    const y = Math.exp(-((pNorm - particleState.momentum.value) ** 2) / (2 * (particleState.momentum.uncertainty / 50) ** 2));
    ctx.lineTo(x, canvas.height / 2 + y * 100);
  }
  
  ctx.stroke();
  
  // Draw labels
  ctx.font = "14px Arial";
  ctx.fillStyle = "#3498db";
  ctx.fillText("Position Distribution (Δx = " + particleState.position.uncertainty.toFixed(1) + ")", 20, 30);
  
  ctx.fillStyle = "#e74c3c";
  ctx.fillText("Momentum Distribution (Δp = " + particleState.momentum.uncertainty.toFixed(1) + ")", 20, canvas.height - 20);
  
  ctx.fillStyle = "#000";
  ctx.fillText("Uncertainty Principle: Δx·Δp ≥ ħ/2", canvas.width / 2 - 120, canvas.height / 2);
  
  // Product of uncertainties
  const product = particleState.position.uncertainty * particleState.momentum.uncertainty;
  ctx.fillText("Δx·Δp = " + product.toFixed(1), canvas.width / 2 - 50, canvas.height / 2 + 20);
  
  uncertaintyAnimationId = requestAnimationFrame(updateUncertaintySim);
}

function resetUncertaintySim() {
  document.getElementById("measurePrecision").value = 50;
  document.getElementById("positionMeasure").checked = true;
  initUncertaintySim();
}

// =============== WAVE FUNCTION SIMULATION ===============
let waveFunctionRunning = false;
let waveFunctionTime = 0;
let waveFunction = [];

function initWaveFunctionSim() {
  const canvas = document.getElementById("waveFunctionCanvas");
  const ctx = canvas.getContext("2d");
  
  // Initialize wave function
  waveFunction = new Array(canvas.width).fill(0);
  waveFunctionTime = 0;
  
  updateWaveFunctionSim();
}

function toggleWaveFunctionSim() {
  waveFunctionRunning = !waveFunctionRunning;
  if (waveFunctionRunning) {
    animateWaveFunction();
  }
}

function updateWaveFunctionSim() {
  const canvas = document.getElementById("waveFunctionCanvas");
  const ctx = canvas.getContext("2d");
  const potentialType = document.getElementById("potentialTypeSim").value;
  const energyLevel = parseInt(document.getElementById("energyLevel").value);
  const showProbability = document.getElementById("showProbability").checked;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw potential
  drawPotential(ctx, potentialType, canvas);
  
  // Calculate wave function based on potential and energy level
  calculateWaveFunction(potentialType, energyLevel);
  
  // Draw wave function
  drawWaveFunction(ctx, canvas, showProbability);
  
  if (!waveFunctionRunning) {
    waveFunctionAnimationId = requestAnimationFrame(updateWaveFunctionSim);
  }
}

function animateWaveFunction() {
  if (!waveFunctionRunning) return;
  
  waveFunctionTime += 0.05;
  updateWaveFunctionSim();
  waveFunctionAnimationId = requestAnimationFrame(animateWaveFunction);
}

function calculateWaveFunction(potentialType, energyLevel) {
  const canvas = document.getElementById("waveFunctionCanvas");
  
  for (let x = 0; x < canvas.width; x++) {
    const xNorm = x / canvas.width;
    let psi = 0;
    
    switch (potentialType) {
      case "none-sim": // Free particle
        const k = energyLevel * Math.PI * 2;
        psi = Math.sin(k * xNorm + waveFunctionTime);
        break;
        
      case "harmonic-sim": // Harmonic oscillator
        const n = energyLevel - 1;
        const omega = 2 * Math.PI;
        
        // Simplified Hermite polynomial
        let hermite = 0;
        if (n === 0) hermite = 1;
        else if (n === 1) hermite = 2 * (xNorm - 0.5) * 10;
        else if (n === 2) hermite = 4 * (xNorm - 0.5) ** 2 * 100 - 2;
        else if (n === 3) hermite = 8 * (xNorm - 0.5) ** 3 * 1000 - 12 * (xNorm - 0.5) * 10;
        else hermite = Math.sin(n * Math.PI * xNorm); // Approximation for higher levels
        
        const alpha = 10; // Scale factor
        psi = hermite * Math.exp(-alpha * (xNorm - 0.5) ** 2 / 2) * 
              Math.cos(omega * waveFunctionTime + n * Math.PI / 2);
        break;
        
      case "well-sim": // Infinite square well
        if (xNorm > 0.1 && xNorm < 0.9) {
          psi = Math.sin(energyLevel * Math.PI * (xNorm - 0.1) / 0.8) * 
                Math.cos(energyLevel * energyLevel * Math.PI * Math.PI * waveFunctionTime / 2);
        }
        break;
        
      case "barrier-sim": // Potential barrier
        // Region before barrier
        if (xNorm < 0.4) {
          const k = energyLevel * Math.PI;
          psi = Math.sin(k * xNorm + waveFunctionTime);
        } 
        // Barrier region (tunneling)
        else if (xNorm >= 0.4 && xNorm <= 0.6) {
          const kappa = energyLevel * Math.PI;
          const amplitude = Math.exp(-kappa * (xNorm - 0.4));
          psi = amplitude * Math.sin(kappa * 0.4 + waveFunctionTime);
        } 
        // Region after barrier
        else {
          const k = energyLevel * Math.PI;
          const amplitude = Math.exp(-k * 0.2); // Tunneling attenuation
          psi = amplitude * Math.sin(k * xNorm + waveFunctionTime);
        }
        break;
    }
    
    waveFunction[x] = psi;
  }
}

function drawPotential(ctx, potentialType, canvas) {
  ctx.strokeStyle = "#999";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  
  ctx.fillStyle = "rgba(100, 100, 100, 0.2)";
  
  switch (potentialType) {
    case "none-sim": // Free particle (zero potential)
      break;
      
    case "harmonic-sim": // Harmonic oscillator
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const xNorm = x / canvas.width - 0.5;
        const potential = 100 * xNorm * xNorm;
        ctx.lineTo(x, canvas.height / 2 - potential);
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.lineTo(0, canvas.height / 2);
      ctx.fill();
      break;
      
    case "well-sim": // Infinite square well
      ctx.fillRect(0, 0, 0.1 * canvas.width, canvas.height);
      ctx.fillRect(0.9 * canvas.width, 0, 0.1 * canvas.width, canvas.height);
      break;
      
    case "barrier-sim": // Potential barrier
      ctx.fillRect(0.4 * canvas.width, 0, 0.2 * canvas.width, canvas.height / 2);
      break;
  }
}

function drawWaveFunction(ctx, canvas, showProbability) {
  const centerY = canvas.height / 2;
  const scale = 80;
  
  // Draw real part
  ctx.strokeStyle = "#3498db";
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let x = 0; x < canvas.width; x++) {
    ctx.lineTo(x, centerY - waveFunction[x] * scale);
  }
  
  ctx.stroke();
  
  // Draw probability density if selected
  if (showProbability) {
    ctx.strokeStyle = "#e74c3c";
    ctx.fillStyle = "rgba(231, 76, 60, 0.2)";
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let x = 0; x < canvas.width; x++) {
      const probability = waveFunction[x] * waveFunction[x] * scale / 2;
      ctx.lineTo(x, centerY + probability);
    }
    
    ctx.lineTo(canvas.width, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

// function drawPotential(ctx, potentialType, canvas) {
//     ctx.strokeStyle = "#999";
//     ctx.setLineDash([5, 5]);
//     ctx.beginPath();
//     ctx.moveTo(0, canvas.height / 2);
//     ctx.lineTo(canvas.width, canvas.height / 2);
//     ctx.stroke();
//     ctx.setLineDash([]);
    
//     ctx.fillStyle = "rgba(100, 100, 100, 0.2)";
    
//     switch (potentialType) {
//       case "none-sim": // Free particle (zero potential)
//         break;
        
//       case "harmonic-sim": // Harmonic oscillator
//         ctx.beginPath();
//         const harmonicScale = 50; // Added scaling factor
//         for (let x = 0; x < canvas.width; x++) {
//           const xNorm = x / canvas.width - 0.5;
//           const potential = 100 * xNorm * xNorm;
//           // Scale the potential to fit the canvas
//           ctx.lineTo(x, canvas.height / 2 - potential * harmonicScale);
//         }
//         ctx.lineTo(canvas.width, canvas.height / 2);
//         ctx.lineTo(0, canvas.height / 2);
//         ctx.fill();
//         break;
        
//       case "well-sim": // Infinite square well
//         ctx.fillRect(0, 0, 0.1 * canvas.width, canvas.height); // Left side wall
//         ctx.fillRect(0.9 * canvas.width, 0, 0.1 * canvas.width, canvas.height); // Right side wall
//         break;
        
//       case "barrier-sim": // Potential barrier
//         ctx.fillRect(0.4 * canvas.width, 0, 0.2 * canvas.width, canvas.height / 2);
//         break;
//     }
//   }
  

// function drawWaveFunction(ctx, canvas, waveFunction, showProbability) {
//     const centerY = canvas.height / 2;
//     const scale = 80; // Scaling factor for the wave function
    
//     // Draw real part
//     ctx.strokeStyle = "#3498db";
//     ctx.lineWidth = 2;
//     ctx.beginPath();
    
//     for (let x = 0; x < canvas.width; x++) {
//       ctx.lineTo(x, centerY - waveFunction[x] * scale);
//     }
    
//     ctx.stroke();
    
//     // Draw probability density if selected
//     if (showProbability) {
//       ctx.strokeStyle = "#e74c3c";
//       ctx.fillStyle = "rgba(231, 76, 60, 0.2)";
//       ctx.beginPath();
//       ctx.moveTo(0, centerY);
      
//       const probabilityScale = 50; // Scaling factor for probability density
//       for (let x = 0; x < canvas.width; x++) {
//         const probability = waveFunction[x] * waveFunction[x] * scale / 2;
//         // Apply scaling to probability and ensure it stays within canvas height
//         ctx.lineTo(x, centerY + probability * probabilityScale);
//       }
      
//       ctx.lineTo(canvas.width, centerY);
//       ctx.closePath();
//       ctx.fill();
//       ctx.stroke();
//     }
//   }
  

function resetWaveFunctionSim() {
  waveFunctionRunning = false;
  document.getElementById("potentialTypeSim").value = "none-sim";
  document.getElementById("energyLevel").value = 1;
  document.getElementById("showProbability").checked = true;
  initWaveFunctionSim();
}

// Initialize all simulations when the page loads
document.addEventListener("DOMContentLoaded", function() {
  // Initialize first tab by default
  initWaveSim();
});