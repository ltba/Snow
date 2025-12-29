/**
 * 搜索模块 - 处理搜索相关功能
 */

const SearchModule = {
    searchForm: null,
    searchInput: null,
    searchEngineSelect: null,

    /**
     * 初始化搜索模块
     */
    async init() {
        this.searchForm = document.getElementById('search-form');
        this.searchInput = document.getElementById('search-input');
        this.searchEngineSelect = document.getElementById('search-engine');

        if (!this.searchForm || !this.searchInput || !this.searchEngineSelect) {
            return;
        }

        // 加载搜索引擎设置
        await this.loadSearchEngine();

        // 绑定事件
        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));

        // 监听自定义 select 的变化
        this.searchEngineSelect.addEventListener('customSelectChange', (e) => {
            this.saveSearchEngine(e.detail.value);
        });

        // 自动获取焦点
        this.searchInput.focus();
    },

    /**
     * 加载搜索引擎设置
     */
    async loadSearchEngine() {
        const engine = await StorageManager.getWithDefault(
            STORAGE_KEYS.SEARCH_ENGINE,
            DEFAULT_CONFIG.searchEngine
        );
        // 使用自定义 select 的 API 设置值
        CustomSelectModule.setValue(this.searchEngineSelect, engine);
    },

    /**
     * 保存搜索引擎设置
     * @param {string} engine - 搜索引擎名称
     */
    async saveSearchEngine(engine) {
        await StorageManager.set(STORAGE_KEYS.SEARCH_ENGINE, engine);
    },

    /**
     * 处理搜索提交
     * @param {Event} e - 表单提交事件
     */
    handleSearch(e) {
        e.preventDefault();

        const query = this.searchInput.value.trim();
        if (!query) return;

        // 判断是否为 URL
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (urlPattern.test(query)) {
            // 如果是 URL，直接跳转
            const url = query.startsWith('http') ? query : `https://${query}`;
            window.location.href = url;
        } else {
            // 否则使用搜索引擎搜索
            const engine = CustomSelectModule.getValue(this.searchEngineSelect);
            const searchUrl = SEARCH_ENGINES[engine] + encodeURIComponent(query);
            window.location.href = searchUrl;
        }
    }
};
