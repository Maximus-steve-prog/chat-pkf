$(function(){

  
  const senderId = localStorage.getItem('id');
  const token = localStorage.getItem('token'); // ton token
  let receiverId = null;
  let receiver_picture ='';
  const previewContainer = $('#preview-container');
  const conversation = $('.conversation');  
  const receivingTone = new Audio('/static/tones/confirmationtone.wav');
  const sendingTone = new Audio('/static/tones/MessageReceive.wav');
  const messageInput = document.querySelector('#messageInput');
  const sendMessageBtn = document.querySelector('.send-message-btn');
  const sender_photo_preview = localStorage.getItem('my_profile') || 'https://via.placeholder.com/150';

  const typingIndicator = $('.typing-indicator');
  const selected_employee_name = document.querySelector('#selected-Employee-name');

   const socket = io({
    query: { user_id: senderId },
    transports: ['websocket'] 
    });
    
    // Listen for 'typing' event from server
    socket.on('typing', (data) => {
        //  console.log('Typing event received:', data.receiverId !== localStorage.getItem('id'));
        if (data.receiverId === localStorage.getItem('id')) return; // Ignore if not for you
        
        let currentText;
        if (data.isTyping) {
            // Show indicator
            typingIndicator.text('is typing...');
            document.querySelectorAll('.typing-indicator-contact').forEach(indicate =>{
                let id = indicate.getAttribute('data-id');
                if(id == data.senderId){
                    currentText = indicate.getAttribute('currentText');
    
                    indicate.innerText = 'is typing...';
                }
            });
        } else {
            // Hide indicator
            typingIndicator.text('online');
            document.querySelectorAll('.typing-indicator-contact').forEach(indicate => {
              let id = indicate.getAttribute('data-id');
              if (id == data.senderId) {
                currentText = indicate.nextElementSibling.getHTML();
                indicate.innerHTML = `${currentText}`;
              }
            })
        }
    });


    // Listen for downloded book by a specific employee
    socket.on('book_downloaded', function(data) {
        showMessage('success', `${data.employee} downloaded : ${data.book}`);
    });
  function ReceivingMessageSound() {
    receivingTone.play();
  }
  function SendingMessageSound() {
    sendingTone.play();
  }

    // Listen for joinning room by the self connected employee
    socket.on('join_room', (data) => {
        console.log('User connected ' + data.user_id)
    });
    
    //Listen for socket error
    socket.on('connect_error', (err) => {
      console.error('Connect error:', err.message);
    });

    // Listen for uploaded_books event
    socket.on('book_uploaded', function(data) {
        showMessage('success', `${data.employee} uploaded : ${data.book}`);
        fetchAllBooks();
    });

    // Listen for a current connected employee
    socket.on('connected_other_user', function(data) {
      // console.log('This user is connected :', data);
      showMessage('success', data.employee + ' is online');
    });


  // Define custom extension validation method
  $.validator.addMethod("extension", function(value, element, param) {
      if (this.optional(element)) {
        return true;
      }
      if (!value) {
        return false; // or true if empty allowed
      }
      var extension = value.split('.').pop().toLowerCase();
      // param is a string of allowed extensions, e.g., "jpg|png|gif"
      return param.split('|').indexOf(extension) !== -1;
  }, "Please select a file with a valid extension.");
  
  $('.nav-item').on('mouseover', function(){
      $(this).find('.sub-item').stop(true, true).slideDown(500);
  });

  function applyTheme(isDark) {
    if (isDark) {
      $('body').addClass('dark');
      $('#themeIcon').removeClass('fa-sun').addClass('fa-moon');
    } else {
      $('body').removeClass('dark');
      $('#themeIcon').removeClass('fa-moon').addClass('fa-sun');
    }
          
  }
      
  // Load saved preference
  const darkModePref = localStorage.getItem('darkMode');
  if (darkModePref !== null) {
    applyTheme(darkModePref === 'true');
  } else {
    // Default to light mode
    applyTheme(false);
  }
      
  $('.darkModeToggle').click(function() {
    const isDark = $('body').hasClass('dark');
    // Toggle theme
    applyTheme(!isDark);
    // Save preference
    localStorage.setItem('darkMode', !$('body').hasClass('dark'));
  });

  const swipers = new Swiper('.mySwiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });

  $('.toggle_menu').on('click', function(){
    $('nav').toggleClass('active');
  });

  $(document).on('mouseover', function(e){
    if(!$(e.target).closest('.nav-item, .sub-item, .item, nav').length){
        $('.sub-item').stop(true, true).slideUp(300);
    }
  });

  $(document).on('click', function(e){
    if(!$(e.target).closest('nav, .toggle_menu').length){
        $('nav').removeClass('active');
    }
  });

  $(window).resize(function() {
    if ($(window).width() < 768) {
      $('.nav-item').on('mouseover', function(){
        $(this).find('.sub-item').css('display', 'none');
      });
    } else if ($(window).width() < 400) {
    
    }
  });

  $('section .border').hover(
    function() {
      $(this).addClass('shadow-lg');
    },
    function() {
      $(this).removeClass('shadow-lg');
    }
  );
  
  // Search filter
  $('#searchInput').keyup(function() {
    const query = $(this).val().toLowerCase();
    $('section .container .list .border').each(function() {
      const name = $(this).find('h2').text().toLowerCase();
      if (name.includes(query)) {
        $(this).parent().show();
      } else {
        $(this).parent().hide();
      }
    });
  });

  if($(window).on('scroll', function() {
    $('nav').removeClass('active');
  }));

  var $circle = $('#circleProgress');
  // Function to update the progress circle based on scroll
  function updateProgress() {
    var scrollTop = $(window).scrollTop();
    var docHeight = $(document).height() - $(window).height();
    var scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
    var degree = (scrollPercent / 100) * 360;

    // Set the conic-gradient with the progress
    $circle.css('background', `conic-gradient(rgba(99, 102, 241, 1) ${degree}deg, transparent ${degree}deg, transparent 360deg)`);

    // Optional: hide button when at top
    if (scrollTop > 50) {
    $circle.fadeIn();
    } else {
    $circle.fadeOut();
    }
  }

  $('.backto-contact').on('click', function() {
    $('.contact').removeClass('hidden');
    conversation.html(''); // Clear the conversation
    conversation.append(`<svg class="conversation-loader hidden bg-gray-100 absolute inset-0 m-auto h-5 w-5 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>`);
    $('.chat-room').addClass('hidden');
    fetchEmployeeContacts();
    
  });

  // Function to update the progress circle based on scroll
 
  // Scroll event to update progress
  $(window).on('scroll', updateProgress);
  // Initialize on load
  updateProgress();
  // Click event to scroll to top
  $circle.on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 600);
      $('html, body').animate({ scrollTop: 0 }, 600);
  });

  function showPopup($popup) {
    // Show overlay
    $('#overlay').removeClass('hidden');
    // Show popup container
    $popup.removeClass('hidden').attr('aria-hidden', 'false');
    // Animate popup content
    const $content = $popup.find('> div');
    $content.removeClass('scale-0 opacity-0').addClass('scale-100 opacity-100');
  }
    
  function hidePopup($popup) {
    const $content = $popup.find('> div');
    // Animate out
    $content.removeClass('scale-100 opacity-100').addClass('scale-0 opacity-0');
    // After transition, hide overlay and popup
    setTimeout(() => {
      $popup.addClass('hidden').attr('aria-hidden', 'true');
      $('#overlay').addClass('hidden');
    }, 300); 
  }

  if(localStorage.getItem('chat')== 'Active'){
    // alert('Chat is active');
    showPopup($('#chatPopup'));
    $('#circleProgress').removeClass('z-50').addClass('z-0');
    $('.openChat').addClass('opacity-0');
  }else{
    $('#circleProgress').removeClass('z-0').addClass('z-50');
    $('.openChat').removeClass('opacity-0');
  }
      
  $('.openChat').click(function() {
    if (localStorage.getItem('user') !== null) {
      showPopup($('#chatPopup'));
      localStorage.setItem('chat','Active')
      $(this).addClass('opacity-0');
      fetchEmployeeContacts();
      $('#circleProgress').removeClass('z-50').addClass('z-0');
    }else {
      showPopup($('#loginPopup'));
      $('.openChat').addClass('hidden');
    }
  });

  $('#closeChat').click(function() {
    conversation.html('');
    hidePopup($('#chatPopup'));
    receiverId = null;
    $('.openChat').removeClass('hidden').show();
    localStorage.setItem('chat','Desactive')
    $('#circleProgress').removeClass('z-0').addClass('z-50');
  });

  // Open login popup
  $('.loginBtn').click(function() {
    showPopup($('#loginPopup'));
    $('.openChat').addClass('hidden');
  });

  // Open register popup
  $('.registerBtn').click(function() {
    showPopup($('#registerPopup'));
    $('.openChat').addClass('hidden');
  });

  // Close buttons
  $('#closeLogin').click(function() {
    hidePopup($('#loginPopup'));
    $('.openChat').removeClass('hidden');
  });

  $('#closeRegister').click(function() {
    hidePopup($('#registerPopup'));
    $('.openChat').removeClass('hidden');
  });

  // Clicking overlay closes popups
  $('#overlay').on( 'click', function() {
    // alert('Overlay clicked!');
    hidePopup($('#loginPopup'));
    hidePopup($('#registerPopup'));
  });
    
  // Optional: handle form submissions
  $('#loginForm').validate({
    rules: {
      userName: {
        required: true,
        minlength: 2
      },
      loginPassword: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      userName: {
        required: "Please enter your full name",
        minlength: "Name must be at least 2 characters"
      },
      loginPassword: {
        required: "Please enter your password",
        minlength: "Password must be at least 6 characters"
      }
    },
    submitHandler: function(form) {
      const fullName = form.userName.value.trim();
      const password = form.loginPassword.value;
      // Show spinner
      var $submitBtn = $('#loginBtn');
      var $text = $submitBtn.find('.button-text');
      var $spinner = $submitBtn.find('svg');
      $text.addClass('hidden');
      $spinner.removeClass('hidden');
      axios.post('login', {
        fullName,
        password
      })
      .then(function(response) {
        const data = response.data;

        if (data.me === fullName) {

          $text.removeClass('hidden');
          $spinner.addClass('hidden');
          form.reset();
          localStorage.setItem('user', data.me);
          localStorage.setItem('token', data.token);
          localStorage.setItem('id', data.id);
          localStorage.setItem('my_profile', data.my_profile);
          // 🔥 Emit to notify others that this user is online
          socket.emit('user_connected', {
            employee: data.me,
            status: data.status
          });

          window.location.reload(); // Reload the page to apply changes

          // Optionally update UI
          hidePopup($('#loginPopup'));
          $('.openChat').removeClass('hidden');
      }
      })
      .catch(function(error) {
        const errMsg = error.response?.data?.message || 'Login failed';
        $text.removeClass('hidden');
        $spinner.addClass('hidden');
        showMessage('error', errMsg);
      });
    }

  });

  getAllEmployees();



  socket.on('connect', () => {
    console.log('Socket connected');
  });


  function getAllEmployees() {
    const token = localStorage.getItem('token'); // ton token
    if (token !== null) {
      axios.get('/get_all_employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(function(response) {
        let employees = response.data; // assuming response.data is already an array

        $('#employees').empty(); // Optional: clear previous content

        employees.forEach(employee => {
        $('#employees').append(`
          <div class="swiper-slide snap-center p-2 lg:w-1/3 md:w-1/2 w-full">
            <div class="bg-white h-full dark:bg-gray-700 flex flex-col items-center border border-gray-200 p-4 rounded-lg cursor-pointer transition-shadow duration-200 hover:shadow-lg">
              <img alt="team" class="w-16 h-16 bg-gray-100 object-cover object-center flex-shrink-0 rounded-full mb-4"
                  src="${employee.photo_path || 'https://via.placeholder.com/150'}" />
              <div class="flex-grow text-center">
                <h2 class="text-gray-900 title-font font-medium mb-1 dark:text-white">${employee.fullName}</h2>
                <p class="text-gray-500 mb-2 dark:text-gray-200">${employee.employee_Type}</p>
                <p class="text-sm text-gray-400 dark:text-gray-300">Last login: ${employee.last_LoginAt || 'N/A'}</p>
                <div class="flex justify-center space-x-3 mt-2">
                  <a href="#" class="text-gray-500 dark:text-white text-xl hover:text-blue-500"><i class="fab fa-twitter"></i></a>
                  <a href="#" class="text-gray-500 dark:text-white text-xl hover:text-blue-700"><i class="fab fa-linkedin"></i></a>
                  <a href="#" class="text-gray-500 dark:text-white text-xl hover:text-gray-900"><i class="fab fa-github"></i></a>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      // Initialize Swiper
      const swiper = new Swiper('#employees-swiper', {
          direction: 'horizontal',
          rtl: true, // enables RTL mode
          slidesPerView: 1,
          spaceBetween: 20,
          loop: true,
          autoplay: {
            delay: 3000,
            reverseDirection: true, // autoplay from right to left
            disableOnInteraction: false,
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }
        });
        
      }).catch(function(error) {
        showPopup($('#loginPopup'));
        
        $('.openChat').addClass('hidden');
        console.error('Error fetching employees:', error.response ? error.response.data : error);
      });
    }
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessageBySelectedUser(senderId, receiverId,receiver_picture) {
    $('.conversation-loader').removeClass('hidden');
    axios.get(`/${senderId}/${receiverId}`)
      .then(response => {
         $('.before-message').remove();
        const messages = response.data;
        $('.conversation-loader').addClass('hidden');
         fileInput.value = ''; // Clear file input after sending
        conversation.html(''); // Clear previous messages
        if (messages.length === 0) {
          conversation.append('<p class="text-gray-500 dark:text-gray-300 text-center mt-4">No messages found.</p>');
          return;
        }
       messages.forEach((msg, index) => {
              const isOutgoing = msg.sender_id == senderId;
              const time = formatTime(msg.send_at);
              const messageId = `msg-${Date.now()}-${index}`;
              let innerHtml = '';
             

              if (msg.msg_type === 'text') {
                innerHtml = `<p class="mb-2 text-base">${msg.msg_content}</p>`;
              } else {
                const url = `${msg.msg_content}`;
                if (msg.msg_type === 'picture') {
                  innerHtml = `<img src="${url}" class="w-48 mb-2 rounded" />`;
                } else if (msg.msg_type === 'video') {
                  innerHtml = `<video src="${url}" controls class="w-48 mb-2 rounded"></video>`;
                } else if (msg.msg_type === 'audio') {
                  innerHtml = `<audio controls src="${url}" class="mb-2 w-48"></audio>`;
                } else if (msg.msg_type === 'voice') {
                  innerHtml = `
                    <div class="waveform" id="${messageId}-wave"></div>
                    <div class="flex items-center justify-between gap-4 mt-1">
                      <button class="play-btn bg-white text-blue-600 w-7 h-7 flex items-center justify-center rounded-full shadow hover:bg-blue-100 transition">
                        <i class="ri-play-fill text-lg" id="${messageId}-icon"></i>
                      </button>
                      <span class="text-xs font-mono opacity-80" id="${messageId}-duration">00:00</span>
                      <a href="${url}" download="audio.webm" class="text-white/80 hover:text-white text-lg">
                        <i class="ri-download-2-line"></i>
                      </a>
                    </div>
                  `;
                }
              }

              let messageHtml = '';

              if (isOutgoing) {
                let sent_status = '';
                const msg_status = msg.msg_status;

                if (msg_status === 'read') {
                  sent_status = '<i class="ri-check-double-fill text-white"></i>';
                } else if (msg_status === 'unread') {
                  sent_status = '<i class="ri-check-double-fill text-gray-400"></i>';
                } else {
                  sent_status = '<i class="ri-check-line text-gray-400"></i>';
                }
                

                messageHtml += `
                  <div class="flex items-center justify-end mb-4 message-wrapper">
                    <div class="action flex mr-2 w-14 h-full items-center justify-center hidden">
                      <div class="dark:bg-black flex items-center justify-between w-full border border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-xl py-1 px-2">
                        <i class="fas fa-smile emoji-button text-gray-500 cursor-pointer" title="Emoji"></i>
                        <i class="fa-solid fa-angle-down text-gray-500"></i>
                      </div>
                    </div>
                    <div class="flex items-end">
                      <div class="bg-blue-500 text-white px-3 py-1 rounded-lg max-w-3xs md:max-w-xs shadow-md relative" id="${messageId}">
                        ${innerHtml}
                        <div class="flex justify-between gap-2 items-center mt-1">
                          <span class="text-xs text-gray-300">${time}</span>
                          ${sent_status}
                        </div>
                        <div class="selected-emoji hidden absolute top-14 w-6 h-6 flex overflow-y-hidden right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full"></div>
                      </div>
                      <img src="${msg.sender_photo}" alt="Contact" class="border translate-y-3 w-8 h-8 object-cover rounded-full ml-2 dark:border-gray-600">
                    </div>
                  </div>`;
              } else {
                messageHtml += `
                  <div class="flex relative justify-start items-center mb-4 message-wrapper">
                    <img src="${receiver_picture}" alt="Contact" class="border -translate-y-4 w-8 h-8 object-cover rounded-full mr-2 dark:border-gray-600">
                    <div class="bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-3 py-0.5 rounded-lg max-w-3xs md:max-w-xs shadow-md relative" id="${messageId}">
                      ${innerHtml}
                      <div class="flex justify-between items-center mt-1">
                        <span class="text-xs text-gray-500">${time}</span>
                      </div>
                      <div class="selected-emoji hidden absolute top-14 w-6 h-6 flex overflow-y-hidden left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full"></div>
                    </div>
                    <div class="action flex ml-2 w-14 h-full items-center justify-center hidden">
                      <div class="dark:bg-black flex items-center justify-between w-full border border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-xl py-1 px-2">
                        <i class="fa-solid fa-angle-down text-gray-500"></i>
                        <i class="fas fa-smile emoji-button text-gray-500 cursor-pointer" title="Emoji"></i>
                      </div>
                    </div>
                  </div>`;
              }

              conversation.append(messageHtml);

              // Scroll to latest message
              conversation.scrollTop(conversation[0].scrollHeight);
              // let conversationHeight = conversation.height();
              // conversation.animate({ scrollTop: conversationHeight }, 100);

              // Setup WaveSurfer for voice messages
              if (msg.msg_type === 'voice') {
                setTimeout(() => {
                  const ws = WaveSurfer.create({
                    container: `#${messageId}-wave`,
                    waveColor: '#ffffff80',
                    progressColor: '#ffffff',
                    height: 20,
                    barWidth: 2,
                    cursorWidth: 1,
                    barRadius: 2,
                    url: msg.msg_content,
                  });

                  const playBtn = $(`#${messageId} .play-btn`);
                  const iconEl = $(`#${messageId}-icon`);
                  const durationEl = $(`#${messageId}-duration`);

                  playBtn.on('click', () => ws.playPause());

                  ws.on('play', () => iconEl.removeClass('ri-play-fill').addClass('ri-pause-fill'));
                  ws.on('pause', () => iconEl.removeClass('ri-pause-fill').addClass('ri-play-fill'));
                  ws.on('ready', () => {
                    const total = Math.floor(ws.getDuration());
                    const mins = Math.floor(total / 60);
                    const secs = total % 60;
                    durationEl.text(`${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`);
                  });
                }, 50);
              }
         conversation.scrollTop(conversation[0].scrollHeight);
            });
          conversation.scrollTop(conversation[0].scrollHeight);
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
    });
  }

  let wavesurfer, record;

  const createRecorder = () => {
    if (wavesurfer) wavesurfer.destroy();

    wavesurfer = WaveSurfer.create({
      container: '#mic',
      waveColor: '#7872F2',
      progressColor: '#246AED',
      height: 20,
      responsive: true,
    });

    record = wavesurfer.registerPlugin(WaveSurfer.Record.create({ scrollingWaveform: true }));

    record.on('record-progress', (time) => {
      const mins = Math.floor((time % 3600000) / 60000);
      const secs = Math.floor((time % 60000) / 1000);
      $('#progress').text(`${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`);
    });

    record.on('record-end', async (blob) => {
      const recordedUrl = URL.createObjectURL(blob);
      const ext = blob.type.split('/')[1] || 'webm';
      const messageId = 'msg-' + Date.now();

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const sent_status = `<i class="ri-check-double-line text-xs text-gray-300 ml-1"></i>` // Example status
      const messageHTML = `
      <div class="before-message flex items-center justify-end mb-4 message-wrapper">
        <!-- Emoji action buttons -->
        <div class="action flex mr-2 w-14 h-full items-center justify-center hidden">
          <div class="dark:bg-black flex items-center justify-between w-full border border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-xl py-1 px-2">
            <i class="fas fa-smile emoji-button text-gray-500 cursor-pointer" title="Emoji"></i>
            <i class="fa-solid fa-angle-down text-gray-500"></i>
          </div>
        </div>

        <!-- Message bubble -->
        <div class="flex items-end">
          <div class="bg-blue-500 text-white px-3 py-1 rounded-lg max-w-3xs md:max-w-xs shadow-md relative" id="${messageId}">

            <!-- Waveform -->
            <div class="waveform" id="${messageId}-wave"></div>

            <!-- Controls -->
            <div class="flex items-center justify-between gap-4 mt-1">
              <button class="play-btn bg-white text-blue-600 w-7 h-7 flex items-center justify-center rounded-full shadow hover:bg-blue-100 transition">
                <i class="ri-play-fill text-lg" id="${messageId}-icon"></i>
              </button>
              <span class="text-xs font-mono opacity-80" id="${messageId}-duration">00:00</span>
              
            </div>

            <!-- Time and status -->
            <div class="flex justify-between gap-2 items-center mt-1">
              <span class="text-xs text-gray-300">${time}</span>
              <svg class="dark:border-gray-600 h-5 w-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>

            <!-- Emoji reaction placeholder -->
            <div class="selected-emoji hidden absolute top-14 w-6 h-6 flex overflow-y-hidden right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full"></div>
          </div>

          <img src="${sender_photo_preview}" alt="Contact" class="border translate-y-3 w-8 h-8 object-cover rounded-full ml-2 dark:border-gray-600">
        </div>
      </div>
      `

      conversation.append(messageHTML)
      // Scroll to latest message
      conversation.scrollTop(conversation[0].scrollHeight);
      // Build form and send to backend
      const formData = new FormData();
      formData.append('receiver_id', receiverId);
      formData.append('msg_type', 'voice');
      formData.append('file', new File([blob], `audio.${ext}`, { type: blob.type }));

      try {
        const response = await axios.post('/send', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Handle response
        console.log('Voice message sent:', response.data);

        
        fetchEmployeeContacts();        // Update message status
        // Playback waveform
        appendMessageBySelectedUser(senderId, receiverId, receiver_picture);
        conversation.scrollTop(conversation[0].scrollHeight);
        // Reset UI
        $('#recorder-ui').hide();
        $('#send-btn, #cancel-btn').hide();
        $('#message-input, #mic-btn').show();
      } catch (err) {
        alert('Error sending voice message');
        console.error(err);
      }
    });
  };

  createRecorder();

  $('#mic-btn').on('click', function () {
    $(this).hide();
    $('#messageInput').addClass('hidden');
    $('#recorder-ui, #send-btn, #cancel-btn').show();
    record.startRecording();
  });

  $('#send-btn').on('click', function () {
    record.stopRecording();
    fetchEmployeeContacts();
    $('#messageInput').removeClass('hidden');
    $('#recorder-ui, #send-btn, #cancel-btn').hide();
    $('#message-input, #mic-btn').show();
  });

  $('#cancel-btn').on('click', function () {
    // record.stopRecording();
    $('#messageInput').removeClass('hidden');
    $('#recorder-ui, #send-btn, #cancel-btn').hide();
    $('#message-input, #mic-btn').show();
  });

  $('#messageForm').submit(function (e) {
    e.preventDefault();
    const buttons = sendMessageBtn.querySelectorAll('button');
    buttons[0].classList.add('hidden');
    buttons[3].classList.remove('hidden');
    const messageText = $('#messageInput').val().trim();
    $('#messageInput').val(''); // Clear input after sending
    const file = $('#fileInput')[0].files[0];
    $('#fileInput').val(''); // Clear file input after sending
    const messageId = 'msg-' + Date.now();
    if (!receiverId) return showMessage('error', 'Please select a contact to send a message');
    if (!messageText && !file) return showMessage('error', 'Please enter a message or select a file');

    const formData = new FormData();
    formData.append('receiver_id', receiverId);
    formData.append('sender_id', senderId); // Optional, depends on your JWT handling
    let msgType = 'text';

    if (file) {
      if (file.type.startsWith('image/')) msgType = 'picture';
      else if (file.type.startsWith('video/')) msgType = 'video';
      else if (file.type.startsWith('audio/')) msgType = 'audio';
      else if (file.type.startsWith('application/pdf')) msgType = 'pdf';
      else if (file.type === 'audio/webm') msgType = 'voice';
      else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') msgType = 'zip';
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') msgType = 'docx';
      else if (file.type === 'application/msword') msgType = 'doc';
      else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') msgType = 'xlsx';
      else if (file.type === 'application/vnd.ms-excel') msgType = 'xls';
      else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') msgType = 'pptx';
      else if (file.type === 'application/vnd.ms-powerpoint') msgType = 'ppt';
      else if (file.type === 'application/pdf') msgType = 'pdf';
      else if (file.type === 'text/plain') msgType = 'txt';
      else if (file.type === 'application/json') msgType = 'json';
      else if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') msgType = 'zip';
      else if (file.type === 'application/x-rar-compressed') msgType = 'rar';
      else if (file.type === 'application/octet-stream') msgType = 'binary';
      else if (file.type === 'application/x-7z-compressed') msgType = '7z';
      else if (file.type === 'application/x-tar') msgType = 'tar';
      else if (file.type === 'application/x-gzip') msgType = 'gzip';
      else if (file.type === 'application/x-bzip2') msgType = 'bzip2';
      else if (file.type === 'application/x-iso9660-image') msgType = 'iso';
      else if (file.type === 'application/x-msdownload') msgType = 'exe';
      else if (file.type === 'application/x-shockwave-flash') msgType = 'swf';
      else if (file.type === 'application/x-font-woff') msgType = 'woff';
      else if (file.type === 'application/x-font-woff2') msgType = 'woff2';
      else if (file.type === 'application/x-font-ttf') msgType = 'ttf';
      else if (file.type === 'application/x-font-opentype') msgType = 'otf';
      else return alert('Unsupported file type');
      formData.append('file', file);
    } else {
      formData.append('msg_content', messageText);
    }

    formData.append('msg_type', msgType);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const messageHTML = `
      <div class="before-message flex items-center justify-end mb-4 message-wrapper">
        <!-- Emoji action buttons -->
        <div class="action flex mr-2 w-14 h-full items-center justify-center hidden">
          <div class="dark:bg-black flex items-center justify-between w-full border border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-xl py-1 px-2">
            <i class="fas fa-smile emoji-button text-gray-500 cursor-pointer" title="Emoji"></i>
            <i class="fa-solid fa-angle-down text-gray-500"></i>
          </div>
        </div>

        <!-- Message bubble -->
        <div class="flex items-end">
          <div class="bg-blue-500 text-white px-3 py-1 rounded-lg max-w-3xs md:max-w-xs shadow-md relative" id="${messageId}">

            <!-- Waveform -->
            <div class="message-content" id="${messageId}-wave">
              ${msgType === 'text' ? `<p class="mb-2 text-base">${messageText}</p>` : ''}
              ${msgType === 'picture' ? `<img src="${URL.createObjectURL(file)}" class="w-48 mb-2 rounded" />` : ''}
              ${msgType === 'video' ? `<video src="${URL.createObjectURL(file)}" controls class="w-48 mb-2 rounded"></video>` : ''}
              ${msgType === 'audio' ? `<audio controls src="${URL.createObjectURL(file)}" class="mb-2 w-48"></audio>` : ''}
              ${msgType === 'voice' ? `<div class="waveform" id="${messageId}-wave"></div>` : ''}
            </div>

            <!-- Time and status -->
            <div class="flex justify-between gap-2 items-center mt-1">
              <span class="text-xs text-gray-300">${time}</span>
              <svg class="dark:border-gray-600 h-5 w-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>

            <!-- Emoji reaction placeholder -->
            <div class="selected-emoji hidden absolute top-14 w-6 h-6 flex overflow-y-hidden right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full"></div>
          </div>

          <img src="${sender_photo_preview}" alt="Contact" class="border translate-y-3 w-8 h-8 object-cover rounded-full ml-2 dark:border-gray-600">
         
        </div>
      </div>
      `

    conversation.append(messageHTML);
    // Scroll to latest message
    conversation.scrollTop(conversation[0].scrollHeight);

    

    axios
      .post('/send', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .then(() => {
        $('#messageInput').val('');
        $('#fileInput').val('');
        fetchEmployeeContacts();
        appendMessageBySelectedUser(senderId, receiverId, receiver_picture);
        conversation.scrollTop(conversation[0].scrollHeight);
      })
      .catch(console.error);
   });

  //  Remove file preview when document is clicked except when clicking on the preview itself or the send button
 
  const sendBtn = $('.send-message-btn')[0];
  const fileInput = $('#fileInput')[0];

  $(document).on('click', function(event) {
    if (!$(event.target).is(sendBtn)) {
      previewContainer.empty().addClass('hidden');
    }
  });
 
  

  $('#NewChat').on('click', function() {
      conversation.html('');
      receiverId = null;
      $('.contact-loader').removeClass('hidden');
      if (token !== null) {
      axios.get('/get_all_employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then(function(response) {
        let employees = response.data; // assuming response.data is already an array
        
      $('#contact-list').empty(); 
        $('.contact-loader').addClass('hidden');
        // console.log(employees)  
        employees.forEach(function(employee) {
          const onlineDot = employee.status === "online"
            ? '<div class="absolute bottom-0 right-4 w-3 h-3 rounded-full bg-green-400 p-1"></div>'
            : '<div class="absolute bottom-0 right-4 w-3 h-3 rounded-full bg-gray-300"></div>';
          const employeeItem = `
          <div class="contact-item bg-white flex items-center py-3 hover:bg-gray-100 focus:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 dark:focus:bg-gray-900 transition-colors duration-200 px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 cursor-pointer">
              <div class="relative">
                  <img src="${employee.photo_path}" alt="" data-name="${employee.fullName}" class="contact-image w-12 h-12 object-cover border-gray-500 border dark:border-gray-600 rounded-full mr-3">
                  ${onlineDot}
              </div>
              <div data-id="${employee.id}" data-pic="${employee.photo_path}" data-fullname="${employee.fullName}" class="show-message flex items-center justify-between flex-grow">
                  <div class="contact-info">
                      <h3 class="text-sm font-medium text-black dark:text-white">${employee.fullName}</h3>
                      <p class="text-gray-500 text-sm dark:text-gray-400 truncate typing-indicator-contact" data-id="${employee.id}" currentText="${employee.self_Description.substring(0, 30)}">${employee.self_Description.substring(0, 30)}...</p>
                  </div>
                  <div class="text-right flex flex-col items-end">
                      <p class="text-blue-400 dark:text-blue-300 text-sm"></p>
                      <div class="flex items-center">
                          ${employee.created_at ? `<p class="text-gray-500 text-xs dark:text-gray-400">${formatTime(employee.created_at)}</p>` : ''}
                      </div>
                  </div>
              </div>
          </div>`;

          $('#contact-list').append(employeeItem);
        })

        $('.show-message').off('click').on('click', function() {
          $('#contact').toggleClass('hidden');
          receiverId = $(this).data('id');
          markMessagesAsRead(localStorage.getItem('id'), receiverId)
          localStorage.setItem('receiver_id', $(this).data('id'));
          $('#selected_Employee_img').attr('src', `${$(this).data('pic')}`);
          receiver_picture = `${$(this).data('pic')}`;
          selected_employee_name.innerText = `${$(this).data('fullname')}`;
          $('.chat-room').toggleClass('hidden');
          conversation.html(''); // Clear the conversation
          conversation.append(`<svg class="conversation-loader hidden  absolute inset-0 m-auto h-5 w-5 text-blue-500 dark:bg-gray-900 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>`);
          $('.conversation-loader').removeClass('hidden');
          // Call your message loading function
          appendMessageBySelectedUser(senderId, localStorage.getItem('receiver_id'), receiver_picture);
          conversation.scrollTop(conversation[0].scrollHeight);
          
          let typingTimeout;

          messageInput.addEventListener('input', () => {
                fileInput.val(''); // Clear file input when typing
                const buttons = sendMessageBtn.querySelectorAll('button');
                if (messageInput.value.trim() !== '') {
                  
                  buttons[0].classList.remove('hidden');
                  buttons[1].classList.add('hidden');
                  buttons[2].classList.add('hidden');
                  buttons[3].classList.add('hidden');
                  // return;
                }else{
                  buttons[0].classList.add('hidden');
                  buttons[3].classList.remove('hidden');
                  // return;
                }
            // Notify server that user is typing
            socket.emit('typing', {
              senderId: senderId,
              receiverId: localStorage.getItem('receiver_id'),
              isTyping: true
            });
            // Clear previous timeout
            clearTimeout(typingTimeout);
            // Set timeout to indicate stop typing after 2 seconds
            typingTimeout = setTimeout(() => {
              socket.emit('typing', {
                senderId: senderId,
                receiverId: localStorage.getItem('receiver_id'),
                isTyping: false
              });
            }, 2000);
          });
        });
       
      }).catch(function(error) {
        console.error('Error fetching employees:', error);
      });
    
    }
  });

  function downloadBook(bookId) {
    axios.get(`/books/download_book/${bookId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      // console.log(response.data);
    })
    .catch(error => {
      console.error('Error downloading book:', error);
    });
  }

  // Fetch all books on page load for all Employees
  fetchAllBooks();

  function fetchAllBooks() {
    
    axios.get('/books/all_books')
    .then(response => {
      const books  = response.data;
      $('#books_loader').empty(); // Clear the existing list
      
      if (books && books.length > 0) {
        $.each(books, function(index, book) {
          const bookItem = `
            <div class="swiper-slide p-4">
              <div class="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out">
                <a class="block relative h-48 overflow-hidden">
                  <img alt="Book Cover" class="object-cover object-center w-full h-full" src="${book.book_cover_path}" />
                </a>
                <div class="p-4">
                  <h3 class="text-gray-500 text-xs tracking-widest mb-1 dark:text-gray-400">Title</h3>
                  <h2 class="text-gray-900 dark:text-gray-100 title-font text-lg font-medium mb-2">${book.title}</h2>
                  <p class="text-gray-700 text-sm mb-2 dark:text-gray-300">${book.description}</p>
                  <div class="font-semibold mb-3 text-gray-800 dark:text-gray-200 flex flex-col gap-3 items-start justify-between">
                    <label>Uploaded at:
                      <span class="text-gray-500 py-1 px-10 w-full text-center bg-gray-100 rounded">${book.added_at.split("T")[0]}</span>
                    </label>
                    <label>Status:
                      <span class="text-green-500 py-1 px-10 w-full text-center bg-green-100 rounded">Active</span>
                    </label>
                  </div>
                  <a href="${book.book_path}" download class="inline-block btn_download bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded" book_id="${book.id}">Download</a>
                </div>
              </div>
            </div>
          `;
          $('#books_loader').append(bookItem);
        });
      } else {
        const bookNotFound = `
          <h2 class="w-full flex items-center justify-center text-base text-indigo-500 bg-transparent">No Uploaded Book</h2>
        `;
        $('#books_loader').append(bookNotFound);
      }
      // send download request on click
      $('.btn_download').on('click', function() {
        const bookId = $(this).attr('book_id');
        downloadBook(bookId);
      });
    }).catch(error => {
      console.error('Error fetching books:', error);
    });
  }

  function showMessage(iconName, messageContent) {
    // Set icon src
      $('#messageIcon').attr('src', '../static/icons/' + iconName + '.png');

      // Set message content
      $('#messageContent').text(messageContent);

      // Animate into view
      $('#message').stop(true, true)
                  .hide().css('top', '-10%').show()
                  .animate({ top: '5%' }, 300);

      setTimeout(function() {
          $('#message').animate({ top: '-10%' }, 300);
      }, 5000);
  
  }

  socket.on('new_message', (msg) => {
    showMessage('success',msg.sender_id + ' says : ' + msg.msg_content);
  });



  function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  

  function downloadBook(bookId) {
    const token = localStorage.getItem('token');
    axios.get(`/books/download_book/${bookId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error('Error downloading book:', error);
    });
  }


  $('#registerForm').validate({
    rules: {
      fullName: {
        required: true,
        minlength: 2
      },
      typeEmployee: {
        required: true
      },
      registerPassword: {
        required: true,
        minlength: 6
      },
      about:{
        required:true,
        minlength:20
      },
      confirmPassword: {
        required: true,
        equalTo: '#registerPassword'
      },
      profilePhoto: {
        required: true,
        extension: "png|jpg|jpeg"
      }
    },
    messages: {
      fullName: {
        required: "Please enter your full name",
        minlength: "Name must be at least 2 characters"
      },
      typeEmployee: {
        required: "Please select employee type"
      },
      registerPassword: {
        required: "Please provide a password",
        minlength: "Password should be at least 6 characters"
      },
      about: {
        required: "Please provide a self description",
        minlength: "Description should be at least 20 characters"
      },
      confirmPassword: {
        required: "Please confirm your password",
        equalTo: "Passwords do not match"
      },
      profilePhoto: {
        required: "Please upload a profile photo",
        extension: "Only png, jpg, jpeg files are allowed"
      }
    },
    submitHandler: function(form) {
      // Show spinner
      var $submitBtn = $('#registerBtn');
      var $text = $submitBtn.find('.button-text');
      var $spinner = $submitBtn.find('svg');

      $text.addClass('hidden');
      $spinner.removeClass('hidden');

    

      const formData = new FormData(form);
      axios.post('register', formData)
        .then(function(response) {
          // Hide spinner
          $text.removeClass('hidden');
          $spinner.addClass('hidden');
          form.reset();
          // Your success handling
          hidePopup($('#registerPopup'));
          
        })
        .catch(function(error) {
          // Hide spinner
          $text.removeClass('hidden');
          $spinner.addClass('hidden');
          // Handle error
          console.log(error.response);
        });
    }
  });

  const section = $('#animated-section')
  // Animate the entire section to fade in (initial)
  section.removeClass('opacity-0');
  // Animate each content piece with delays
  const title = $('#title');
  const paragraph = $('#paragraph');
  const btns1 = $('#buttons1');
  const btns2 = $('#buttons2');
  const imageContainer = $('#imageContainer');
  // Trigger animations with delays
  setTimeout(() => {
    title.addClass('animate-fadeInUp', 'delay-1');
    paragraph.addClass('animate-fadeInUp', 'delay-2');
    btns1.addClass('animate-fadeInUp', 'delay-2');
    btns2.addClass('animate-fadeInUp', 'delay-3');
    imageContainer.addClass('animate-fadeInRight', 'delay-2');
  }, 100);


  $('#uploadForm').validate({
      rules: {
        title: {
          required: true,
          minlength: 3
        },
        description: {
          required: true,
          minlength: 5
        },
        book: {
          required: true,
          extension: "pdf|docx|txt|epub"
        },
        bookCover: {
          required: true,
          extension: "jpg|jpeg|png"

        }
      },
      messages: {
        title: {
          required: "Please enter a title.",
          minlength: "Title must be at least 3 characters."
        },
        description: {
          required: "Please enter a description.",
          minlength: "Description must be at least 5 characters."
        },
        book: {
          required: "Please select a book file.",
          extension: "Allowed extensions: pdf, docx, txt, epub."
        },
        bookCover: {
          required: "Please select a cover image.",
          extension: "Allowed extensions: jpg, jpeg, png."
        }
      },
      submitHandler: function(form) {
        
        const token = localStorage.getItem('token');
        var $submitBtn = $('#saveBookBtn');
        var $text = $submitBtn.find('.button-text');
        var $spinner = $submitBtn.find('svg');
        $text.addClass('hidden');
        $spinner.removeClass('hidden');
        const formData = new FormData(form);
        
      if (token !== null) {
          axios.post('/books/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(response => {
          form.reset();
          $text.removeClass('hidden');
          $spinner.addClass('hidden');
        })
        .catch(error => {
          console.error(error);
           $text.removeClass('hidden');
            $spinner.addClass('hidden');
        });
      }
    }
  })
 

  $('.preview #profilePhoto').on('change', function() {
    $('.uploader-zone').removeClass('w-full').addClass('w-3/4');
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        $('.preview #profilePhotoPreview').attr('src', e.target.result).removeClass('hidden');
      };
      reader.readAsDataURL(file);
    }
  })

  i18next.init({
    lng: 'en', // default language
    resources: {
          en: {
            translation: {
              home: "Home",
              books: "Books",
              team: "Team",
              login: "Login",
              register: "Register",
              upload: "Publish a book",
              title: "SCIS-GROUP LIBRARY",
              welcome: "Welcome on SCIS-GROUP online Library",
              description: "SCIS-GROUP LIBRARY is a platform that allows you to find the best books for your projects. You can chat with other users and share your books."
            }
          },
          fr: {
            translation: {
              home: "Accueil",
              books: "Livres",
              team: "Equipe",
              login: "Se connecter",
              register: "Inscription",
              upload: "Publier un livre",
              title: "BIBLIO-SCIS-GROUP",
              welcome: "Bienvenue sur SCIS-GROUP bibliotheque en ligne",
              description: "SCIS-GROUP LIBRARY est une plateforme qui vous permet de trouver les meilleurs livres pour vos projets. Vous pouvez discuter avec d'autres utilisateurs et partager vos livres."  
            }
          }
    }
    }, function(err, t) {
    updateContent();
  });

  function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      el.innerHTML = i18next.t(key);
    });
  }
 
  updateContent();

  // Utility function to format time like WhatsApp
  function formatTimeAgo(dateString) {
      const messageTime = new Date(dateString);
      const now = new Date();

      const diffMs = now - messageTime; // difference in milliseconds

      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (seconds < 10) {
          return 'Just now';
      } else if (seconds < 60) {
          return `${seconds} sec ago`;
      } else if (minutes < 60) {
          return `${minutes} min ago`;
      } else if (hours < 24) {
          return `${hours}h`;
      } else if (days === 1) {
          return 'Yesterday';
      } else if (days < 7) {
          return `${days} days ago`;
      } else if (weeks < 4) {
          return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else if (months < 12) {
          const options = { month: 'short', day: 'numeric' };
          return messageTime.toLocaleDateString(undefined, options);
      } else {
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          return messageTime.toLocaleDateString(undefined, options);
      }
  }

  function markMessagesAsRead(senderId, receiverId) {
      socket.emit('mark_read', {
          sender_id:receiverId ,
          receiver_id: senderId
      });
      
  }

  fetchEmployeeContacts();
  function fetchEmployeeContacts() {
       
      $('.contact-loader').removeClass('hidden'); // Show loader
      axios.get('/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(function(response) {
        const data = response.data;
        const contacts = data.contacts;
        $('.contact-list').html('');
        $('.contact-loader').addClass('hidden'); // Hide loader

        // Utility: Message status icons
        const statusIcons = {
            unread: '<i class="ri-check-double-fill text-gray-400"></i>',
            read: '<i class="ri-check-double-fill text-blue-500"></i>',
            received: '<i class="ri-check-line text-gray-400"></i></i>'
        };

        // Loop through contacts
        contacts.forEach(employee => {
          // Online status indicator
          const onlineDot = employee.employee_status === "online"
            ? '<div class="absolute bottom-0 right-4 w-3 h-3 rounded-full bg-green-400 p-1"></div>'
            : '<div class="absolute bottom-0 right-4 w-3 h-3 rounded-full bg-gray-300"></div>';

          // Unread badge
          const unreadBadge = (employee.unread_count && employee.unread_count > 0)
            ? `<div class="ml-2 bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">${employee.unread_count}</div>`
            : '';

          const allUnreadCount = (data.total_unread_count && data.total_unread_count > 0)
            ? `<div class=" bg-blue-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">${data.total_unread_count}</div>`
            : '';

          $('#notificationCount').html(allUnreadCount);

          // Last message time
          const timeDisplay = formatTimeAgo(employee.last_message_time);

          // Message status icon
          const msgStatusIcon = statusIcons[employee.msg_status] || '';

          // Show icon only if message is from current user
          const senderIndicator = (employee.sender_id == senderId) ? msgStatusIcon : '';

          // Determine message content preview based on message type
          const messagePreview = {
            text: () => `${senderIndicator} ${employee.last_message.substring(0, 30)}...`,
            picture: () => `${senderIndicator} <i class="fa-regular fa-image text-gray-400"></i>`,
            video: () => `${senderIndicator} <i class="fa-regular fa-video text-gray-400"></i>`,
            voice: () => `${senderIndicator} <i class="ri ri-mic-2-line  text-gray-400"></i>`,
            audio: () => `${senderIndicator} <i class="fa-regular fa-file-audio text-gray-400"></i>`
          };

          // Generate message content
          const msgTypeContent = messagePreview[employee.msg_type]
            ? messagePreview[employee.msg_type]()
            : `${senderIndicator} ${employee.last_message.substring(0, 30)}...`; // fallback

          // Build the contact item HTML
          const employeeItem = `
            <div class="contact-item bg-white flex items-center py-3 hover:bg-gray-100 focus:bg-gray-200 dark:bg-gray-900 dark:border-bottom-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-900 transition-colors duration-200 px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 cursor-pointer">
              <div class="relative">
                <img src="${employee.employee_photo}" alt="" data-name="${employee.fullName}" class="contact-image w-12 h-12 object-cover border-gray-500 border dark:border-gray-600 rounded-full mr-3" />
                ${onlineDot}
              </div>
              <div data-id="${employee.employee_id}" data-status="${employee.employee_status}" data-pic="${employee.employee_photo}" data-fullname="${employee.employee_name}" class="show-message flex items-center justify-between flex-grow">
                <div class="contact-info relative">
                  <h3 class="text-sm font-medium text-black dark:text-white">${employee.employee_name}</h3>
                  <p class="text-gray-500 text-sm dark:text-gray-400 truncate typing-indicator-contact"  data-id="${employee.employee_id}" >${msgTypeContent}</p>
                  <p class="absolute top-0 opacity-0 orginal_text">${msgTypeContent}</p>
                </div>
                <div class="text-right flex flex-col items-end">
                  <p class="text-blue-400 dark:text-blue-300 text-sm">${timeDisplay}</p>
                  <div class="unreadBadge flex items-center">${unreadBadge}</div>
                </div>
              </div>
            </div>
          `;

          $('#contact-list').append(employeeItem);
        });

        // Attach click handlers
        $('.show-message').off('click').on('click', function() {
          $('.contact').addClass('hidden');
          $('.chat-room').removeClass('hidden');
          receiverId = $(this).data('id');
          socket.emit('identify', { user_id: senderId });
          conversation.html(''); // Clear the conversation
          conversation.append(`<svg class="conversation-loader hidden  absolute inset-0 m-auto h-5 w-5 text-blue-500 dark:bg-gray-900 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>`);
          $('.conversation-loader').removeClass('hidden');
           
          markMessagesAsRead(senderId, localStorage.getItem('receiver_id'));

          $(this).find('.unreadBadge').hide();
          
          localStorage.setItem('receiver_id', $(this).data('id'));
          $('#selected_Employee_img').attr('src', `${$(this).data('pic')}`);
          receiver_picture = `${$(this).data('pic')}`;
          const status = $(this).data('status');
          console.log('status : ', status);
          $('#selected-contact-status').html(status);
          selected_employee_name.innerText = `${$(this).data('fullname')}`;

          // Call your message loading function
          appendMessageBySelectedUser(senderId, localStorage.getItem('receiver_id'), receiver_picture);
          conversation.scrollTop(conversation[0].scrollHeight);
       
          let typingTimeout;

          // messageInput.focus(function() {
          //   markMessagesAsRead(senderId, localStorage.getItem('receiver_id'));
          // });

          messageInput.addEventListener('input', () => {
            // Notify server that user is typing
             const buttons = sendMessageBtn.querySelectorAll('button');
               if (messageInput.value.trim() !== '') {
                  
                  buttons[0].classList.remove('hidden');
                  buttons[1].classList.add('hidden');
                  buttons[2].classList.add('hidden');
                  buttons[3].classList.add('hidden');
                  // return;
                }else{
                  buttons[0].classList.add('hidden');
                  buttons[3].classList.remove('hidden');
                  // return;
                }
            socket.emit('typing', {
              senderId: senderId,
              receiverId: localStorage.getItem('receiver_id'),
              isTyping: true
            });
            // Clear previous timeout
            clearTimeout(typingTimeout);
            // Set timeout to indicate stop typing after 2 seconds
            typingTimeout = setTimeout(() => {
              socket.emit('typing', {
                senderId: senderId,
                receiverId: localStorage.getItem('receiver_id'),
                isTyping: false
              });
            }, 2000);
          });
        });
      })
      .catch(function(error) {
        console.log('Error fetching contacts : ', error);
        if (error.response && error.response.status === 401) {
          alert('Unauthorized! Please log in again.');
        }
      });
  }

  //Listen for new incoming message for other 
  socket.on('new_message', (msg) => {
    
    showMessage('success',msg.sender_id + ' says : ' + msg.msg_content);
    fetchEmployeeContacts();
    if(localStorage.getItem('receiver_id') === null) return ;
    SendingMessageSound();
    appendMessageBySelectedUser(senderId, localStorage.getItem('receiver_id'),receiver_picture);
    conversation.scrollTop(conversation[0].scrollHeight);
  });

  // socket.on('messages_read', function(data) {
  //   console.log('Messages read:', data);
  //   // fetchEmployeeContacts();
  //   // appendMessageBySelectedUser(senderId, localStorage.getItem('receiver_id'),receiver_picture);
  // });

  // cancel selction of file
  $('#cancel-selection').on('click', function() {
    const buttons = sendMessageBtn.querySelectorAll('button');
    buttons[0].classList.add('hidden');
    buttons[1].classList.remove('hidden');
    // buttons[2].classList.remove('hidden');
    // buttons[3].classList.remove('hidden');
    $('#fileInput').val(''); // Clear the file input
    previewContainer.empty(); // Clear the preview container
  });

  
  // Preview file before sending
  $('#fileInput').on('change', function() {

    const buttons = sendMessageBtn.querySelectorAll('button');
                 
    buttons[0].classList.remove('hidden');
    buttons[1].classList.add('hidden');
    buttons[2].classList.add('hidden');
    buttons[3].classList.add('hidden');
                 

  
    // Get the selected files
    const files = this.files;
    previewContainer.removeClass('hidden');
    if (files.length === 0) {
      buttons[0].classList.add('hidden');
      buttons[3].classList.remove('hidden');
      return; // No files selected
    }

    // Clear any existing previews
    previewContainer.empty();

  // Loop through each file and create a preview
    $.each(files, function(index, file) {
      // Create a new preview item
      const previewItem = $('<div class="w-full md:w-1/2 xl:w-1/3 p-2 rounded"></div>');

      // Create a new preview image
      const previewImage = $('<img class="w-full h-full object-cover rounded">');

      // Add the preview image to the preview item
      previewItem.append(previewImage);

      // Add the preview item to the preview container
      previewContainer.append(previewItem);

      // Read the file and display it as a preview
      const reader = new FileReader();
      reader.onload = function(event) {
        previewImage.attr('src', event.target.result);
      };
      reader.readAsDataURL(file);
    });
  });

})
