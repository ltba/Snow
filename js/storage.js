/**
 * 存储管理模块 - 封装 Chrome Storage API
 */

const StorageManager = {
    /**
     * 获取单个配置项
     * @param {string} key - 配置键名
     * @returns {Promise<any>} 配置值
     */
    async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key]);
            });
        });
    },

    /**
     * 获取多个配置项
     * @param {string[]} keys - 配置键名数组
     * @returns {Promise<Object>} 配置对象
     */
    async getMultiple(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.get(keys, (result) => {
                resolve(result);
            });
        });
    },

    /**
     * 获取所有配置
     * @returns {Promise<Object>} 所有配置
     */
    async getAll() {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (result) => {
                resolve(result);
            });
        });
    },

    /**
     * 设置单个配置项
     * @param {string} key - 配置键名
     * @param {any} value - 配置值
     * @returns {Promise<void>}
     */
    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    },

    /**
     * 设置多个配置项
     * @param {Object} items - 配置对象
     * @returns {Promise<void>}
     */
    async setMultiple(items) {
        return new Promise((resolve) => {
            chrome.storage.local.set(items, () => {
                resolve();
            });
        });
    },

    /**
     * 删除单个配置项
     * @param {string} key - 配置键名
     * @returns {Promise<void>}
     */
    async remove(key) {
        return new Promise((resolve) => {
            chrome.storage.local.remove([key], () => {
                resolve();
            });
        });
    },

    /**
     * 删除多个配置项
     * @param {string[]} keys - 配置键名数组
     * @returns {Promise<void>}
     */
    async removeMultiple(keys) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(keys, () => {
                resolve();
            });
        });
    },

    /**
     * 清空所有配置
     * @returns {Promise<void>}
     */
    async clear() {
        return new Promise((resolve) => {
            chrome.storage.local.clear(() => {
                resolve();
            });
        });
    },

    /**
     * 获取配置（带默认值）
     * @param {string} key - 配置键名
     * @param {any} defaultValue - 默认值
     * @returns {Promise<any>} 配置值或默认值
     */
    async getWithDefault(key, defaultValue) {
        const value = await this.get(key);
        return value !== undefined ? value : defaultValue;
    },

    /**
     * 初始化默认配置
     * @returns {Promise<void>}
     */
    async initDefaults() {
        const existing = await this.getAll();
        const updates = {};

        // 只设置不存在的配置项
        for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
            const storageKey = STORAGE_KEYS[key.toUpperCase().replace(/([A-Z])/g, '_$1')];
            if (storageKey && existing[storageKey] === undefined) {
                updates[storageKey] = value;
            }
        }

        if (Object.keys(updates).length > 0) {
            await this.setMultiple(updates);
        }
    }
};
