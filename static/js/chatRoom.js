jQuery(function() {

    // Enable resizing only from the right side
    jQuery("#contact").resizable({
        handles: 'e' // 'e' stands for east (right side)
    });


    // Fetch contacts from JSON
    // jQuery.getJSON("../static/assets/contacts.json", function(data) {
    //     // Get the current date and time
    //     const now = new Date();
 
    //     // Sort contacts by time (most recent first)
    //     data.sort(function(a, b) {
    //         const aTimeDiff = Math.abs(now - new Date(a.time));
    //         const bTimeDiff = Math.abs(now - new Date(b.time));
    //         return aTimeDiff - bTimeDiff; // Ascending order of time difference to now
    //     });
    
    //     displayContacts(data);
    // });

  // Function to display contacts
    
    jQuery('#back').on('click', function() {
        jQuery('#contact').toggleClass('hidden');
        jQuery('.chat-room').toggleClass('hidden')
    });

    // Search/filter functionality
    jQuery('#search').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        jQuery('.contact-item').each(function() {
            const contactName = $(this).find('h3').text().toLowerCase();
            jQuery(this).toggle(contactName.indexOf(searchTerm) > -1);
        });
    });
    // Click event to open chat window
    jQuery('.show-search').on('click', function() {
        // jQuery('#contact').toggleClass('hidden');
        jQuery('.search').css({
            'top': '0%'
        })
    });

    jQuery(document).on('click', function(event) {
        if (!jQuery(event.target).closest('.search').length && 
        !jQuery(event.target).closest('.show-search').length) {
            jQuery('.search').css({
                'top': '-10%'
            });
        }
    });


    setTimeout(function() {
        var currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        $('#current-time').text(currentTime);
        jQuery('#loading').toggleClass('hidden');
    }, 2000); // Update every second


    jQuery('.toggle-user-profile').on('click', function() {
        jQuery('.user-profile').addClass('show');
    });

    jQuery(document).click(function (event) {
        if (!$(event.target).closest('.toggle-user-profile,.emoji-span,.tabBtn, .more-emoji,.profile-outgoing,.message-wrapper .action, .basic-info,.show-incoming-info, .modal-content, .btn-forward, .contact-image, .incoming-info').length) {
            jQuery('.user-profile').removeClass('show');
            jQuery('.user-profile-bg').addClass('hidden');
            jQuery('.forwardingModal').addClass('hidden');
            jQuery('.emojiPicker').addClass('hidden');
            jQuery('.forwordTo').find('input[type=checkbox]').prop('checked', false); // Uncheck all checkboxes
            jQuery('.incoming-profile').removeClass('show');
            $("#contextMenu").addClass("hidden");
        }
    });

    jQuery('.tab-button').click(function() {
        // Remove active styles from all buttons
        jQuery('.tab-button').removeClass('text-blue-600 border-blue-600').addClass('text-gray-600 dark:text-gray-300');
        jQuery('.tab-button').removeClass('border-b-2');
        jQuery(this).addClass('border-b-2 border-blue-600');
        
        // Add active styles to the clicked button
        jQuery(this).removeClass('text-gray-600 dark:text-gray-300').addClass('text-blue-600 border-blue-600');

        // Get the tab name from the data attribute and update the content
        const tab = jQuery(this).data('tab');
        let content = '';

        switch (tab) {
            case 'media':
                content = `
                    <h1 class="text-lg font-semibold">Media Content</h1>
                    <div class="mt-4 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        ${Array.from({ length: 20 }, (_, i) => `
                            <div class="border bg-gray-200 h-28  w-28  overflow-hidden">
                                <img src="myImage.jpg" alt="Media ${i + 1}" class="w-full h-full object-cover">
                                <div class="p-2">Media ${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
            case 'voice':
                content = `
                    <h1 class="text-lg font-semibold">Voice Messages</h1>
                    <div class="space-y-4 mt-4">
                        ${Array.from({ length: 10 }, (_, i) => `
                            <div class="flex items-center bg-blue-100 p-4 rounded-lg shadow-md">
                                <div class="flex-shrink-0">
                                    <button class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-300 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-1.414 1.414 2.121 2.121a1.5 1.5 0 001.414.293A1.5 1.5 0 0019 13.5V6a1.5 1.5 0 00-2.328-1.309l-2.121 2.121-1.414-1.414A1.5 1.5 0 0011 6.502V13.5a1.5 1.5 0 001.672 1.493 1.5 1.5 0 00.08-.007z" />
                                        </svg>
                                    </button>
                                </div>
                                <div class="ml-4">
                                    <div class="text-gray-800 font-semibold">Voice Message ${i + 1}</div>
                                    <div class="text-gray-500 text-sm">Duration: 00:30</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>`;
                break;
            case 'gifs':
                content = `
                    <h1 class="text-lg font-semibold">Gifs Content</h1>
                    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        ${Array.from({ length: 10 }, (_, i) => `
                            <div class="border bg-gray-200 w-28 h-28  rounded-lg overflow-hidden">
                                <img src="myImage.jpg" alt="Gif ${i + 1}" class="w-full h-full object-cover">
                                <div class="p-2">Gif ${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
            case 'sticker':
                content = `
                    <h1 class="text-lg font-semibold">Sticker Content</h1>
                    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        ${Array.from({ length: 10 }, (_, i) => `
                            <div class="border bg-gray-200 w-28 h-28 rounded-lg overflow-hidden">
                                <img src="myImage.jpg" alt="Sticker ${i + 1}" class="w-full h-full object-cover">
                                <div class="p-2">Sticker ${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                break;
        }

        // Update the tab content
        jQuery('.tab-content').html(content);
    });

    // Dark mode toggle
    jQuery('#toggle-dark-mode').click(function() {
        jQuery('body').toggleClass('bg-gray-900');
        jQuery('.bg-white').toggleClass('bg-gray-800');
        jQuery('.text-gray-600').toggleClass('text-gray-300');
        jQuery('.tab-button').toggleClass('dark:text-gray-300');
    });


    jQuery('.show-incoming-info').on('click', function() {
        jQuery('.incoming-profile').addClass('show');
        jQuery('.user-profile-bg').addClass('hidden');
    });

    jQuery('#remove-incoming-profile').on('click', function() {
        jQuery('.incoming-profile').removeClass('show');
    });

     // Function to show the call interface
    jQuery('.start-voice-call-btn').click(function() {
        jQuery('.voice-call-interface').removeClass('hidden');
        jQuery('.user-profile-bg').addClass('hidden');
        jQuery('body').css('overflow', 'hidden'); // Prevent background scrolling
    });
     // Function to show the call interface
    jQuery('.start-video-call-btn').click(function() {
        jQuery('.video-call-interface').removeClass('hidden');
        jQuery('.user-profile-bg').addClass('hidden');
        jQuery('body').css('overflow', 'hidden'); // Prevent background scrolling
    });
    
   
    jQuery( ".draggable" ).draggable();

    // Function to end the call and hide the interface
    jQuery('.end-call').click(function() {
        jQuery('.video-call-interface').addClass('hidden');
        jQuery('.voice-call-interface').addClass('hidden');
        jQuery('body').css('overflow', ''); // Re-enable background scrolling
    });


     // Optional: Mute/Unmute functionality
    jQuery('.mute-call').click(function () {
        $(this).toggleClass('bg-gray-600');
        // You can add actual mute functionality here
        if ($(this).hasClass('bg-gray-600')) {
            // Mute logic
            $(this).html('<i class="fas fa-microphone-slash"></i>');
        } else {
            // Unmute logic
            $(this).html('<i class="fas fa-microphone"></i>');
        }
    });

    jQuery('#mute-camera').click(function () {
        $(this).toggleClass('bg-gray-600');
        // You can add actual mute functionality here
        if ($(this).hasClass('bg-gray-600')) {
            // Mute logic
            $(this).html('<i class="fas fa-video-slash"></i>');
        } else {
            // Unmute logic
            $(this).html('<i class="fas fa-video"></i>');
        }
    });

    jQuery('.video-resize').resizable({
        handles: 'n, e, s, w, ne, se, sw, nw' // Allow resizing from all corners and sides
    });
    jQuery('.voice-resize').resizable({
        handles: 'n, e, s, w, ne, se, sw, nw' // Allow resizing from all corners and sides
    });

    let currentIndex = 0;
    const totalSlides = $('.slide').length;

    let slideInterval =5000; // Change slide every 5 seconds

    function showSlide(index) {
        $('.slide').each(function(i) {
            if (i === index) {
                $(this).css('transform', 'translateX(0)'); // Slide in
            } else if (i < index) {
                $(this).css('transform', 'translateX(-100%)'); // Slide out to the left
            } else {
                $(this).css('transform', 'translateX(100%)'); // Slide out to the right
            }
        });

        // Update thumbnail styles
        $('.thumb').removeClass('bg-blue-500 text-white').addClass('bg-gray-300 text-black');
        $('.thumb').eq(index).removeClass('bg-gray-300 text-black').addClass('bg-blue-500 text-white');
    }


    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides; // Cycle to the next slide
        showSlide(currentIndex);
        slideInterval = 5000; // Reset interval to 5 seconds after manual change
    }

    jQuery('#next').click(nextSlide); // Click handler for next button
    jQuery('#prev').click(function() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; // Cycle to the previous slide
        showSlide(currentIndex);
    });

    jQuery('.thumb').click(function() {
        currentIndex = $(this).index(); // Set current index based on clicked thumbnail
        showSlide(currentIndex);
    });

    // Set interval for automatic slide transition
    setInterval(nextSlide, slideInterval); // Change slide every 5 seconds

    // Initial call to display the first card
    showSlide(currentIndex);


    // Delete functionality
    jQuery('.fas.fa-trash-alt').on('click', function() {
        if (confirm('Are you sure you want to delete this message?')) {
            // Logic to delete the message
            $(this).closest('.message-wrapper').remove();
        }
    });

    jQuery('.context-menu div').on('click', function() {
        jQuery("#contextMenu").addClass("hidden");  
    });

    // Edit functionality
    jQuery('.fas.fa-edit').on('click', function() {
        // Logic for editing the message (for simplicity, just an alert here)
        alert('Edit functionality should be implemented here.');
    });

    // Share functionality
    jQuery('.fas.fa-share').on('click', function() {
        // Logic for forwarding the message (for simplicity, just an alert here)
        alert('Forward functionality should be implemented here.');
    });

    // Pin functionality
    jQuery('.fas.fa-thumbtack').on('click', function() {
        // Logic for pinning the message (for simplicity, just an alert here)
        alert('Pin functionality should be implemented here.');
    });


    jQuery(".message-wrapper .action").on("click", function(e){
        e.preventDefault();
        var offset = $(this).offset();
        jQuery("#contextMenu").addClass("hidden");
        jQuery("#contextMenu")
          .css({ top: offset.top + 50, left:  offset.left  -100})
          .removeClass("hidden");
          
        console.log("Top: " + offset.top + ", Left: " + offset.left);

        // 2. Get position relative to the page coordinates (where you clicked)
        console.log("Click X: " + e.pageX + ", Click Y: " + e.pageY);

        // 3. If you want position inside the element
        console.log("Inside element X: " + e.offsetX + ", Y: " + e.offsetY);
    });

    const html = $('html');
    
    // Function to set the theme based on localStorage
    function setTheme() {
        const currentTheme = localStorage.getItem('hs_theme');

        const isLight = currentTheme === 'light' || (currentTheme === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
        const isDark = currentTheme === 'dark' || (currentTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isLight) {
            html.removeClass('dark').addClass('light');
            // Update button visibility
           
        } else if (isDark) {
            html.removeClass('light').addClass('dark');
         
        } else {
            // Default fall-back to light mode if no theme is set or recognized
            html.removeClass('dark').addClass('light');
           
        }
    }

    // Set the initial theme on page load
    setTheme();

    // Listen for changes in the system's color scheme
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(event) {
        setTheme();
    });

    // Dark mode button click event
    jQuery('.btn-dark').click(function() {
        html.removeClass('light').addClass('dark');
        console.log('dark mode active');
        jQuery('.btn-light').toggleClass('hidden');
        jQuery('.btn-dark').addClass('hidden');
        localStorage.setItem('hs_theme', 'dark');
        setTheme(); // Update the button visibility
    });

    // Light mode button click event
    jQuery('.btn-light').click(function() {
        console.log('light mode active');
        jQuery('.btn-dark').toggleClass('hidden');
        jQuery('.btn-light').toggleClass('hidden');
        html.removeClass('dark').addClass('light');
        localStorage.setItem('hs_theme', 'light');
        setTheme(); // Update the button visibility
    });

    // jQuery.getJSON("/assets/contacts.json", function(data) {
    //     contacts = data; // Store the fetched contacts
    //     loadContacts(); // Load contacts into the modal when data is retrieved
    // });

    // Function to show modal
    jQuery('.btn-forward').click(function () {
        jQuery('.forwardingModal').removeClass('hidden');
    });

   

    // Load contacts into the modal
    function loadContacts(filteredContacts = contacts) {
        let contactsHTML = '';
        filteredContacts.forEach(contact => {
            contactsHTML += `
                <div class="forwordTo flex items-center justify-between py-1 px-3  hover:bg-gray-200 cursor-pointer dark:hover:bg-gray-600 rounded-lg mb-2">
                    <div class="flex items-center">
                        <img src="${contact.image}" alt="Profile Picture" class="w-10 h-10 rounded-full mr-2">
                        <div>
                            <p class="font-medium text-gray-600 dark:text-gray-300">${contact.name}</p>
                            <p class="text-sm text-gray-400">${contact.message}</p>
                        </div>
                    </div>
                    <input type="checkbox" class="ml-2 cursor-pointer" value="${contact.name}" />
                </div>
            `;
        });
        $('#contactsList').html(contactsHTML);

        // Add click event to each contact item
        $('.forwordTo').click(function () {
            $(this).find('input[type=checkbox]').prop('checked', true);
        });
    }

    // Search functionality
    jQuery('#searchContacts').on('input', function () {
        const searchValue = $(this).val().toLowerCase();
        const filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(searchValue));
        loadContacts(filteredContacts);
    });

    // Handle sending messages
    jQuery('#sendButton').click(function () {
        const selectedContacts = $('input[type=checkbox]:checked').map(function () {
            return $(this).val();
        }).get();

        if (selectedContacts.length > 0) {
            alert('Message sent to: ' + selectedContacts.join(', '));
        } else {
        }
        jQuery('.forwardingModal').addClass('hidden'); // Hide the modal after sending
        jQuery('.forwordTo').find('input[type=checkbox]').prop('checked', false); // Uncheck all checkboxes
    });


    // Emojis actions
    const emojiCategories = {
        smileysPeople: [
            "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍",
            "🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎",
            "🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫",
            "😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨",
            "😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯",
            "😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧",
            "😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","💩","👻","💀","☠️",
            "👽","👾","🤖","🤠","😺","😸","😻","😼","😽","🙀","😿","😾"
        ],
        animalsNature: [
            "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷",
            "🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅",
            "🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🪰","🪱","🦟",
            "🦗","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡",
            "🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛",
            "🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐",
            "🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜",
            "🦢","🕊️","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐀","🐿️","🦔","🐉","🐲"
        ],
        activity: [
            "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑",
            "🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛷",
            "⛸️","🥌","🏋️‍♂️","🤼‍♂️","🤸‍♂️","⛹️‍♂️","🤽‍♂️","🚴‍♂️","🚴‍♀️","🤹‍♂️","🤹‍♀️","🧗‍♂️","🧗‍♀️"
        ],
        travelPlaces: [
            "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜",
            "🦯","🦽","🦼","🛴","🚲","🛵","🏍️","🛺","🚨","🚔","🚍","🚘","🚖","🚡",
            "🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉",
            "✈️","🛫","🛬","🛩️","💺","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️",
            "🛳️","⛴️","🚢","🏞️","🗺️","🌍","🌎","🌏","🗺️"
        ],
        objects: [
            "💡","🔦","🕯️","🪔","🛢️","💸","💵","💴","💶","💷","🪙","💰","🪪","💳",
            "🧾","💼","🧳","📦","📫","📮","🗳️","✉️","📩","📨","📧","💌","📥","📤",
            "📦","📜","📃","📑","📊","📈","📉","📝","✏️","🖊️","🖋️","✒️","🖌️",
            "🖍️","🗂️","📌","📍","📏","📐","🔍","🔎","⌛","⏳","⌚",
        ],
        symbols: [
            "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓",
            "💗","💖","💘","💝","🔟","🔢","🔠","🔡","🔤","🅰️","🆎","🅱️","🆑","🆒",
            "🆓","ℹ️","🆔","Ⓜ️","🆕","🆖","🅾️","🆗","🆘","🆙","🆚","🈁","🈯",
            "🈳","🈵","🈶","🈚","🈸","🈺","🈷️","㊗️","㊙️","⚠️","❗","❕","❓",
            "❔","🔔","🔕","🔖"
        ],
        flags: [
            "🏳️",  // Drapeau blanc
            "🏴",  // Drapeau noir
            "🏁",  // Drapeau à damiers
            "🚩",  // Drapeau rouge
            "🏳️‍🌈",  // Drapeau arc-en-ciel
            "🏳️‍⚧️",  // Drapeau transgenre
            "🇦🇫",  // Afghanistan
            "🇦🇽",  // Åland
            "🇦🇱",  // Albanie
            "🇩🇿",  // Algérie
            "🇦🇸",  // Samoa américaine
            "🇦🇩",  // Andorre
            "🇦🇴",  // Angola
            "🇦🇮",  // Anguilla
            "🇦🇶",  // Antigua-et-Barbuda
            "🇦🇬",  // Argentine
            "🇦🇷",  // Arménie
            "🇦🇼",  // Aruba
            "🇦🇺",  // Australie
            "🇦🇹",  // Autriche
            "🇦🇿",  // Azerbaïdjan
            "🇧🇸",  // Bahamas
            "🇧🇭",  // Bahreïn
            "🇧🇩",  // Bangladesh
            "🇧🇧",  // Barbados
            "🇧🇾",  // Bélarus
            "🇧🇪",  // Belgique
            "🇧🇿",  // Belize
            "🇧🇯",  // Bénin
            "🇧🇲",  // Bermudes
            "🇧🇹",  // Bhoutan
            "🇧🇦",  // Bosnie-Herzégovine
            "🇧🇼",  // Botswana
            "🇧🇻",  // Bouvet (île)
            "🇧🇷",  // Brésil
            "🇻🇨",  // Saint-Vincent-et-les-Grenadines
            "🇻🇺",  // Vanuatu
            "🇧🇬",  // Bulgarie
            "🇧🇭",  // Bahreïn
            "🇧🇹",  // Bhoutan
            "🇧🇷",  // Brésil
            "🇻🇰",  // Vatican
            "🇭🇷",  // Croatie
            "🇨🇺",  // Cuba
            "🇨🇦",  // Canada
            "🇨🇾",  // Chypre
            "🇨🇿",  // République tchèque
            "🇩🇰",  // Danemark
            "🇩🇯",  // Djibouti
            "🇩🇲",  // Dominique
            "🇪🇨",  // Équateur
            "🇪🇬",  // Égypte
            "🇸🇻",  // Salvador
            "🇬🇶",  // Guinée équatoriale
            "🇪🇷",  // Érythrée
            "🇪🇪",  // Estonie
            "🇸🇸",  // État de la Palestine
            "🇪🇹",  // Éthiopie
            "🇬🇷",  // Grèce
            "🇬🇩",  // Grenade
            "🇬🇪",  // Géorgie
            "🇬🇹",  // Guatemala
            "🇬🇳",  // Guinée
            "🇬🇼",  // Guinée-Bissau
            "🇬🇸",  // Géorgie du Sud et îles Sandwich du Sud
            "🇭🇺",  // Hongrie
            "🇮🇸",  // Islande
            "🇮🇩",  // Indonésie
            "🇮🇷",  // Iran
            "🇮🇶",  // Irak
            "🇮🇹",  // Italie
            "🇯🇲",  // Jamaïque
            "🇯🇵",  // Japon
            "🇯🇱",  // Jéru
            "🇯🇦",  // Jérusalem
            "🇰🇷",  // Corée du Sud
            "🇰🇵",  // Corée du Nord
            "🇰🇭",  // Cambodge
            "🇰🇷",  // Corée du Sud
            "🇰🇭",  // Cambodge
            "🇰🇮",  // Kiribati
            "🇰🇵",  // Corée du Nord
            "🇰🇼",  // Koweït
            "🇰🇾",  // Îles Caïmans
            "🇱🇧",  // Liban
            "🇱🇨",  // Sainte-Lucie
            "🇱🇪",  // Libéria
            "🇱🇷",  // Libye
            "🇱🇺",  // Luxembourg
            "🇲🇹",  // Malte
            "🇲🇦",  // Maroc
            "🇲🇽",  // Mexique
            "🇲🇩",  // Moldavie
            "🇲🇹",  // Malte
            "🇲🇦",  // Maroc
            "🇲🇻",  // Maldivesk
            "🇲🇼",  // Malawi
            "🇲🇾",  // Malaisie
            "🇲🇷",  // Mauritanie
            "🇲🇺",  // Maurice
            "🇲🇿",  // Mozambique
            "🇳🇦",  // Namibie
            "🇳🇷",  // Nauru
            "🇳🇵",  // Népal
            "🇳🇱",  // Pays-Bas
            "🇳🇿",  // Nouvelle-Zélande
            "🇳🇬",  // Nigéria
            "🇳🇮",  // Nicaragua
            "🇳🇺",  // Niue
            "🇰🇳",  // Saint-Kitts-et-Nevis
            "🇱🇨",  // Sainte-Lucie
            "🇲🇹",  // Malte
            "🇱🇨",  // Sainte-Lucie
            "🇳🇵",  // Népal
            "🇱🇰",  // Sri Lanka
            "🇷🇴",  // Roumanie
            "🇷🇺",  // Russie
            "🇷🇼",  // Rwanda
            "🇸🇦",  // Arabie saoudite
            "🇸🇬",  // Singapour
            "🇸🇰",  // Slovaquie
            "🇸🇮",  // Slovénie
            "🇸🇩",  // Soudan
            "🇸🇿",  // Eswatini
            "🇹🇼",  // Taïwan
            "🇹🇯",  // Tadjikistan
            "🇹🇿",  // Tanzanie
            "🇹🇬",  // Togo
            "🇹🇴",  // Tonga
            "🇹🇹",  // Trinité-et-Tobago
            "🇹🇳",  // Tunisie
            "🇹🇷",  // Turquie
            "🇺🇬",  // Ouganda
            "🇺🇦",  // Ukraine
            "🇺🇸",  // États-Unis
            "🇺🇾",  // Uruguay
            "🇺🇿",  // Ouzbékistan
            "🇻🇺",  // Vanuatu
            "🇻🇦",  // Vatican
            "🇻🇪",  // Venezuela
            "🇨🇫",  //Central African Republic
            "🇻🇳",  // Vietnam
            "🇼🇫",  // Wallis et Futuna
            "🇿🇦",  // Afrique du Sud
            "🇿🇲",  // Zambie
            "🇿🇼",  // Zimbabwe
        ]
    };
    
      // Load emojis into respective categories
      $.each(emojiCategories, function(category, emojis) {
        emojis.forEach(emoji => {
          $(`#${category}`).append(`<span class="cursor-pointer emoji-span flex items-center justify-center hover:bg-gray-600 rounded ">${emoji}</span>`);
        });
      });
    
      // Tab switching
      $('.tabBtn').click(function() {
        const tab = $(this).data('tab');
        $('#emojiContainer > div').hide();
        $(`#${tab}`).css('display', 'grid');
      });
    
      // Search emojis
      $('#emojiSearch').on('input', function() {
        const search = $(this).val();
        $('#emojiContainer > div').hide();
        $('#smileysPeople').show().html(''); // Showing smileysPeople during search
        
        // Search all emojis and show matching
        $.each(emojiCategories, function(category, emojis) {
          emojis.forEach(emoji => {
            if (emoji.includes(search)) {
              $('#smileysPeople').append(`<span class="cursor-pointer hover:bg-gray-600 rounded flex items-center justify-center p-1"">${emoji}</span>`);
            }
          });
        });
      });
    
      // Load Recent
      function loadRecent() {
        let recent = JSON.parse(localStorage.getItem('recentEmojis')) || [];
        $('#recentEmojis').html('');
        recent.forEach(emoji => {
          $('#recentEmojis').append(`<span class="cursor-pointer hover:bg-gray-600 rounded p-1">${emoji}</span>`);
        });
      }
    
      // Click to add recent
      $(document).on('click', '#emojiContainer span', function() {
        const emoji = $(this).text();
        let recent = JSON.parse(localStorage.getItem('recentEmojis')) || [];
        recent = recent.filter(e => e !== emoji);
        recent.unshift(emoji);
        if (recent.length > 24) recent = recent.slice(0, 24);
        localStorage.setItem('recentEmojis', JSON.stringify(recent));
        loadRecent();
      });
    
      // Default tab
      loadRecent();
      $('#emojiContainer > div').hide();
      $('#smileysPeople').show();

  
    jQuery('.more-emoji').on('click', function() {
        jQuery('.context-menu').toggleClass('hidden');
        jQuery('.emojiPicker').toggleClass('hidden');
    });

});



