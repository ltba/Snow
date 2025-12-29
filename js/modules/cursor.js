/**
 * 自定义鼠标模块
 * 基于 beautifulPage 的实现，简化并适配新标签页
 */

const CursorModule = {
    cursor: null,
    pos: {
        curr: null,
        prev: null
    },
    isRendering: false,

    /**
     * 线性插值函数
     */
    lerp(a, b, n) {
        if (Math.round(a) === b) {
            return b;
        }
        return (1 - n) * a + n * b;
    },

    /**
     * 初始化自定义鼠标
     */
    init() {
        // 检查是否为移动设备
        if (window.innerWidth <= 768) {
            return;
        }

        this.create();
        this.bindEvents();
        this.startRenderLoop();

        console.log('自定义鼠标初始化完成');
    },

    /**
     * 创建光标元素
     */
    create() {
        if (!this.cursor) {
            this.cursor = document.createElement('div');
            this.cursor.id = 'cursor';
            this.cursor.classList.add('hidden');
            document.body.appendChild(this.cursor);
        }

        // 设置全局鼠标样式为小圆点
        const style = document.createElement('style');
        style.innerHTML = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='10px' height='10px'><circle cx='4' cy='4' r='4' fill='white' opacity='0.8'/></svg>") 4 4, auto !important}`;
        document.head.appendChild(style);
    },

    /**
     * 移动光标
     */
    move(left, top) {
        if (this.cursor) {
            this.cursor.style.left = `${left}px`;
            this.cursor.style.top = `${top}px`;
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            if (this.pos.curr === null) {
                this.move(e.clientX - 8, e.clientY - 8);
            }
            this.pos.curr = {
                x: e.clientX - 8,
                y: e.clientY - 8
            };
            this.cursor.classList.remove('hidden');
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.classList.remove('hidden');
        });

        document.addEventListener('mouseleave', () => {
            this.cursor.classList.add('hidden');
        });

        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('active');
        });

        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('active');
        });
    },

    /**
     * 启动渲染循环
     */
    startRenderLoop() {
        if (this.isRendering) return;
        this.isRendering = true;
        this.render();
    },

    /**
     * 渲染光标动画
     */
    render() {
        if (!this.isRendering) return;

        if (this.pos.curr) {
            if (this.pos.prev) {
                this.pos.prev.x = this.lerp(this.pos.prev.x, this.pos.curr.x, 0.35);
                this.pos.prev.y = this.lerp(this.pos.prev.y, this.pos.curr.y, 0.35);
                this.move(this.pos.prev.x, this.pos.prev.y);
            } else {
                this.pos.prev = { ...this.pos.curr };
            }
        }

        requestAnimationFrame(() => this.render());
    }
};
