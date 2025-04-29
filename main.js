        // Admin credentials (in a real application, this would be handled server-side)
        const adminCredentials = {
          username: 'admin',
          password: 'admin123'
        };
        
        // Store photos in localStorage (in a real application, this would be a database)
        let photos = JSON.parse(localStorage.getItem('albumPhotos')) || [];
        
        // DOM elements
        const adminLoginButton = document.getElementById('admin-login-button');
        const loginSection = document.getElementById('login-section');
        const adminPanel = document.getElementById('admin-panel');
        const loginBtn = document.getElementById('login-btn');
        const cancelLoginBtn = document.getElementById('cancel-login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const loginError = document.getElementById('login-error');
        const photoGrid = document.getElementById('photo-grid');
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const photoTitleInput = document.getElementById('photo-title');
        const photoDescInput = document.getElementById('photo-description');
        const photoFileInput = document.getElementById('photo-file');
        const photoPreview = document.getElementById('photo-preview');
        const uploadBtn = document.getElementById('upload-btn');
        const uploadMessage = document.getElementById('upload-message');
        
        // Modal elements
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-img');
        const modalClose = document.querySelector('.close');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalDate = document.getElementById('modal-date');
        
        // Show admin login section
        adminLoginButton.addEventListener('click', () => {
          loginSection.style.display = 'block';
          adminLoginButton.style.display = 'none';
        });
        
        // Hide admin login section
        cancelLoginBtn.addEventListener('click', () => {
          loginSection.style.display = 'none';
          adminLoginButton.style.display = 'block';
          loginError.style.display = 'none';
          usernameInput.value = '';
          passwordInput.value = '';
        });
        
        // Check if user is logged in
        function checkLoginStatus() {
          const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
          if (isLoggedIn) {
            loginSection.style.display = 'none';
            adminPanel.style.display = 'block';
            adminLoginButton.style.display = 'none';
            
            // Add admin controls to existing photos
            const adminControls = document.querySelectorAll('.admin-controls');
            adminControls.forEach(control => {
              control.style.display = 'block';
            });
          } else {
            adminPanel.style.display = 'none';
            adminLoginButton.style.display = 'block';
            
            // Hide admin controls
            const adminControls = document.querySelectorAll('.admin-controls');
            adminControls.forEach(control => {
              control.style.display = 'none';
            });
          }
        }
        
        // Login functionality
        loginBtn.addEventListener('click', () => {
          const username = usernameInput.value;
          const password = passwordInput.value;
          
          if (username === adminCredentials.username && password === adminCredentials.password) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            loginError.style.display = 'none';
            checkLoginStatus();
          } else {
            loginError.style.display = 'block';
          }
        });
        
        // Logout functionality
        logoutBtn.addEventListener('click', () => {
          sessionStorage.removeItem('adminLoggedIn');
          checkLoginStatus();
        });
        
        // Preview selected photo
        photoFileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              photoPreview.src = e.target.result;
              photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
          }
        });
        
        // Upload photo
        uploadBtn.addEventListener('click', () => {
          const title = photoTitleInput.value;
          const description = photoDescInput.value;
          const fileInput = photoFileInput;
          
          if (!title || !description || !fileInput.files[0]) {
            uploadMessage.textContent = 'Please fill in all fields and select a photo.';
            uploadMessage.style.color = '#fc8181'; // red-300
            uploadMessage.style.display = 'block';
            return;
          }
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const newPhoto = {
              id: Date.now().toString(),
              title: title,
              description: description,
              image: e.target.result,
              date: new Date().toLocaleDateString()
            };
            
            photos.push(newPhoto);
            localStorage.setItem('albumPhotos', JSON.stringify(photos));
            displayPhotos();
            
            // Reset form
            photoTitleInput.value = '';
            photoDescInput.value = '';
            photoFileInput.value = '';
            photoPreview.style.display = 'none';
            
            uploadMessage.textContent = 'Photo uploaded successfully!';
            uploadMessage.style.color = '#68d391'; // green-300
            uploadMessage.style.display = 'block';
            
            setTimeout(() => {
              uploadMessage.style.display = 'none';
            }, 3000);
          };
          
          reader.readAsDataURL(fileInput.files[0]);
        });
        
        // Display photos
        function displayPhotos() {
          photoGrid.innerHTML = '';
          
          if (photos.length === 0) {
            photoGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; padding: 40px;">No photos yet. Upload some memories!</p>';
            return;
          }
          
          photos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.setAttribute('data-id', photo.id);
            
            photoItem.innerHTML = `
                    <img src="${photo.image}" alt="${photo.title}">
                    <div class="photo-info">
                        <h3>${photo.title}</h3>
                        <p>${photo.description.length > 60 ? photo.description.substring(0, 60) + '...' : photo.description}</p>
                        <small>Added on: ${photo.date}</small>
                        <div class="admin-controls" style="margin-top: 10px;">
                            <button class="delete-btn" data-id="${photo.id}">Delete</button>
                        </div>
                    </div>
                `;
            
            photoGrid.appendChild(photoItem);
            
            // Add click event to open modal
            photoItem.addEventListener('click', (e) => {
              // Don't open modal if delete button is clicked
              if (e.target.classList.contains('delete-btn')) return;
              
              modalImg.src = photo.image;
              modalTitle.textContent = photo.title;
              modalDescription.textContent = photo.description;
              modalDate.textContent = 'Added on: ' + photo.date;
              modal.style.display = 'flex';
              document.body.style.overflow = 'hidden'; // Prevent scrolling
              
              setTimeout(() => {
                modal.classList.add('fade-in');
              }, 10);
            });
          });
          
          // Add event listeners to delete buttons
          const deleteButtons = document.querySelectorAll('.delete-btn');
          deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
              e.stopPropagation(); // Prevent opening the modal
              const photoId = e.target.getAttribute('data-id');
              deletePhoto(photoId);
            });
          });
          
          checkLoginStatus();
        }
        
        // Close modal when clicking X
        modalClose.addEventListener('click', () => {
          modal.classList.remove('fade-in');
          setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Re-enable scrolling
          }, 300);
        });
        
        // Close modal when clicking outside the image
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('fade-in');
            setTimeout(() => {
              modal.style.display = 'none';
              document.body.style.overflow = ''; // Re-enable scrolling
            }, 300);
          }
        });
        
        // Delete photo
        function deletePhoto(id) {
          photos = photos.filter(photo => photo.id !== id);
          localStorage.setItem('albumPhotos', JSON.stringify(photos));
          displayPhotos();
        }
        
        // Initialize the app
        window.addEventListener('DOMContentLoaded', () => {
          checkLoginStatus();
          displayPhotos();
        });