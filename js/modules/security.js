/**
 * 安全模块 - 处理复制保护等安全功能
 */

const SecurityModule = {
    /**
     * 初始化安全模块
     */
    async init() {
        // 检查是否启用复制保护
        const enabled = await StorageManager.getWithDefault(
            STORAGE_KEYS.COPY_PROTECTION,
            DEFAULT_CONFIG.copyProtection
        );

        if (enabled) {
            this.enableCopyProtection();
        }
    },

    /**
     * 启用复制保护
     */
    enableCopyProtection() {
        // 禁用右键菜单
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // 禁用复制
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            return false;
        });

        // 禁用剪切
        document.addEventListener('cut', (e) => {
            e.preventDefault();
            return false;
        });

        // 禁用键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 允许在输入框中使用快捷键
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return true;
            }

            // 禁用 Ctrl+C (复制)
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                return false;
            }

            // 禁用 Ctrl+X (剪切)
            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                return false;
            }

            // 禁用 Ctrl+A (全选)
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                return false;
            }
        });
    },

    /**
     * 禁用复制保护（用于设置页面等）
     */
    disableCopyProtection() {
        // 注意：已添加的事件监听器无法完全移除
        // 这个方法主要用于设置页面等不需要保护的页面
        // 在这些页面中，不调用 enableCopyProtection 即可
    }
};
