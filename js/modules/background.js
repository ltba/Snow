/**
 * 背景模块 - 处理背景图片相关功能
 */

const BackgroundModule = {
    bgContainer: null,
    changeBgBtn: null,
    bgModal: null,
    closeModalBtn: null,
    uploadFileBtn: null,
    bgFileInput: null,
    bgUrlInput: null,
    applyUrlBtn: null,

    /**
     * 初始化背景模块
     */
    async init() {
        this.bgContainer = document.getElementById('background-container');
        this.changeBgBtn = document.getElementById('change-bg-btn');
        this.bgModal = document.getElementById('bg-modal');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.uploadFileBtn = document.getElementById('upload-file-btn');
        this.bgFileInput = document.getElementById('bg-file-input');
        this.bgUrlInput = document.getElementById('bg-url-input');
        this.applyUrlBtn = document.getElementById('apply-url-btn');

        if (!this.bgContainer) return;

        // 加载背景
        await this.loadBackground();

        // 绑定事件
        if (this.changeBgBtn) {
            this.changeBgBtn.addEventListener('click', () => this.openModal());
        }

        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (this.bgModal) {
            this.bgModal.addEventListener('click', (e) => {
                if (e.target === this.bgModal) {
                    this.closeModal();
                }
            });
        }

        if (this.uploadFileBtn && this.bgFileInput) {
            this.uploadFileBtn.addEventListener('click', () => this.bgFileInput.click());
            this.bgFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (this.applyUrlBtn && this.bgUrlInput) {
            this.applyUrlBtn.addEventListener('click', () => this.handleUrlApply());
            this.bgUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleUrlApply();
                }
            });
        }
    },

    /**
     * 加载背景
     */
    async loadBackground() {
        const bgType = await StorageManager.getWithDefault(
            STORAGE_KEYS.BACKGROUND_TYPE,
            DEFAULT_CONFIG.backgroundType
        );

        if (bgType === 'gradient') {
            // 使用默认渐变
            this.bgContainer.style.backgroundImage = '';
            return;
        }

        const bgImage = await StorageManager.get(STORAGE_KEYS.BACKGROUND_IMAGE);
        if (bgImage) {
            this.bgContainer.style.backgroundImage = `url(${bgImage})`;
        }
    },

    /**
     * 保存背景
     * @param {string} imageUrl - 图片 URL 或 Data URL
     * @param {string} type - 背景类型
     */
    async saveBackground(imageUrl, type) {
        await StorageManager.setMultiple({
            [STORAGE_KEYS.BACKGROUND_IMAGE]: imageUrl,
            [STORAGE_KEYS.BACKGROUND_TYPE]: type
        });
    },

    /**
     * 重置背景为默认渐变
     */
    async resetBackground() {
        await StorageManager.setMultiple({
            [STORAGE_KEYS.BACKGROUND_IMAGE]: '',
            [STORAGE_KEYS.BACKGROUND_TYPE]: 'gradient'
        });
        this.bgContainer.style.backgroundImage = '';
    },

    /**
     * 打开背景设置弹窗
     */
    openModal() {
        if (this.bgModal) {
            this.bgModal.style.display = 'flex';
        }
    },

    /**
     * 关闭背景设置弹窗
     */
    closeModal() {
        if (this.bgModal) {
            this.bgModal.style.display = 'none';
        }
        if (this.bgUrlInput) {
            this.bgUrlInput.value = '';
        }
    },

    /**
     * 处理文件上传
     * @param {Event} e - 文件选择事件
     */
    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        // 检查文件大小
        if (file.size > MAX_IMAGE_SIZE) {
            alert('图片文件过大，请选择小于 5MB 的图片');
            return;
        }

        // 读取文件并转换为 Data URL
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageDataUrl = event.target.result;

            // 更新背景
            this.bgContainer.style.backgroundImage = `url(${imageDataUrl})`;

            // 保存到存储
            await this.saveBackground(imageDataUrl, 'local');

            // 关闭弹窗
            this.closeModal();
        };
        reader.readAsDataURL(file);
    },

    /**
     * 处理 URL 应用
     */
    handleUrlApply() {
        const imageUrl = this.bgUrlInput.value.trim();

        if (!imageUrl) {
            alert('请输入图片 URL');
            return;
        }

        // 验证 URL 格式
        try {
            new URL(imageUrl);
        } catch (e) {
            alert('请输入有效的 URL 地址');
            return;
        }

        // 验证是否为图片 URL
        const hasImageExtension = IMAGE_EXTENSIONS.some(ext =>
            imageUrl.toLowerCase().includes(ext)
        );

        const isKnownHost = IMAGE_HOSTS.some(host =>
            imageUrl.toLowerCase().includes(host)
        );

        if (!hasImageExtension && !isKnownHost) {
            const confirmed = confirm('URL 可能不是图片地址，是否继续？');
            if (!confirmed) return;
        }

        // 测试图片是否可以加载
        const testImg = new Image();
        testImg.onload = async () => {
            // 图片加载成功，应用背景
            this.bgContainer.style.backgroundImage = `url(${imageUrl})`;

            // 保存到存储
            await this.saveBackground(imageUrl, 'url');

            // 关闭弹窗
            this.closeModal();
        };

        testImg.onerror = () => {
            alert('无法加载该图片，请检查 URL 是否正确或图片是否允许跨域访问');
        };

        testImg.src = imageUrl;
    }
};
