/**
 * 快捷访问模块 - macOS Dock 风格
 */

const QuickAccessModule = {
    container: null,
    items: [],
    editMode: false,

    /**
     * 初始化快捷访问模块
     */
    async init() {
        this.container = document.getElementById('quick-access');
        if (!this.container) {
            console.warn('快捷访问容器未找到');
            return;
        }

        // 加载快捷访问列表
        await this.loadItems();

        // 加载位置设置并应用
        await this.loadPosition();

        // 渲染
        this.render();

        console.log('快捷访问模块初始化完成');
    },

    /**
     * 加载快捷访问列表
     */
    async loadItems() {
        this.items = await StorageManager.getWithDefault(
            STORAGE_KEYS.QUICK_ACCESS,
            []
        );
    },

    /**
     * 加载并应用位置设置
     */
    async loadPosition() {
        const position = await StorageManager.getWithDefault(
            STORAGE_KEYS.QUICK_ACCESS_POSITION,
            DEFAULT_CONFIG.quickAccessPosition
        );
        this.applyPosition(position);
    },

    /**
     * 应用位置样式
     * @param {string} position - 位置 ('top' 或 'bottom')
     */
    applyPosition(position) {
        if (!this.container) return;

        // 移除现有位置类
        this.container.classList.remove('position-top', 'position-bottom');

        // 添加新位置类
        if (position === 'top') {
            this.container.classList.add('position-top');
        } else {
            this.container.classList.add('position-bottom');
        }
    },

    /**
     * 渲染快捷访问
     */
    render() {
        if (!this.container) return;

        // 如果没有项目，隐藏容器
        if (this.items.length === 0) {
            this.container.classList.remove('visible');
            return;
        }

        // 显示容器
        this.container.classList.add('visible');

        // 清空容器
        this.container.innerHTML = '';

        // 渲染每个项目
        this.items.forEach((item, index) => {
            const itemEl = this.createItemElement(item, index);
            this.container.appendChild(itemEl);
        });
    },

    /**
     * 创建快捷访问项元素
     */
    createItemElement(item, index) {
        const itemEl = document.createElement('a');
        itemEl.className = 'quick-access-item';
        itemEl.href = item.url;
        // itemEl.target = '_blank';
        itemEl.rel = 'noopener noreferrer';

        // 图标容器
        const iconEl = document.createElement('div');
        iconEl.className = 'quick-access-icon';

        // 使用 favicon
        if (item.icon) {
            const img = document.createElement('img');
            img.src = item.icon;
            img.alt = item.title;
            img.onerror = () => {
                // 如果图标加载失败，使用默认图标
                img.style.display = 'none';
                iconEl.innerHTML = this.getDefaultIcon();
            };
            iconEl.appendChild(img);
        } else {
            iconEl.innerHTML = this.getDefaultIcon();
        }

        // 标签
        const labelEl = document.createElement('span');
        labelEl.className = 'quick-access-label';
        labelEl.textContent = item.title;

        // 删除按钮
        const removeEl = document.createElement('button');
        removeEl.className = 'quick-access-remove';
        removeEl.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        removeEl.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeItem(index);
        };

        itemEl.appendChild(iconEl);
        itemEl.appendChild(labelEl);
        itemEl.appendChild(removeEl);

        return itemEl;
    },

    /**
     * 获取默认图标
     */
    getDefaultIcon() {
        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
        `;
    },

    /**
     * 添加快捷访问
     */
    async addItem(title, url, icon = null) {
        // 检查是否已存在
        const exists = this.items.some(item => item.url === url);
        if (exists) {
            return false;
        }

        // 如果没有提供图标，尝试获取 favicon
        if (!icon) {
            icon = this.getFaviconUrl(url);
        }

        const newItem = {
            title: title || this.getTitleFromUrl(url),
            url: url,
            icon: icon,
            addedAt: Date.now()
        };

        this.items.push(newItem);
        await this.saveItems();
        this.render();

        return true;
    },

    /**
     * 移除快捷访问
     */
    async removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            await this.saveItems();
            this.render();
        }
    },

    /**
     * 更新快捷访问
     */
    async updateItem(index, updates) {
        if (index >= 0 && index < this.items.length) {
            this.items[index] = { ...this.items[index], ...updates };
            await this.saveItems();
            this.render();
        }
    },

    /**
     * 保存快捷访问列表
     */
    async saveItems() {
        await StorageManager.set(STORAGE_KEYS.QUICK_ACCESS, this.items);
    },

    /**
     * 获取 favicon URL
     */
    getFaviconUrl(url) {
        try {
            const urlObj = new URL(url);
            return `${urlObj.origin}/favicon.ico`;
        } catch (e) {
            return null;
        }
    },

    /**
     * 从 URL 提取标题
     */
    getTitleFromUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch (e) {
            return url;
        }
    },

    /**
     * 切换编辑模式
     */
    toggleEditMode() {
        this.editMode = !this.editMode;
        if (this.container) {
            if (this.editMode) {
                this.container.classList.add('edit-mode');
            } else {
                this.container.classList.remove('edit-mode');
            }
        }
    },

    /**
     * 获取所有项目
     */
    getItems() {
        return [...this.items];
    },

    /**
     * 重新排序项目
     * @param {number} fromIndex - 源索引
     * @param {number} toIndex - 目标索引
     */
    async reorderItems(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.items.length ||
            toIndex < 0 || toIndex >= this.items.length ||
            fromIndex === toIndex) {
            return;
        }

        // 移动数组元素
        const [movedItem] = this.items.splice(fromIndex, 1);
        this.items.splice(toIndex, 0, movedItem);

        // 保存并重新渲染
        await this.saveItems();
        this.render();
    }
};
