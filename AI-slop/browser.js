(function detectBrowser() {
  var item = document.getElementById("browser-li");
  if (!item) return;

  var agent = navigator.userAgent || "";
  var vendor = navigator.vendor || "";

  var name = "";
  var homepage = "";
  if (/iPhone|iPad|iPod/.test(agent)) {
    name = "Safari";
    homepage = "https://www.apple.com/safari/";
  } else if (!/EdgA?\/|EdgiOS\/|OPR\/|OPT\/|SamsungBrowser\/|Vivaldi\//.test(agent) &&
      (/CriOS\//.test(agent) || (/Chrome\//.test(agent) && /Google/.test(vendor)))) {
    name = "Google Chrome";
    homepage = "https://www.google.com/chrome/";
  } else if (/Firefox\/|FxiOS\//.test(agent)) {
    name = "Firefox";
    homepage = "https://www.mozilla.org/firefox/";
  } else if (/Safari\//.test(agent) && /Apple/.test(vendor)) {
    name = "Safari";
    homepage = "https://www.apple.com/safari/";
  }

  if (name !== "") {
    item.innerHTML =
      '<a target="_blank" rel="noopener" href="' + homepage + '">' + name + "</a>" +
      ", the web browser you are using right now to read this sentence.";
  }
})();

(function init3DCube() {
    function createCube(container) {
        // 1. Inject CSS for the 3D cube
        const style = document.createElement('style');
        style.textContent = `
            .interactive-cube-wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 50px;
                perspective: 1000px;
                touch-action: none;
                margin: 20px auto;
            }
            .interactive-cube {
                width: 200px;
                height: 200px;
                position: relative;
                transform-style: preserve-3d;
                cursor: grab;
            }
            .interactive-cube:active {
                cursor: grabbing;
            }
            .interactive-cube-face {
                position: absolute;
                width: 200px;
                height: 200px;
                opacity: 0.85;
                border: 2px solid rgba(255, 255, 255, 0.4);
                box-sizing: border-box;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
            }
            .cube-front  { background-color: #ff4d4d; transform: rotateY(0deg) translateZ(100px); }
            .cube-right  { background-color: #4da6ff; transform: rotateY(90deg) translateZ(100px); }
            .cube-back   { background-color: #4dff4d; transform: rotateY(180deg) translateZ(100px); }
            .cube-left   { background-color: #ffff4d; transform: rotateY(-90deg) translateZ(100px); }
            .cube-top    { background-color: #ff4dff; transform: rotateX(90deg) translateZ(100px); }
            .cube-bottom { background-color: #ffa64d; transform: rotateX(-90deg) translateZ(100px); }
        `;
        document.head.appendChild(style);

        // 2. Build the DOM Elements
        const wrapper = document.createElement('div');
        wrapper.className = 'interactive-cube-wrapper';

        const cube = document.createElement('div');
        cube.className = 'interactive-cube';

        const faces = ['front', 'right', 'back', 'left', 'top', 'bottom'];
        faces.forEach(face => {
            const div = document.createElement('div');
            div.className = `interactive-cube-face cube-${face}`;
            cube.appendChild(div);
        });

        wrapper.appendChild(cube);
        
        if (container) {
            container.appendChild(wrapper);
        } else {
            console.warn('Container #3d-cube-container not found. Falling back to body.');
            document.body.appendChild(wrapper);
        }

        // 3. Interaction and Animation Logic
        let rotationX = -20; 
        let rotationY = -30; 
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;
        let hasInteracted = false; 

        function updateCubeTransform() {
            cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        }

        function animate() {
            if (!isDragging && !hasInteracted) {
                rotationX -= 0.2; 
                rotationY -= 0.3; 
                updateCubeTransform();
            }
            requestAnimationFrame(animate);
        }

        updateCubeTransform();
        animate();

        // 4. Input Handlers
        function startDrag(e) {
            isDragging = true;
            hasInteracted = true; 
            
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            previousMouseX = clientX;
            previousMouseY = clientY;
        }

        function onDrag(e) {
            if (!isDragging) return;
            if (e.cancelable) e.preventDefault(); 

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const deltaX = clientX - previousMouseX;
            const deltaY = clientY - previousMouseY;

            rotationY += deltaX * 0.6;
            rotationX -= deltaY * 0.6;

            previousMouseX = clientX;
            previousMouseY = clientY;

            updateCubeTransform();
        }

        function endDrag() {
            isDragging = false;
        }

        cube.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', onDrag, { passive: false });
        window.addEventListener('mouseup', endDrag);

        cube.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', onDrag, { passive: false });
        window.addEventListener('touchend', endDrag);
    }

    function initAllCubes() {
        const containers = document.querySelectorAll('[id="3d-cube-container"]');
        if (containers.length) {
            for (var i = 0; i < containers.length; i++) {
                createCube(containers[i]);
            }
        } else {
            createCube(null);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllCubes);
    } else {
        initAllCubes();
    }
})();
