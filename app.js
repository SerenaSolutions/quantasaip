document.addEventListener('DOMContentLoaded', () => {

  // --- Smooth scrolling for navigation links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Generic Modal Handling ---
  const setupModal = (modalId, openTriggers, closeTriggers) => {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('[id$="-content"]');
    
    const openModal = () => {
      modal.classList.remove('hidden');
      setTimeout(() => modalContent.classList.add('visible'), 10);
    };

    const closeModal = () => {
      modalContent.classList.remove('visible');
      setTimeout(() => modal.classList.add('hidden'), 300);
    };

    document.querySelectorAll(openTriggers).forEach(trigger => trigger.addEventListener('click', openModal));
    document.querySelectorAll(closeTriggers).forEach(trigger => trigger.addEventListener('click', closeModal));
    
    return { modal, closeModal };
  };

  // --- Backend API URL ---
  const BASE_API_URL = 'http://127.0.0.1:8000'; // IMPORTANT: Change this to your deployed backend URL

  // --- Product Lead Capture Modal ---
  const { modal: productModal, closeModal: closeProductModal } = setupModal('product-modal', null, '#close-product-modal');
  const productNameEl = document.getElementById('product-name');
  const productForm = document.getElementById('product-form');
  let productToDownload = '';

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productName = card.dataset.product;
      productToDownload = card.dataset.file;
      productNameEl.textContent = productName;
      productModal.classList.remove('hidden');
      setTimeout(() => productModal.querySelector('#product-modal-content').classList.add('visible'), 10);
    });
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = productForm.querySelector('input[type="text"]').value;
    const email = productForm.querySelector('input[type="email"]').value;
    const product = productNameEl.textContent;

    if (name && email) {
      try {
        const response = await fetch(`${BASE_API_URL}/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, product })
        });
        if (response.ok) {
          alert(`Obrigado, ${name}! O datasheet para ${product} será baixado agora.`);
          closeProductModal();
          const link = document.createElement('a');
          link.href = productToDownload;
          link.download = productToDownload;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          productForm.reset();
        } else {
          const errorData = await response.json();
          alert(`Erro ao enviar dados: ${errorData.detail || response.statusText}`);
        }
      } catch (error) {
        console.error('Erro ao conectar com o backend:', error);
        alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      }
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  });

  // --- Payment Modal & Pricing Logic ---
  const { modal: paymentModal, closeModal: closePaymentModal } = setupModal('payment-modal', null, '#close-modal');
  const planNameEl = document.getElementById('plan-name');
  const planPriceEl = document.getElementById('plan-price');

  document.querySelectorAll('.pricing-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const planType = button.dataset.planType;
      const planCard = button.closest('.bg-slate-800');
      const planName = planCard.querySelector('h3').textContent;

      if (planType === 'buy') {
        const planPrice = planCard.querySelector('p[class*="text-4xl"]').textContent;
        planNameEl.textContent = planName;
        planPriceEl.textContent = planPrice;
        paymentModal.classList.remove('hidden');
        setTimeout(() => paymentModal.querySelector('#payment-modal-content').classList.add('visible'), 10);
      } else if (planType === 'contact') {
        document.querySelector('#contact').scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the contact form briefly
        const contactForm = document.querySelector('#contact .max-w-2xl');
        contactForm.style.transition = 'all 0.3s ease-in-out';
        contactForm.style.boxShadow = '0 0 25px rgba(24, 226, 253, 0.7)';
        setTimeout(() => { contactForm.style.boxShadow = ''; }, 1500);
      }
    });
  });

  // Payment tabs logic
  const cardTab = document.getElementById('card-tab');
  const pixTab = document.getElementById('pix-tab');
  const cardPayment = document.getElementById('card-payment');
  const pixPayment = document.getElementById('pix-payment');
  cardTab.addEventListener('click', () => {
    cardTab.classList.add('active-tab');
    pixTab.classList.remove('active-tab');
    cardPayment.classList.remove('hidden');
    pixPayment.classList.add('hidden');
  });
  pixTab.addEventListener('click', () => {
    pixTab.classList.add('active-tab');
    cardTab.classList.remove('active-tab');
    pixPayment.classList.remove('hidden');
    cardPayment.classList.add('hidden');
  });

  // Payment form submission
  document.getElementById('card-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert(`Pagamento para o plano ${planNameEl.textContent} processado com sucesso! Bem-vindo à AigroNovaTech.`);
    closePaymentModal();
  });

  document.getElementById('copy-pix-code').addEventListener('click', () => {
    const pixCode = '00020126330014br.gov.bcb.pix0111012345678900204000003039865802BR5913AigroNovaTech6009SAO PAULO62070503***6304E7E1';
    navigator.clipboard.writeText(pixCode).then(() => {
      alert('Código Pix copiado para a área de transferência!');
    }, () => {
      alert('Falha ao copiar o código Pix.');
    });
  });

  // --- All other forms (Sign-up, Contact, Ebook) ---
  const handleFormSubmission = async (formSelector, endpoint, successMessage, dataExtractor, isLogin = false) => {
    const form = document.querySelector(formSelector);
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = dataExtractor(form);
        if (!formData) {
          alert('Por favor, preencha todos os campos obrigatórios.');
          return;
        }

        try {
          let response;
          if (isLogin) {
            const formBody = new URLSearchParams();
            for (const key in formData) {
              formBody.append(key, formData[key]);
            }
            response = await fetch(`${BASE_API_URL}${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: formBody.toString()
            });
          } else {
            response = await fetch(`${BASE_API_URL}${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
          }

          if (response.ok) {
            const responseData = await response.json();
            if (isLogin && responseData.access_token) {
              localStorage.setItem('access_token', responseData.access_token);
              alert('Login bem-sucedido! Bem-vindo de volta.');
              // Optionally redirect or update UI for logged-in state
            } else {
              alert(successMessage);
            }
            form.reset();
          } else {
            const errorData = await response.json();
            alert(`Erro ao enviar dados: ${errorData.detail || response.statusText}`);
          }
        } catch (error) {
          console.error('Erro ao conectar com o backend:', error);
          alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
        }
      });
    }
  };

  // Data extractors for each form
  const signUpDataExtractor = (form) => {
    const name = form.querySelector('input[placeholder="Seu nome completo"]').value;
    const email = form.querySelector('input[placeholder="Seu e-mail"]').value;
    const password = form.querySelector('input[placeholder="Crie uma senha"]').value;
    if (name && email && password) return { name, email, password };
    return null;
  };

  const contactDataExtractor = (form) => {
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const subject = form.querySelector('#subject').value;
    const message = form.querySelector('#message').value;
    if (name && email && subject && message) return { name, email, message: `Assunto: ${subject} - Mensagem: ${message}` };
    return null;
  };

  const ebookDataExtractor = (form) => {
    const email = form.querySelector('input[type="email"]').value;
    if (email) return { name: 'Ebook Subscriber', email, product: 'Ebook: The Quantum Leap for Modern SaaS' };
    return null;
  };

  const loginDataExtractor = (form) => {
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    if (email && password) return { username: email, password: password };
    return null;
  };

  // Attach handlers to forms
  handleFormSubmission('.form-glass', '/register', 'Conta criada com sucesso! Em breve você receberá mais informações no seu e-mail.', signUpDataExtractor);
  handleFormSubmission('#contact form', '/lead', 'Mensagem enviada com sucesso! Entraremos em contato em breve.', contactDataExtractor);
  handleFormSubmission('#ebook-form', '/lead', 'Obrigado! Seu ebook está a caminho do seu e-mail e você será notificado sobre o nosso próximo webinar.', ebookDataExtractor);
  
  // Handle login form separately if it exists
  const loginLink = document.querySelector('#login-link');
  const { modal: loginModal, closeModal: closeLoginModal } = setupModal('login-modal', '#login-link', '#close-login-modal');
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = loginDataExtractor(loginForm);
      if (!formData) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      try {
        const formBody = new URLSearchParams();
        for (const key in formData) {
          formBody.append(key, formData[key]);
        }
        const response = await fetch(`${BASE_API_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody.toString()
        });

        if (response.ok) {
          const responseData = await response.json();
          localStorage.setItem('access_token', responseData.access_token);
          alert('Login bem-sucedido! Bem-vindo de volta.');
          closeLoginModal();
          loginForm.reset();
          // Optionally update UI for logged-in state, e.g., hide login/register buttons
        } else {
          const errorData = await response.json();
          alert(`Erro ao fazer login: ${errorData.detail || response.statusText}`);
        }
      } catch (error) {
        console.error('Erro ao conectar com o backend para login:', error);
        alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      }
    });
  }

  // --- Chatbot Functionality ---
  const API_KEY = 'AIzaSyAwff3Z8aWOtR_L1mVIO484W3tkskiysxM'; // THIS KEY IS NOW ONLY FOR LOCAL TESTING, WILL BE REMOVED
  const chatBubble = document.getElementById('chat-bubble');
  const chatWindow = document.getElementById('chat-window');
  const closeChat = document.getElementById('close-chat');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatBody = document.getElementById('chat-body');
  let conversationHistory = [];

  chatBubble.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
  closeChat.addEventListener('click', () => chatWindow.classList.add('hidden'));

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    appendMessage(userInput, 'user');
    chatInput.value = '';
    showThinkingIndicator(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        appendMessage('Por favor, faça login para usar o chatbot.', 'bot');
        showThinkingIndicator(false);
        return;
      }

      const response = await fetch(`${BASE_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_message: userInput })
      });

      if (response.ok) {
        const data = await response.json();
        appendMessage(data.bot_message, 'bot');
      } else if (response.status === 401) {
        alert('Sua sessão expirou ou você não está autorizado. Por favor, faça login novamente.');
        localStorage.removeItem('access_token');
        appendMessage('Sua sessão expirou. Por favor, faça login novamente.', 'bot');
      } else {
        const errorData = await response.json();
        console.error('Error from backend chat API:', errorData);
        appendMessage(`Erro do chatbot: ${errorData.detail || response.statusText}`, 'bot');
      }
    } catch (error) {
      console.error('Erro ao conectar com o backend para o chat:', error);
      appendMessage('Desculpe, estou com problemas para me conectar ao chatbot. Tente novamente mais tarde.', 'bot');
    } finally {
      showThinkingIndicator(false);
    }
  });

  function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    // conversationHistory.push({ role: sender === 'user' ? 'user' : 'model', parts: [{ text }] }); // History managed by backend now
  }

  function showThinkingIndicator(show) {
    let indicator = chatBody.querySelector('.thinking-indicator');
    if (show && !indicator) {
      indicator = document.createElement('div');
      indicator.classList.add('thinking-indicator');
      indicator.textContent = 'Nova está pensando...';
      chatBody.appendChild(indicator);
      chatBody.scrollTop = chatBody.scrollHeight;
    } else if (!show && indicator) {
      indicator.remove();
    }
  }

  // Removed getGeminiResponse from frontend as it's now handled by backend
});
