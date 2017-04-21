class Canvas {
  constructor (id) {

    if (!id) {
      console.log('No element provided');
      return;
    }

    this.element = document.createElement('canvas');
    this.element.id = id;
    this.targetElement = document.querySelector('.canvas-wrap');
    this.ctx = null;

    this.blockSize = 15;
    this.block = null;
    this.x = 0;
    this.y = 0;
    this.colorCode = null;
    this.isDrawing = true;
  }

  init () {
    this.element.setAttribute('height', '100vh');
    this.element.setAttribute('width', '50vw');

    this.element.width = window.innerWidth / 2;
    this.element.height = window.innerHeight;
    this.ctx = this.element.getContext('2d');
    this.block = this.ctx.createImageData(this.blockSize, this.blockSize);

    this.targetElement.appendChild(this.element);
  }

  setCode (colorCode) {
    this.colorCode = colorCode;
  }

  getColor () {
    var color = {};
    color.a = 255;

    if (this.colorCode > 3) {                                     // bad colors
      color.r = this.colorCode * 20;
      color.g = this.colorCode * 20;
      color.b = this.colorCode * 20;            
    } else {
      switch(this.colorCode) {                                    // good colors
        case (1) :
          color.r = 105; color.g = 48; color.b = 109;             // purpleish
          break;
        case (2) : 
          color.r = 255; color.g = 159; color.b = 28;             // yellowish
          break;
        case (3) :
          color.r = 231; color.g = 21; color.b = 109;             // pinkish 
          break;
        default :
          color.r = 43; color.g = 168; color.b = 74;              // greenish
          break; 
      }
    }

    return color;
  }

  paintBlock () {
    var d = this.block.data;
    var color = this.getColor();

    for (var i = 0; i < d.length; i += 4) {
      d[i+0] = color.r;
      d[i+1] = color.g;
      d[i+2] = color.b;
      d[i+3] = color.a;
    }

    this.ctx.putImageData(this.block, this.x, this.y);
  }

  draw () {
    if ( this.y >= this.element.height) {
      this.isDrawing = false;
      return;
    }

    this.paintBlock();
    this.x += this.blockSize;
    if (this.x >= this.element.width) {
      this.y += this.blockSize;
      this.x = 0;
    }
  }

  destroy () {
    this.element.remove();
  }

}

var goodCanvas = null,
  badCanvas = null,
  socket = null,
  startBtn = document.querySelector('.btn-start'),
  backBtn = document.querySelector('.btn-close-board');

startBtn.addEventListener('click', function () {
  restart();
  document.body.classList.add('painting');
  initSocket();

  // test();
});

backBtn.addEventListener('click', function () {
  goodCanvas.destroy();
  badCanvas.destroy();
  document.body.classList.remove('painting');
});

function restart () {
  goodCanvas = null;
  badCanvas = null;
  goodCanvas = new Canvas('good-canvas');
  badCanvas = new Canvas('bad-canvas');
  goodCanvas.init();
  badCanvas.init();
}

function initSocket () {
  socket = io.connect('/');
  socket.on('code', function (code) {

      var canvas = code > 3 ? badCanvas : goodCanvas;
      
      if (!canvas.isDrawing)
        finishSocket();

      canvas.setCode(code);
      canvas.draw();

  });

  socket.on('error', function (err) {
    console.log(err);
  });
}

function finishSocket () {
  socket.disconnect();
  console.log('something won!');
}

function test () {
  setInterval(function () {
    goodCanvas.setCode(2);
    goodCanvas.draw();

    console.log(goodCanvas.isDrawing);
  }, 50);

  setInterval(function () {
    badCanvas.setCode(4);
    badCanvas.draw();
  }, 55);
}