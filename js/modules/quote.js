/**
 * 每日一言模块 - 处理一言相关功能
 */

const QuoteModule = {
    quoteTextElement: null,
    quoteSourceElement: null,
    quoteSectionElement: null,
    refreshBtn: null,

    /**
     * 初始化一言模块
     */
    async init() {
        this.quoteTextElement = document.getElementById('quote-text');
        this.quoteSourceElement = document.getElementById('quote-source');
        this.quoteSectionElement = document.querySelector('.quote-section');
        this.refreshBtn = document.getElementById('refresh-quote-btn');

        if (!this.quoteTextElement || !this.quoteSourceElement) {
            return;
        }

        // 检查是否启用一言
        const enabled = await StorageManager.getWithDefault(
            STORAGE_KEYS.QUOTE_ENABLED,
            DEFAULT_CONFIG.quoteEnabled
        );

        if (enabled) {
            await this.loadQuote();
            if (this.quoteSectionElement) {
                this.quoteSectionElement.style.display = 'block';
            }
        } else {
            if (this.quoteSectionElement) {
                this.quoteSectionElement.style.display = 'none';
            }
        }

        // 绑定刷新按钮
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.refreshQuote());
        }
    },

    /**
     * 加载一言
     */
    async loadQuote() {
        try {
            // 先尝试从缓存加载
            const cached = await this.getCachedQuote();
            if (cached && !this.isQuoteCacheExpired(cached.timestamp)) {
                this.displayQuote(cached.data);
                return;
            }

            // 从 API 获取新的一言
            const quoteTypes = await StorageManager.getWithDefault(
                STORAGE_KEYS.QUOTE_TYPES,
                DEFAULT_CONFIG.quoteTypes
            );

            const typeParams = quoteTypes.map(t => `c=${t}`).join('&');
            const response = await fetch(`${HITOKOTO_API}?${typeParams}`);

            if (!response.ok) throw new Error('网络请求失败');

            const data = await response.json();
            this.displayQuote(data);

            // 缓存一言数据
            await this.cacheQuote(data);

        } catch (error) {
            console.error('获取一言失败:', error);
            this.displayQuote({
                hitokoto: '世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。',
                from: '罗曼·罗兰'
            });
        }
    },

    /**
     * 显示一言
     * @param {Object} data - 一言数据
     */
    displayQuote(data) {
        this.quoteTextElement.textContent = data.hitokoto;

        if (data.from) {
            let source = `—— ${data.from}`;
            if (data.from_who) {
                source = `—— ${data.from_who}《${data.from}》`;
            }
            this.quoteSourceElement.textContent = source;
        } else {
            this.quoteSourceElement.textContent = '';
        }
    },

    /**
     * 获取缓存的一言
     * @returns {Promise<Object|null>} 缓存的一言数据
     */
    async getCachedQuote() {
        return await StorageManager.get(STORAGE_KEYS.QUOTE_CACHE);
    },

    /**
     * 缓存一言数据
     * @param {Object} data - 一言数据
     */
    async cacheQuote(data) {
        const cache = {
            data: data,
            timestamp: Date.now()
        };
        await StorageManager.set(STORAGE_KEYS.QUOTE_CACHE, cache);
    },

    /**
     * 检查缓存是否过期
     * @param {number} timestamp - 时间戳
     * @returns {boolean} 是否过期
     */
    isQuoteCacheExpired(timestamp) {
        return Date.now() - timestamp > CACHE_EXPIRY;
    },

    /**
     * 刷新一言
     */
    async refreshQuote() {
        // 清除缓存
        await StorageManager.remove(STORAGE_KEYS.QUOTE_CACHE);
        // 重新加载
        await this.loadQuote();
    },

    /**
     * 清除一言缓存
     */
    async clearCache() {
        await StorageManager.remove(STORAGE_KEYS.QUOTE_CACHE);
    }
};
