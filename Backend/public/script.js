//footer
const footer = document.querySelector('footer');
const year = new Date().getFullYear();
footer.innerHTML = `<p>&copy; ${year} - ${year + 1}, All rights reserved.</p><p>Developed by <a href="https://www.linkedin.com/in/dhruv-suvarna-18a010253/">Dhruv Suvarna</a></p>`;

// navbar menu toggle responsive
function toggleMenu() {
    var menu = document.querySelector('.navbar-menu2');
    const hamIcon = document.querySelector('#ham-icon');
    if (hamIcon.innerHTML.includes('<img id="ham-svg" src="/images/menu-svgrepo-com.svg" width="45">')) {
        hamIcon.innerHTML = '<i class="fa-solid fa-x fa-2x"></i>';
        document.querySelector('.nav-space').style.height = '71px';
    } else if (hamIcon.innerHTML.includes('<i class="fa-solid fa-x fa-2x"></i>')){
        hamIcon.innerHTML = '<img id="ham-svg" src="/images/menu-svgrepo-com.svg" width="45">';
        document.querySelector('.nav-space').style.height = '90px';
    }
    menu.classList.toggle('responsive');
}

//isAuthenticated
fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated === "true") {
            document.querySelectorAll('.signup-le').forEach(Element=>Element.classList.add("invisible"));
            document.querySelectorAll('.login-le').forEach(Element=>Element.classList.add("invisible"));
            document.querySelectorAll('.logout-le').forEach(Element=>Element.classList.remove("invisible"));
            let username = data.username;
            document.querySelectorAll('.avatar').forEach(Element=> Element.innerHTML = username[0].toUpperCase());
            document.querySelectorAll('#profile').forEach(Element => {Element.setAttribute('href', `/profile/${username}`);});
            
        } else {
            document.querySelectorAll('logout-le').forEach(Element=>Element.classList.add("invisible"));
            document.querySelectorAll('.signup-le').forEach(Element=>Element.classList.remove("invisible"));
            document.querySelectorAll('.login-le').forEach(Element=>Element.classList.remove("invisible"));
        }
    })
    .catch(err => console.log(err));


// Retrieving Light and Dark mode colors
const rootStyles = getComputedStyle(document.documentElement);

const light_nav_text = rootStyles.getPropertyValue('--light_nav_text');
const dark_nav_text = rootStyles.getPropertyValue('--dark_nav_text');
const light_text = rootStyles.getPropertyValue('--light_text');
const dark_text = rootStyles.getPropertyValue('--dark_text');
const light_text2 = rootStyles.getPropertyValue('--light_text2');
const dark_text2 = rootStyles.getPropertyValue('--dark_text2');
const light_btn = rootStyles.getPropertyValue('--light_btn');
const dark_btn = rootStyles.getPropertyValue('--dark_btn');
const light_nav = rootStyles.getPropertyValue('--light_nav');
const dark_nav = rootStyles.getPropertyValue('--dark_nav');
const light_bg = rootStyles.getPropertyValue('--light_bg');
const dark_bg = rootStyles.getPropertyValue('--dark_bg');
const light_card = rootStyles.getPropertyValue('--light_card');
const dark_card = rootStyles.getPropertyValue('--dark_card');
const light_nav_hover = rootStyles.getPropertyValue('--light_nav_hover');
const dark_nav_hover = rootStyles.getPropertyValue('--dark_nav_hover');
const light_svg = rootStyles.getPropertyValue('--light_svg');
const dark_svg = rootStyles.getPropertyValue('--dark_svg');
const light_preview_bg = rootStyles.getPropertyValue('--light_preview_bg')
const dark_preview_bg = rootStyles.getPropertyValue('--dark_preview_bg')

//dark and light mode toggle handler
var toggleIcons = document.querySelectorAll('.fa-circle-half-stroke')
// let darkModeOn = false;

function switchTheme() {
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        if (data.mode !== "light") {
            toggleIcons.forEach(
                (icon) => {
                    icon.style.color = light_nav_text;
                }
            )
            document.documentElement.style.setProperty('--nav_text', light_nav_text);
            document.documentElement.style.setProperty('--text', light_text);
            document.documentElement.style.setProperty('--text2', light_text2);
            document.documentElement.style.setProperty('--btn', light_btn);
            document.documentElement.style.setProperty('--nav', light_nav);
            document.documentElement.style.setProperty('--bg', light_bg);
            document.documentElement.style.setProperty('--card', light_card);
            document.documentElement.style.setProperty('--nav_hover', light_nav_hover);
            document.documentElement.style.setProperty('--svg', light_svg)
            document.documentElement.style.setProperty('--preview_bg', light_preview_bg)
            data.mode = "light";
            return fetch('http://localhost:8000/states', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            });
        } else {
            toggleIcons.forEach(
                (icon) => {
                    icon.style.color = dark_nav_text;
                }
            )
            document.documentElement.style.setProperty('--nav_text', dark_nav_text);
            document.documentElement.style.setProperty('--text', dark_text);
            document.documentElement.style.setProperty('--text2', dark_text2);
            document.documentElement.style.setProperty('--btn', dark_btn);
            document.documentElement.style.setProperty('--nav', dark_nav);
            document.documentElement.style.setProperty('--bg', dark_bg);
            document.documentElement.style.setProperty('--card', dark_card);
            document.documentElement.style.setProperty('--nav_hover', dark_nav_hover);
            document.documentElement.style.setProperty('--svg', dark_svg)
            document.documentElement.style.setProperty('--preview_bg', dark_preview_bg)
            data.mode = "dark";
            return fetch('http://localhost:8000/states', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            });
        }
    })
}

// URL based navbar highlighting, page unload and other handlers
window.addEventListener('DOMContentLoaded', function(event) {
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        if (data.mode === "light") {
            toggleIcons.forEach(
                (icon) => {
                    icon.style.color = light_nav_text;
                }
            )
            document.documentElement.style.setProperty('--nav_text', light_nav_text);
            document.documentElement.style.setProperty('--text', light_text);
            document.documentElement.style.setProperty('--text2', light_text2);
            document.documentElement.style.setProperty('--btn', light_btn);
            document.documentElement.style.setProperty('--nav', light_nav);
            document.documentElement.style.setProperty('--bg', light_bg);
            document.documentElement.style.setProperty('--card', light_card);
            document.documentElement.style.setProperty('--nav_hover', light_nav_hover);
            document.documentElement.style.setProperty('--svg', light_svg)
            document.documentElement.style.setProperty('--preview_bg', light_preview_bg)
        } else {
            toggleIcons.forEach(
                (icon) => {
                    icon.style.color = dark_nav_text;
                }
            )
            document.documentElement.style.setProperty('--nav_text', dark_nav_text);
            document.documentElement.style.setProperty('--text', dark_text);
            document.documentElement.style.setProperty('--text2', dark_text2);
            document.documentElement.style.setProperty('--btn', dark_btn);
            document.documentElement.style.setProperty('--nav', dark_nav);
            document.documentElement.style.setProperty('--bg', dark_bg);
            document.documentElement.style.setProperty('--card', dark_card);
            document.documentElement.style.setProperty('--nav_hover', dark_nav_hover);
            document.documentElement.style.setProperty('--svg', dark_svg)
            document.documentElement.style.setProperty('--preview_bg', dark_preview_bg)
        }
    })
});

const currentPageUrl = window.location.href;
if (currentPageUrl === 'http://localhost:3000/') {
    document.querySelectorAll('.navbar-menu > ul > li > a').forEach(function (link) {
        link.classList.remove('currentPage');
    });
    document.querySelector('#home').classList.add('currentPage');

    const searchInput = document.getElementById("searchInput");
    const searchDropdown = document.getElementById("searchDropdown");

    // Function to read input.txt and populate dropdown
    function populateDropdown() {
        fetch("input.txt")
        .then(response => response.text())
        .then(data => {
            const lines = data.split("\n");
            lines.forEach(line => {
                const option = document.createElement("div");
                option.classList.add("py-1", "px-3", "hover-bg-gray-200", "cursor-pointer");
                option.textContent = line.trim(); // Trim whitespace
                option.addEventListener("click", () => {
                    searchInput.value = line.trim();
                    searchDropdown.innerHTML = ""; // Clear dropdown after selection
                });
                searchDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error reading input.txt:", error);
        });
    }

    // Function to update dropdown options based on input
    function updateDropdown(input) {
        const options = searchDropdown.querySelectorAll("div");
        options.forEach(option => {
            const text = option.textContent || option.innerText;
            if (text.toLowerCase().includes(input.toLowerCase())) {
                option.style.display = "block"; // Show matching options
            } else {
                option.style.display = "none"; // Hide non-matching options
            }
        });
    }

    // Event listener for input change
    searchInput.addEventListener("input", () => {
        const inputValue = searchInput.value;
        updateDropdown(inputValue);
    });

    // Populate dropdown when the page loads
    populateDropdown();

}
if (currentPageUrl.includes('reading-list')) {
    document.querySelectorAll('.navbar-menu > ul > li > a').forEach(function (link) {
        link.classList.remove('currentPage');
    });
    document.querySelector('#reading').classList.add('currentPage');
    //Reading List Toggle
    const detailView0 = document.querySelector('#detail-view-0');
    const imageView0 = document.querySelector('#image-view-0');
    const detailView1 = document.querySelector('#detail-view-1');
    const imageView1 = document.querySelector('#image-view-1');
    const detailView2 = document.querySelector('#detail-view-2');
    const imageView2 = document.querySelector('#image-view-2');
    
    detailView0.addEventListener('click', () => {
        document.querySelector('.reading-list-0').classList.add('invisible');
        document.querySelector('.reading-list-details-0').classList.remove('invisible');
    });
    
    imageView0.addEventListener('click', () => {
        document.querySelector('.reading-list-0').classList.remove('invisible');
        document.querySelector('.reading-list-details-0').classList.add('invisible');
    });

    detailView1.addEventListener('click', () => {
        document.querySelector('.reading-list-1').classList.add('invisible');
        document.querySelector('.reading-list-details-1').classList.remove('invisible');
    });
    
    imageView1.addEventListener('click', () => {
        document.querySelector('.reading-list-1').classList.remove('invisible');
        document.querySelector('.reading-list-details-1').classList.add('invisible');
    });
    
    detailView2.addEventListener('click', () => {
        document.querySelector('.reading-list-2').classList.add('invisible');
        document.querySelector('.reading-list-details-2').classList.remove('invisible');
    });
    
    imageView2.addEventListener('click', () => {
        document.querySelector('.reading-list-2').classList.remove('invisible');
        document.querySelector('.reading-list-details-2').classList.add('invisible');
    });
}
if (currentPageUrl.includes('/book/')) {
    url = document.querySelector('#preview').getAttribute('src');
    const preview_bg = rootStyles.getPropertyValue('--preview_bg')
    console.log(`${preview_bg}, url(${url}) no-repeat center / cover`)
    document.querySelector(".preview-background").style.background = `${preview_bg}, url(${url}) no-repeat center / cover`;
}
if(currentPageUrl.includes('friends')){
    document.querySelectorAll('.navbar-menu > ul > li > a').forEach(function (link) {
        link.classList.remove('currentPage');
    });
    document.querySelector('#friends').classList.add('currentPage');
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+\\|[\]{};:'",.<>/?]).{8,}$/; //Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character

if(currentPageUrl.includes('signup')){
    document.querySelectorAll('.navbar-menu > ul > li > a').forEach(function (link) {
        link.classList.remove('currentPage');
    });
    document.querySelector('#signup').classList.add('currentPage');

    //eye-icon for password
    const eye = document.querySelector('#signup-eye');
    const password = document.querySelector('.password-field');

    eye.addEventListener('click', () => {
        if (password.type === 'password') {
            password.type = 'text';
            eye.classList.remove('fa-eye-slash');
            eye.classList.add('fa-eye');
        } else {
            password.type = 'password';
            eye.classList.remove('fa-eye');
            eye.classList.add('fa-eye-slash');
        }
    });

    //form validation
    const email = document.querySelector('#email')

    email.addEventListener('input', () => {
        if(email.value.match(emailRegex)){
            email.setCustomValidity('');
        } else {
            email.setCustomValidity('Invalid email address');
        }
    });

    password.addEventListener('input', () => {
            if(password.value.match(passwordRegex)){
                password.setCustomValidity('');
            } else {
                password.setCustomValidity('Password must contain minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character');
            }
        }
    )
}
if(currentPageUrl.includes('login')){
    document.querySelectorAll('.navbar-menu > ul > li > a').forEach(function (link) {
        link.classList.remove('currentPage');
    });
    document.querySelector('#login').classList.add('currentPage');

    //eye-icon for password
    const eye = document.querySelector('#login-eye');
    const password = document.querySelector('.password-field');

    eye.addEventListener('click', () => {
        if (password.type === 'password') {
            password.type = 'text';
            eye.classList.remove('fa-eye-slash');
            eye.classList.add('fa-eye');
        } else {
            password.type = 'password';
            eye.classList.remove('fa-eye');
            eye.classList.add('fa-eye-slash');
        }
    });
}