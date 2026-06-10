(function() {
    const container = document.getElementById('petalContainer');
    for(let i=0;i<45;i++) {
        const petal = document.createElement('div');
        petal.classList.add('falling-petal');
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = 7 + Math.random() * 15 + 's';
        petal.style.animationDelay = Math.random() * 12 + 's';
        petal.style.background = `hsl(${30 + Math.random() * 35}, 70%, 65%)`;
        petal.style.width = `${6 + Math.random() * 8}px`;
        petal.style.height = `${6 + Math.random() * 8}px`;
        container.appendChild(petal);
    }
})();