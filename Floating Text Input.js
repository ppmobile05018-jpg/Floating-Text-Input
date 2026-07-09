class FloatingTextInput {
  constructor() {
    this.inputElement = null;
    this.currentText = '';
    this.currentArgs = null;
    this.isHiding = false;

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updatePosition());
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('fullscreenchange', () => this.updatePosition());
    }
  }

  getInfo() {
    return {
      id: 'floatingTextInput',
      name: 'Floating Text Input', 
      color1: '#0fbdb6',
      blocks: [
        {
          opcode: 'showInput',
          blockType: Scratch.BlockType.COMMAND,
          text: 'show input at X: [X] Y: [Y] width: [W] height: [H]',
          arguments: {
            X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 200 },
            H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 40 }
          }
        },
        {
          opcode: 'hideInput',
          blockType: Scratch.BlockType.COMMAND,
          text: 'hide input'
        },
        {
          opcode: 'isTyping',
          blockType: Scratch.BlockType.BOOLEAN, // <--- เพิ่มบล็อกหกเหลี่ยม Boolean ตรงนี้!
          text: 'is typing?'
        },
        {
          opcode: 'getInputText',
          blockType: Scratch.BlockType.REPORTER,
          text: 'input text'
        },
        {
          opcode: 'clearText',
          blockType: Scratch.BlockType.COMMAND,
          text: 'clear text / set text to [TXT]',
          arguments: {
            TXT: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
          }
        }
      ]
    };
  }

  showInput(args) {
    this.currentArgs = args; 
    this.isHiding = false;

    if (this.inputElement) {
      this.updatePosition();
      return;
    }

    if (typeof Scratch === 'undefined' || !Scratch.renderer || !Scratch.renderer.canvas) {
      return;
    }

    const canvas = Scratch.renderer.canvas;
    const container = canvas.parentElement;
    if (!container) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.currentText;
    
    input.style.position = 'fixed';
    input.style.boxSizing = 'border-box';
    input.style.padding = '5px';
    input.style.borderRadius = '5px';
    input.style.border = '2px solid #0fbdb6';
    input.style.backgroundColor = 'white';
    input.style.color = 'black';
    input.style.zIndex = '2147483647'; 

    const stopEvents = ['keydown', 'keyup', 'keypress', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend', 'pointerdown', 'pointerup'];
    stopEvents.forEach(eventType => {
      input.addEventListener(eventType, (e) => {
        e.stopPropagation();
      });
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.isHiding = true;
        input.blur();
        setTimeout(() => { this.isHiding = false; }, 200);
      }
    });

    input.addEventListener('blur', () => {
      if (!this.isHiding && this.inputElement) {
        setTimeout(() => {
          const gameCanvas = typeof Scratch !== 'undefined' && Scratch.renderer ? Scratch.renderer.canvas : null;
          if (gameCanvas && document.activeElement === gameCanvas) {
            if (this.inputElement) this.inputElement.focus();
          }
        }, 50);
      }
    });

    input.addEventListener('input', (e) => {
      this.currentText = e.target.value;
    });

    this.inputElement = input;
    
    const targetContainer = document.fullscreenElement || document.body;
    targetContainer.appendChild(input);

    this.updatePosition();

    setTimeout(() => {
      input.focus();
    }, 100);
  }

  updatePosition() {
    if (!this.inputElement || !this.currentArgs) return;
    if (typeof Scratch === 'undefined' || !Scratch.renderer || !Scratch.renderer.canvas) return;

    const canvas = Scratch.renderer.canvas;
    
    const targetContainer = document.fullscreenElement || document.body;
    if (this.inputElement.parentElement !== targetContainer) {
      targetContainer.appendChild(this.inputElement);
    }

    const rect = canvas.getBoundingClientRect();
    
    const scaleX = rect.width / 480;
    const scaleY = rect.height / 360;

    const finalW = this.currentArgs.W * scaleX;
    const finalH = this.currentArgs.H * scaleY;
    
    const centerX = rect.left + (rect.width / 2);
    const centerY = rect.top + (rect.height / 2);

    const finalLeft = centerX + (this.currentArgs.X * scaleX) - (finalW / 2);
    const finalTop = centerY - (this.currentArgs.Y * scaleY) - (finalH / 2);

    this.inputElement.style.left = `${finalLeft}px`;
    this.inputElement.style.top = `${finalTop}px`;
    this.inputElement.style.width = `${finalW}px`;
    this.inputElement.style.height = `${finalH}px`;
    
    this.inputElement.style.fontSize = `${Math.max(14, 18 * scaleX)}px`;
  }

  hideInput() {
    this.isHiding = true;
    if (this.inputElement) {
      this.inputElement.blur();
      this.inputElement.remove();
      this.inputElement = null;
    }
    this.currentArgs = null;
  }

  // [NEW] Boolean Block Logic: Returns True if the user is actively focusing/typing in the box
  isTyping() {
    if (!this.inputElement) return false;
    return document.activeElement === this.inputElement;
  }

  getInputText() {
    return this.currentText;
  }

  clearText(args) {
    this.currentText = args.TXT;
    if (this.inputElement) {
      this.inputElement.value = args.TXT;
    }
  }
}

Scratch.extensions.register(new FloatingTextInput());
