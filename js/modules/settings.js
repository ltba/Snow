/**
 * 设置模块 - 管理设置弹窗和设置逻辑
 */

const SettingsModule = {
    // DOM 元素
    elements: {
        modal: null,
        closeBtn: null,
        bgTypeRadios: null,
        localUploadSection: null,
        urlInputSection: null,
        uploadLocalBtn: null,
        localFileInput: null,
        bgUrlInput: null,
        applyUrlBtn: null,
        resetBgBtn: null,
        searchEngineSelect: null,
        quoteEnabledCheckbox: null,
        quoteTypeCheckboxes: null,
        clearQuoteCacheBtn: null,
        copyProtectionCheckbox: null,
        saveSettingsBtn: null,
        cancelSettingsBtn: null,
        qaTitleInput: null,
        qaUrlInput: null,
        addQaBtn: null,
        qaList: null,
        exportConfigBtn: null,
        importConfigBtn: null,
        importConfigInput: null
    },

    // 拖拽状态
    draggedElement: null,

    /**
     * 初始化设置模块
     */
    async init() {
        try {
            // 获取 DOM 元素
            this.elements.modal = document.getElementById('settings-modal');
            this.elements.closeBtn = document.getElementById('close-settings-modal-btn');
            this.elements.bgTypeRadios = document.querySelectorAll('input[name="bg-type"]');
            this.elements.localUploadSection = document.getElementById('local-upload-section');
            this.elements.urlInputSection = document.getElementById('url-input-section');
            this.elements.uploadLocalBtn = document.getElementById('upload-local-btn');
            this.elements.localFileInput = document.getElementById('local-file-input');
            this.elements.bgUrlInput = document.getElementById('bg-url-input');
            this.elements.applyUrlBtn = document.getElementById('apply-url-btn');
            this.elements.resetBgBtn = document.getElementById('reset-bg-btn');
            this.elements.searchEngineSelect = document.getElementById('search-engine-select');
            this.elements.quoteEnabledCheckbox = document.getElementById('quote-enabled');
            this.elements.quoteTypeCheckboxes = document.querySelectorAll('input[name="quote-type"]');
            this.elements.clearQuoteCacheBtn = document.getElementById('clear-quote-cache-btn');
            this.elements.copyProtectionCheckbox = document.getElementById('copy-protection-enabled');
            this.elements.saveSettingsBtn = document.getElementById('save-settings-btn');
            this.elements.cancelSettingsBtn = document.getElementById('cancel-settings-btn');
            this.elements.qaTitleInput = document.getElementById('qa-title-input');
            this.elements.qaUrlInput = document.getElementById('qa-url-input');
            this.elements.addQaBtn = document.getElementById('add-qa-btn');
            this.elements.qaList = document.getElementById('qa-list');
            this.elements.exportConfigBtn = document.getElementById('export-config-btn');
            this.elements.importConfigBtn = document.getElementById('import-config-btn');
            this.elements.importConfigInput = document.getElementById('import-config-input');

            // 绑定事件
            this.bindEvents();

            console.log('设置模块初始化完成');
        } catch (error) {
            console.error('设置模块初始化失败:', error);
        }
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => this.closeModal());
        }

        // 点击遮罩层关闭
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.closeModal();
                }
            });
        }

        // 背景类型切换
        this.elements.bgTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateBgTypeSections(e.target.value);
            });
        });

        // 上传本地图片
        if (this.elements.uploadLocalBtn && this.elements.localFileInput) {
            this.elements.uploadLocalBtn.addEventListener('click', () => {
                this.elements.localFileInput.click();
            });
            this.elements.localFileInput.addEventListener('change', (e) => {
                this.handleLocalFileUpload(e);
            });
        }

        // 应用 URL 图片
        if (this.elements.applyUrlBtn) {
            this.elements.applyUrlBtn.addEventListener('click', () => {
                this.handleUrlApply();
            });
        }

        // 重置背景
        if (this.elements.resetBgBtn) {
            this.elements.resetBgBtn.addEventListener('click', () => {
                this.handleResetBackground();
            });
        }

        // 清除一言缓存
        if (this.elements.clearQuoteCacheBtn) {
            this.elements.clearQuoteCacheBtn.addEventListener('click', () => {
                this.handleClearQuoteCache();
            });
        }

        // 保存设置
        if (this.elements.saveSettingsBtn) {
            this.elements.saveSettingsBtn.addEventListener('click', () => {
                this.handleSaveSettings();
            });
        }

        // 取消
        if (this.elements.cancelSettingsBtn) {
            this.elements.cancelSettingsBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // 添加快捷访问
        if (this.elements.addQaBtn) {
            this.elements.addQaBtn.addEventListener('click', () => {
                this.handleAddQuickAccess();
            });
        }

        // 导出配置
        if (this.elements.exportConfigBtn) {
            this.elements.exportConfigBtn.addEventListener('click', () => {
                this.handleExportConfig();
            });
        }

        // 导入配置
        if (this.elements.importConfigBtn && this.elements.importConfigInput) {
            this.elements.importConfigBtn.addEventListener('click', () => {
                this.elements.importConfigInput.click();
            });
            this.elements.importConfigInput.addEventListener('change', (e) => {
                this.handleImportConfig(e);
            });
        }
    },

    /**
     * 打开设置弹窗
     */
    async openModal() {
        // 加载当前设置
        await this.loadSettings();

        // 加载快捷访问列表
        await this.loadQuickAccessList();

        // 显示弹窗
        if (this.elements.modal) {
            this.elements.modal.style.display = 'flex';
        }
    },

    /**
     * 关闭设置弹窗
     */
    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
        }
    },

    /**
     * 加载当前设置
     */
    async loadSettings() {
        try {
            // 加载背景类型
            const bgType = await StorageManager.getWithDefault(
                STORAGE_KEYS.BACKGROUND_TYPE,
                DEFAULT_CONFIG.backgroundType
            );
            this.elements.bgTypeRadios.forEach(radio => {
                if (radio.value === bgType) {
                    radio.checked = true;
                }
            });
            this.updateBgTypeSections(bgType);

            // 加载搜索引擎
            const searchEngine = await StorageManager.getWithDefault(
                STORAGE_KEYS.SEARCH_ENGINE,
                DEFAULT_CONFIG.searchEngine
            );
            CustomSelectModule.setValue(this.elements.searchEngineSelect, searchEngine);

            // 加载一言设置
            const quoteEnabled = await StorageManager.getWithDefault(
                STORAGE_KEYS.QUOTE_ENABLED,
                DEFAULT_CONFIG.quoteEnabled
            );
            this.elements.quoteEnabledCheckbox.checked = quoteEnabled;

            const quoteTypes = await StorageManager.getWithDefault(
                STORAGE_KEYS.QUOTE_TYPES,
                DEFAULT_CONFIG.quoteTypes
            );
            this.elements.quoteTypeCheckboxes.forEach(checkbox => {
                checkbox.checked = quoteTypes.includes(checkbox.value);
            });

            // 加载复制保护设置
            const copyProtection = await StorageManager.getWithDefault(
                STORAGE_KEYS.COPY_PROTECTION,
                DEFAULT_CONFIG.copyProtection
            );
            this.elements.copyProtectionCheckbox.checked = copyProtection;
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    },

    /**
     * 更新背景类型相关区域显示
     */
    updateBgTypeSections(type) {
        this.elements.localUploadSection.style.display = type === 'local' ? 'block' : 'none';
        this.elements.urlInputSection.style.display = type === 'url' ? 'block' : 'none';
    },

    /**
     * 处理本地文件上传
     */
    handleLocalFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            alert('图片文件过大，请选择小于 5MB 的图片');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageDataUrl = event.target.result;
            await StorageManager.setMultiple({
                [STORAGE_KEYS.BACKGROUND_IMAGE]: imageDataUrl,
                [STORAGE_KEYS.BACKGROUND_TYPE]: 'local'
            });
            alert('本地图片已设置，保存后生效');
        };
        reader.readAsDataURL(file);
    },

    /**
     * 处理 URL 应用
     */
    handleUrlApply() {
        const imageUrl = this.elements.bgUrlInput.value.trim();

        if (!imageUrl) {
            alert('请输入图片 URL');
            return;
        }

        try {
            new URL(imageUrl);
        } catch (e) {
            alert('请输入有效的 URL 地址');
            return;
        }

        const testImg = new Image();
        testImg.onload = async () => {
            await StorageManager.setMultiple({
                [STORAGE_KEYS.BACKGROUND_IMAGE]: imageUrl,
                [STORAGE_KEYS.BACKGROUND_TYPE]: 'url'
            });
            alert('URL 图片已设置，保存后生效');
        };

        testImg.onerror = () => {
            alert('无法加载该图片，请检查 URL 是否正确或图片是否允许跨域访问');
        };

        testImg.src = imageUrl;
    },

    /**
     * 处理重置背景
     */
    async handleResetBackground() {
        if (confirm('确定要恢复默认背景吗？')) {
            await StorageManager.setMultiple({
                [STORAGE_KEYS.BACKGROUND_IMAGE]: '',
                [STORAGE_KEYS.BACKGROUND_TYPE]: 'gradient'
            });
            // 更新界面
            this.elements.bgTypeRadios.forEach(radio => {
                radio.checked = radio.value === 'gradient';
            });
            this.updateBgTypeSections('gradient');
            alert('已恢复默认背景');
        }
    },

    /**
     * 处理清除一言缓存
     */
    async handleClearQuoteCache() {
        await StorageManager.remove(STORAGE_KEYS.QUOTE_CACHE);
        alert('一言缓存已清除');
    },

    /**
     * 处理保存设置
     */
    async handleSaveSettings() {
        try {
            // 获取背景类型
            const bgType = Array.from(this.elements.bgTypeRadios).find(r => r.checked)?.value || 'gradient';

            // 获取搜索引擎
            const searchEngine = CustomSelectModule.getValue(this.elements.searchEngineSelect);

            // 获取一言设置
            const quoteEnabled = this.elements.quoteEnabledCheckbox.checked;
            const quoteTypes = Array.from(this.elements.quoteTypeCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            // 获取复制保护设置
            const copyProtection = this.elements.copyProtectionCheckbox.checked;

            // 保存所有设置
            await StorageManager.setMultiple({
                [STORAGE_KEYS.BACKGROUND_TYPE]: bgType,
                [STORAGE_KEYS.SEARCH_ENGINE]: searchEngine,
                [STORAGE_KEYS.QUOTE_ENABLED]: quoteEnabled,
                [STORAGE_KEYS.QUOTE_TYPES]: quoteTypes,
                [STORAGE_KEYS.COPY_PROTECTION]: copyProtection
            });

            alert('设置已保存');

            // 关闭弹窗
            this.closeModal();

            // 刷新页面以应用设置
            window.location.reload();
        } catch (error) {
            console.error('保存设置失败:', error);
            alert('保存设置失败，请重试');
        }
    },

    /**
     * 加载快捷访问列表
     */
    async loadQuickAccessList() {
        if (!this.elements.qaList) return;

        const items = QuickAccessModule.getItems();
        this.elements.qaList.innerHTML = '';

        if (items.length === 0) {
            this.elements.qaList.innerHTML = '<p class="hint">暂无快捷访问网站</p>';
            return;
        }

        items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'qa-list-item';
            itemEl.setAttribute('data-index', index);

            // 只有多个项目时才显示拖拽手柄
            const dragHandleHtml = items.length > 1 ? `
                <div class="qa-drag-handle" draggable="true" title="拖拽排序">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="4" y1="8" x2="20" y2="8"></line>
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="16" x2="20" y2="16"></line>
                    </svg>
                </div>
            ` : '';

            itemEl.innerHTML = `
                ${dragHandleHtml}
                <div class="qa-list-item-info">
                    <img src="${item.icon || ''}" alt="${item.title}" class="qa-item-icon">
                    <div>
                        <div class="qa-list-item-title">${item.title}</div>
                        <div class="qa-list-item-url">${item.url}</div>
                    </div>
                </div>
                <div class="qa-list-item-actions">
                    <button class="btn btn-secondary btn-small qa-edit-btn" data-index="${index}">编辑</button>
                    <button class="btn btn-secondary btn-small qa-remove-btn" data-index="${index}">删除</button>
                </div>
            `;

            // 绑定图标错误处理
            const iconImg = itemEl.querySelector('.qa-item-icon');
            if (iconImg) {
                iconImg.addEventListener('error', function() {
                    this.style.display = 'none';
                });
            }

            // 绑定编辑按钮
            const editBtn = itemEl.querySelector('.qa-edit-btn');
            editBtn.addEventListener('click', () => {
                this.handleEditQuickAccess(index, item);
            });

            // 绑定删除按钮
            const removeBtn = itemEl.querySelector('.qa-remove-btn');
            removeBtn.addEventListener('click', () => {
                this.handleRemoveQuickAccess(index);
            });

            // 绑定拖拽事件
            if (items.length > 1) {
                this.bindDragEvents(itemEl);
            }

            this.elements.qaList.appendChild(itemEl);
        });
    },

    /**
     * 绑定拖拽事件
     * @param {HTMLElement} itemEl - 列表项元素
     */
    bindDragEvents(itemEl) {
        const dragHandle = itemEl.querySelector('.qa-drag-handle');
        if (!dragHandle) return;

        // 拖拽开始
        dragHandle.addEventListener('dragstart', (e) => {
            this.draggedElement = itemEl;
            itemEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', itemEl.innerHTML);
        });

        // 拖拽结束
        dragHandle.addEventListener('dragend', () => {
            itemEl.classList.remove('dragging');
            // 移除所有占位符
            document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });
            this.draggedElement = null;
        });

        // 拖拽经过
        itemEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            if (this.draggedElement && this.draggedElement !== itemEl) {
                // 判断插入位置
                const rect = itemEl.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;

                if (e.clientY < midpoint) {
                    itemEl.classList.add('drag-over-top');
                    itemEl.classList.remove('drag-over-bottom');
                } else {
                    itemEl.classList.add('drag-over-bottom');
                    itemEl.classList.remove('drag-over-top');
                }
            }
        });

        // 离开拖拽区域
        itemEl.addEventListener('dragleave', () => {
            itemEl.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        // 放置
        itemEl.addEventListener('drop', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (this.draggedElement && this.draggedElement !== itemEl) {
                const fromIndex = parseInt(this.draggedElement.getAttribute('data-index'));
                const toIndex = parseInt(itemEl.getAttribute('data-index'));

                // 计算最终插入位置
                const rect = itemEl.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                let finalIndex;

                if (e.clientY < midpoint) {
                    // 拖拽到上半部分，插入到目标元素之前
                    finalIndex = toIndex;
                } else {
                    // 拖拽到下半部分，插入到目标元素之后
                    finalIndex = toIndex + 1;
                }

                // 如果源索引在目标索引之前，移除源元素后，后面的索引会减1
                if (fromIndex < finalIndex) {
                    finalIndex -= 1;
                }

                // 只有当位置真正改变时才更新
                if (fromIndex !== finalIndex) {
                    await QuickAccessModule.reorderItems(fromIndex, finalIndex);
                    await this.loadQuickAccessList();
                }
            }

            itemEl.classList.remove('drag-over-top', 'drag-over-bottom');
        });
    },

    /**
     * 处理添加快捷访问
     */
    async handleAddQuickAccess() {
        const title = this.elements.qaTitleInput.value.trim();
        const url = this.elements.qaUrlInput.value.trim();

        if (!title) {
            alert('请输入网站名称');
            return;
        }

        if (!url) {
            alert('请输入网站地址');
            return;
        }

        // 验证 URL
        try {
            new URL(url);
        } catch (e) {
            alert('请输入有效的网站地址（如：https://github.com）');
            return;
        }

        // 添加到快捷访问
        const success = await QuickAccessModule.addItem(title, url);
        if (success) {
            // 清空输入框
            this.elements.qaTitleInput.value = '';
            this.elements.qaUrlInput.value = '';

            // 重新加载列表
            await this.loadQuickAccessList();

            alert('添加成功');
        } else {
            alert('该网站已存在');
        }
    },

    /**
     * 处理删除快捷访问
     */
    async handleRemoveQuickAccess(index) {
        if (confirm('确定要删除这个快捷访问吗？')) {
            await QuickAccessModule.removeItem(index);
            await this.loadQuickAccessList();
        }
    },

    /**
     * 处理编辑快捷访问
     */
    handleEditQuickAccess(index, item) {
        // 移除所有现有的编辑表单
        const existingForms = this.elements.qaList.querySelectorAll('.qa-edit-form');
        existingForms.forEach(form => form.remove());

        // 找到对应的列表项
        const itemEl = this.elements.qaList.querySelector(`[data-index="${index}"]`);
        if (!itemEl) return;

        // 创建编辑表单
        const editForm = document.createElement('div');
        editForm.className = 'qa-edit-form';
        editForm.innerHTML = `
            <div class="qa-edit-form-content">
                <div class="qa-edit-form-row">
                    <label>网站名称</label>
                    <input type="text" class="input-text qa-edit-title" value="${item.title}" placeholder="网站名称">
                </div>
                <div class="qa-edit-form-row">
                    <label>网站地址</label>
                    <input type="text" class="input-text qa-edit-url" value="${item.url}" placeholder="网站地址">
                </div>
                <div class="qa-edit-form-actions">
                    <button class="btn btn-primary btn-small qa-save-btn">保存</button>
                    <button class="btn btn-secondary btn-small qa-cancel-btn">取消</button>
                </div>
            </div>
        `;

        // 插入编辑表单到列表项后面
        itemEl.insertAdjacentElement('afterend', editForm);

        // 绑定保存按钮
        const saveBtn = editForm.querySelector('.qa-save-btn');
        const titleInput = editForm.querySelector('.qa-edit-title');
        const urlInput = editForm.querySelector('.qa-edit-url');

        saveBtn.addEventListener('click', () => {
            this.handleUpdateQuickAccess(index, titleInput.value.trim(), urlInput.value.trim(), editForm);
        });

        // 绑定取消按钮
        const cancelBtn = editForm.querySelector('.qa-cancel-btn');
        cancelBtn.addEventListener('click', () => {
            editForm.remove();
        });

        // 聚焦到标题输入框
        titleInput.focus();
    },

    /**
     * 处理更新快捷访问
     */
    async handleUpdateQuickAccess(index, title, url, editForm) {
        if (!title) {
            alert('请输入网站名称');
            return;
        }

        if (!url) {
            alert('请输入网站地址');
            return;
        }

        // 验证 URL
        try {
            new URL(url);
        } catch (e) {
            alert('请输入有效的网站地址（如：https://github.com）');
            return;
        }

        // 更新快捷访问
        await QuickAccessModule.updateItem(index, { title, url });

        // 移除编辑表单
        editForm.remove();

        // 重新加载列表
        await this.loadQuickAccessList();

        alert('更新成功');
    },

    /**
     * 处理导出配置
     */
    async handleExportConfig() {
        try {
            // 获取所有配置
            const allConfig = await StorageManager.getAll();

            // 添加元数据
            const exportData = {
                version: '1.0',
                exportTime: new Date().toISOString(),
                exportDate: new Date().toLocaleString('zh-CN'),
                config: allConfig
            };

            // 生成 JSON 字符串
            const jsonString = JSON.stringify(exportData, null, 2);

            // 创建 Blob 对象
            const blob = new Blob([jsonString], { type: 'application/json' });

            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `newtab-config-${new Date().getTime()}.json`;

            // 触发下载
            document.body.appendChild(a);
            a.click();

            // 清理
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('配置已导出成功');
        } catch (error) {
            console.error('导出配置失败:', error);
            alert('导出配置失败，请重试');
        }
    },

    /**
     * 处理导入配置
     */
    async handleImportConfig(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (!file.name.endsWith('.json')) {
            alert('请选择 JSON 格式的配置文件');
            return;
        }

        try {
            // 读取文件内容
            const fileContent = await this.readFileAsText(file);

            // 解析 JSON
            const importData = JSON.parse(fileContent);

            // 验证数据格式
            if (!importData.config || typeof importData.config !== 'object') {
                alert('配置文件格式不正确');
                return;
            }

            // 确认导入
            const confirmMessage = importData.exportDate
                ? `确定要导入配置吗？\n\n导出时间：${importData.exportDate}\n\n导入后将覆盖当前所有设置。`
                : '确定要导入配置吗？\n\n导入后将覆盖当前所有设置。';

            if (!confirm(confirmMessage)) {
                // 清空文件选择
                e.target.value = '';
                return;
            }

            // 应用配置
            await StorageManager.setMultiple(importData.config);

            alert('配置已导入成功，页面即将刷新以应用新配置');

            // 清空文件选择
            e.target.value = '';

            // 关闭弹窗
            this.closeModal();

            // 刷新页面以应用新配置
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error('导入配置失败:', error);
            alert('导入配置失败，请检查文件格式是否正确');
            // 清空文件选择
            e.target.value = '';
        }
    },

    /**
     * 读取文件内容为文本
     * @param {File} file - 文件对象
     * @returns {Promise<string>} 文件内容
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
};
