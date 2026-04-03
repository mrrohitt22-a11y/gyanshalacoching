// ── SCROLL PROGRESS & NAVBAR BACKGROUND
window.addEventListener('scroll', () => {
  const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  const progressBar = document.getElementById('progress-bar');
  const navbar = document.getElementById('navbar');
  
  if (progressBar) progressBar.style.width = scrolled + '%';
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── REVEAL ON SCROLL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── COUNT UP ANIMATION
function animateCount(el) {
  const target = parseFloat(el.dataset.target || el.textContent);
  if (isNaN(target)) return;
  
  const suffix = el.dataset.suffix || (el.textContent.includes('%') ? '%' : el.textContent.includes('★') ? '★' : '');
  let current = 0;
  const duration = 2000; // 2 seconds
  const frameRate = 1000 / 60; // 60fps
  const totalFrames = Math.round(duration / frameRate);
  const increment = target / totalFrames;
  
  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    current = increment * frame;
    
    if (frame >= totalFrames) {
      clearInterval(timer);
      el.textContent = (target % 1 === 0 ? target : target.toFixed(1)) + suffix;
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, frameRate);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCount);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.hero-stats');
if (statsSection) countObserver.observe(statsSection);

// ── MOBILE MENU TOGGLE
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  if (!links) return;
  
  if (links.style.display === 'flex') {
    links.style.display = 'none';
  } else {
    links.style.cssText = `
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      background: rgba(7, 20, 16, 0.97);
      padding: 2rem;
      gap: 1.5rem;
      border-bottom: 1px solid rgba(23, 198, 98, 0.2);
      backdrop-filter: blur(20px);
      z-index: 999;
    `;
  }
}

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth < 900) {
      const links = document.querySelector('.nav-links');
      if (links) links.style.display = 'none';
    }
  });
});

// ── SCROLL TO SECTION
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    const offset = 70; // Navbar height
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// ── FORM SUBMISSION (CONNECTS TO GOOGLE SHEET & GMAIL)
function submitForm(event) {
  event.preventDefault();
  
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;
  
  const data = {
    name: document.getElementById('f-name').value.trim(),
    phone: document.getElementById('f-phone').value.trim(),
    class: document.getElementById('f-class').value,
    subject: document.getElementById('f-subject').value,
    message: document.getElementById('f-msg').value.trim()
  };
  
  if (!data.name || !data.phone) {
    alert('Please fill in your name and phone number.');
    return false;
  }
  
  // Show Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = "Sending... ⏳";
  
  // Google Apps Script Web App URL
  // NOTE: Add your Google Script URL here (removed for GitHub push to avoid Secret Scanning block)
  const SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL';
  
  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // For Google Apps Script integration
    cache: 'no-cache',
    body: JSON.stringify(data)
  })
  .then(() => {
    document.getElementById('enquiryForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
  })
  .catch(error => {
    alert('Failed to send enquiry. Please try again later.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  });
  
  return false;
}

// ── AI CHATBOT LOGIC (ENHANCED)
let isBotTyping = false;

function toggleChat() {
  const window = document.getElementById('chat-window');
  const chatIcon = document.querySelector('.chat-icon');
  const closeIcon = document.querySelector('.chat-close-icon');
  
  if (window.classList.contains('active')) {
    window.classList.remove('active');
    chatIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  } else {
    window.classList.add('active');
    chatIcon.style.display = 'none';
    closeIcon.style.display = 'block';
    
    // Auto-focus input
    setTimeout(() => document.getElementById('chat-input').focus(), 400);
  }
}

function handleChatEnter(e) {
  if (e.key === 'Enter') sendMessage();
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message || isBotTyping) return;

  addMessage(message, 'user');
  input.value = '';
  
  // Show Typing Indicator
  isBotTyping = true;
  showTyping();

  // Simulate AI Thinking
  setTimeout(() => {
    hideTyping();
    const response = getAIResponse(message);
    addMessage(response, 'bot');
    isBotTyping = false;
  }, 1500);
}

function showTyping() {
  const container = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator';
  typingDiv.className = 'message bot typing';
  typingDiv.innerHTML = `<div class="message-content">
    <div class="dots"><span></span><span></span><span></span></div>
  </div>`;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

function addMessage(text, sender) {
  const container = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender} reveal-msg`;
  msgDiv.innerHTML = `<div class="message-content">${text}</div>`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function getAIResponse(input) {
  const q = input.toLowerCase();
  
  // 1. Basic Greetings
  if (/(hi|hello|hey|namaste|helo)/.test(q)) {
    return "Namaste! 🙏 I'm the Gyan Shala AI Assistant. How can I help you regarding our coaching, timings, or admissions today?";
  }

  // 2. Fees Related
  if (/(fee|charge|cost|money|amount|pay|pricing)/.test(q)) {
    return "We maintain high-quality education at very honest pricing. 💰 Fee structures vary by class (6th-12th) and subject. I recommend reaching out via our **Admission Enquiry** form on this page so our team can provide you with the exact details for your batch.";
  }

  // 3. Courses/Classes
  if (/(course|class|batch|subject|study|teach|program)/.test(q)) {
    return "We offer comprehensive tutoring for: <br>• **Class 6th-8th**: Foundation build-up.<br>• **Class 9th-10th**: Board Mastery.<br>• **Class 11th-12th**: Science Stream (Physics, Chemistry, Maths).<br>• **IIT-JEE Foundation**: Starting from Class 9th.";
  }

  // 4. Location
  if (/(where|location|place|address|area|faridabad|ballabhgarh)/.test(q)) {
    return "📍 We are located at: **2066A, Main Road, HB Colony, Sector 3, Ballabhgarh, Faridabad**. We are very close to Tagore Academy Public School.";
  }

  // 5. Faculty Specific
  if (/(teacher|faculty|sir|mam|staff|komal|arun)/.test(q)) {
    if (q.includes('komal')) return "Komal Ma'am is our **Physics Expert**. She is widely regarded as one of the best in Faridabad for conceptual physics.";
    if (q.includes('arun')) return "Arun Sir leads our **Mathematics** wing. He has a track record of helping students achieve perfect 100s in boards!";
    return "Our faculty consists of dedicated subject experts. You can meet Komal Ma'am and Arun Sir at the center for a detailed counseling session.";
  }

  // 6. Results
  if (/(result|score|mark|topper|pass)/.test(q)) {
    return "Gyan Shala students consistently break records! 🏆 We have students scoring **99 in Maths** and **100 in Science**. Check the 'Student Results' section for their stories.";
  }

  // 7. Recorded Classes
  if (/(recorded|video|online|lecture|absent|backup)/.test(q)) {
    return "Yes! 🎥 One of our best features is **Recorded Lectures**. If a student misses a class or wants to revise, they can watch the recording anytime.";
  }

  // 8. Contact
  if (/(contact|phone|call|number|reach|connect)/.test(q)) {
    return "📞 You can call us directly at **097735 07501**. We are available Mon-Sat, 10 AM to 7 PM.";
  }

  // Fallback
  return "That's an interesting question! 💡 As an AI, I'm still learning. For a detailed answer, why don't you try our **Admission Enquiry form**? Or you can call us at 097735 07501.";
}
