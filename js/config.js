/**
 * 配置文件 - 全局常量和配置项
 */

// 存储键名常量
const STORAGE_KEYS = {
    BACKGROUND_IMAGE: 'backgroundImage',
    BACKGROUND_TYPE: 'backgroundType',
    SEARCH_ENGINE: 'searchEngine',
    QUOTE_CACHE: 'quoteCache',
    QUOTE_ENABLED: 'quoteEnabled',
    QUOTE_TYPES: 'quoteTypes',
    COPY_PROTECTION: 'copyProtection',
    QUICK_ACCESS: 'quickAccess',
    QUICK_ACCESS_POSITION: 'quickAccessPosition'
};

// 搜索引擎配置
const SEARCH_ENGINES = {
    google: 'https://www.google.com/search?q=',
    baidu: 'https://www.baidu.com/s?wd=',
    bing: 'https://www.bing.com/search?q='
};

// 一言 API 配置
const HITOKOTO_API = 'https://v1.hitokoto.cn/';

// 默认配置
const DEFAULT_CONFIG = {
    backgroundType: 'gradient',
    backgroundImage: '',
    searchEngine: 'baidu',
    quoteEnabled: true,
    quoteTypes: ['a', 'b', 'c', 'd', 'i'],
    copyProtection: true,
    quickAccessPosition: 'bottom'
};

// 缓存过期时间（1小时）
const CACHE_EXPIRY = 60 * 60 * 1000;

// 图片文件大小限制（5MB）
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// 支持的图片格式
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

// 图片托管服务白名单
const IMAGE_HOSTS = ['unsplash', 'pexels', 'pixabay', 'imgur'];
