/**
 * Popup 弹窗逻辑
 */

// DOM 元素
const elements = {
    siteIcon: document.getElementById('site-icon'),
    siteTitle: document.getElementById('site-title'),
    siteUrl: document.getElementById('site-url'),
    statusMessage: document.getElementById('status-message'),
    addBtn: document.getElementById('add-btn'),
    removeBtn: document.getElementById('remove-btn')
};

// 当前标签页信息
let currentTab = null;
let quickAccessItems = [];

/**
 * 初始化
 */
async function init() {
    try {
        // 获取当前标签页
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tabs[0];

        if (!currentTab) {
            showStatus('无法获取当前标签页信息', 'error');
            return;
        }

        // 显示网站信息
        displaySiteInfo();

        // 加载快捷访问列表
        await loadQuickAccessItems();

        // 检查是否已存在
        checkIfExists();

        // 绑定事件
        bindEvents();
    } catch (error) {
        console.error('初始化失败:', error);
        showStatus('初始化失败', 'error');
    }
}

/**
 * 显示网站信息
 */
function displaySiteInfo() {
    // 设置标题
    elements.siteTitle.textContent = currentTab.title || '未知网站';

    // 设置 URL
    const url = new URL(currentTab.url);
    elements.siteUrl.textContent = url.hostname;

    // 设置图标
    if (currentTab.favIconUrl && !currentTab.favIconUrl.includes('chrome://')) {
        elements.siteIcon.src = currentTab.favIconUrl;
        elements.siteIcon.onerror = () => {
            elements.siteIcon.src = getFaviconUrl(currentTab.url);
        };
    } else {
        elements.siteIcon.src = getFaviconUrl(currentTab.url);
    }
}

/**
 * 获取 favicon URL
 */
function getFaviconUrl(url) {
    try {
        const urlObj = new URL(url);
        return `${urlObj.origin}/favicon.ico`;
    } catch (e) {
        return '';
    }
}

/**
 * 加载快捷访问列表
 */
async function loadQuickAccessItems() {
    const result = await StorageManager.get(STORAGE_KEYS.QUICK_ACCESS);
    quickAccessItems = result || [];
}

/**
 * 检查当前网站是否已存在
 */
function checkIfExists() {
    const exists = quickAccessItems.some(item => item.url === currentTab.url);

    if (exists) {
        // 已存在，显示移除按钮
        elements.addBtn.style.display = 'none';
        elements.removeBtn.style.display = 'block';
    } else {
        // 不存在，显示添加按钮
        elements.addBtn.style.display = 'block';
        elements.removeBtn.style.display = 'none';
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    elements.addBtn.addEventListener('click', handleAdd);
    elements.removeBtn.addEventListener('click', handleRemove);
}

/**
 * 处理添加
 */
async function handleAdd() {
    try {
        // 禁用按钮
        elements.addBtn.disabled = true;

        // 检查是否已存在
        const exists = quickAccessItems.some(item => item.url === currentTab.url);
        if (exists) {
            showStatus('该网站已在快捷访问中', 'info');
            elements.addBtn.disabled = false;
            return;
        }

        // 获取图标 URL
        let iconUrl = currentTab.favIconUrl;
        if (!iconUrl || iconUrl.includes('chrome://')) {
            iconUrl = getFaviconUrl(currentTab.url);
        }

        // 创建新项目
        const newItem = {
            title: currentTab.title || new URL(currentTab.url).hostname,
            url: currentTab.url,
            icon: iconUrl,
            addedAt: Date.now()
        };

        // 添加到列表
        quickAccessItems.push(newItem);

        // 保存到存储
        await StorageManager.set(STORAGE_KEYS.QUICK_ACCESS, quickAccessItems);

        // 显示成功消息
        showStatus('添加成功！', 'success');

        // 更新按钮状态
        setTimeout(() => {
            elements.addBtn.style.display = 'none';
            elements.removeBtn.style.display = 'block';
            elements.addBtn.disabled = false;
        }, 1000);
    } catch (error) {
        console.error('添加失败:', error);
        showStatus('添加失败，请重试', 'error');
        elements.addBtn.disabled = false;
    }
}

/**
 * 处理移除
 */
async function handleRemove() {
    try {
        // 禁用按钮
        elements.removeBtn.disabled = true;

        // 查找并移除
        const index = quickAccessItems.findIndex(item => item.url === currentTab.url);
        if (index === -1) {
            showStatus('该网站不在快捷访问中', 'info');
            elements.removeBtn.disabled = false;
            return;
        }

        // 从列表中移除
        quickAccessItems.splice(index, 1);

        // 保存到存储
        await StorageManager.set(STORAGE_KEYS.QUICK_ACCESS, quickAccessItems);

        // 显示成功消息
        showStatus('移除成功！', 'success');

        // 更新按钮状态
        setTimeout(() => {
            elements.removeBtn.style.display = 'none';
            elements.addBtn.style.display = 'block';
            elements.removeBtn.disabled = false;
        }, 1000);
    } catch (error) {
        console.error('移除失败:', error);
        showStatus('移除失败，请重试', 'error');
        elements.removeBtn.disabled = false;
    }
}

/**
 * 显示状态消息
 */
function showStatus(message, type = 'info') {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message ${type}`;
    elements.statusMessage.style.display = 'block';

    // 3秒后自动隐藏
    setTimeout(() => {
        elements.statusMessage.style.display = 'none';
    }, 3000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
