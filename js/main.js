/**
 * 主入口文件 - 新标签页
 */

// 初始化应用
async function initApp() {
    try {
        // 初始化默认配置
        await StorageManager.initDefaults();

        // 初始化各个模块
        await Promise.all([
            TimeModule.init(),
            SearchModule.init(),
            QuoteModule.init(),
            BackgroundModule.init(),
            SecurityModule.init(),
            SettingsModule.init(),
            QuickAccessModule.init()
        ]);

        // 初始化自定义组件（非阻塞）
        CustomSelectModule.init();
        CursorModule.init();

        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// 添加设置按钮功能
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // 打开设置弹窗
            SettingsModule.openModal();
        });
    }
});
