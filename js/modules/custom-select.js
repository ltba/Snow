/**
 * 自定义下拉选择组件模块
 * 提供完全自定义的下拉选择功能，替代原生 select
 */

const CustomSelectModule = {
    selects: [],

    /**
     * 初始化所有自定义 select
     */
    init() {
        // 查找所有自定义 select 元素
        const selectElements = document.querySelectorAll('.custom-select');

        selectElements.forEach(selectEl => {
            this.initSelect(selectEl);
        });

        // 点击外部关闭所有下拉框
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select')) {
                this.closeAll();
            }
        });

        // ESC 键关闭所有下拉框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });

        console.log('自定义 Select 模块初始化完成');
    },

    /**
     * 初始化单个 select
     */
    initSelect(selectEl) {
        const trigger = selectEl.querySelector('.custom-select-trigger');
        const options = selectEl.querySelectorAll('.custom-select-option');
        const valueEl = trigger.querySelector('.custom-select-value');

        // 存储 select 实例
        const selectInstance = {
            element: selectEl,
            trigger: trigger,
            options: options,
            value: selectEl.dataset.value || '',
            onChange: null
        };

        this.selects.push(selectInstance);

        // 点击触发器切换下拉框
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle(selectEl);
        });

        // 键盘导航
        trigger.addEventListener('keydown', (e) => {
            this.handleKeyboard(e, selectEl);
        });

        // 选项点击事件
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectOption(selectEl, option);
            });
        });

        // 设置初始选中项
        const selectedOption = selectEl.querySelector('.custom-select-option.selected');
        if (selectedOption) {
            this.updateValue(selectEl, selectedOption);
        }
    },

    /**
     * 切换下拉框显示/隐藏
     */
    toggle(selectEl) {
        const isActive = selectEl.classList.contains('active');

        // 关闭所有其他下拉框
        this.closeAll();

        // 切换当前下拉框
        if (!isActive) {
            selectEl.classList.add('active');
            selectEl.querySelector('.custom-select-trigger').focus();
        }
    },

    /**
     * 关闭所有下拉框
     */
    closeAll() {
        this.selects.forEach(select => {
            select.element.classList.remove('active');
        });
    },

    /**
     * 选择选项
     */
    selectOption(selectEl, optionEl) {
        const value = optionEl.dataset.value;
        const text = optionEl.textContent.trim();

        // 更新选中状态
        selectEl.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        optionEl.classList.add('selected');

        // 更新显示值
        this.updateValue(selectEl, optionEl);

        // 更新 data-value
        selectEl.dataset.value = value;

        // 关闭下拉框
        selectEl.classList.remove('active');

        // 触发 change 事件
        const selectInstance = this.selects.find(s => s.element === selectEl);
        if (selectInstance) {
            selectInstance.value = value;

            // 触发自定义事件
            const event = new CustomEvent('customSelectChange', {
                detail: { value, text }
            });
            selectEl.dispatchEvent(event);

            // 如果有回调函数，执行它
            if (selectInstance.onChange) {
                selectInstance.onChange(value, text);
            }
        }
    },

    /**
     * 更新显示值
     */
    updateValue(selectEl, optionEl) {
        const valueEl = selectEl.querySelector('.custom-select-value');
        if (valueEl) {
            valueEl.textContent = optionEl.textContent.trim();
        }
    },

    /**
     * 键盘导航处理
     */
    handleKeyboard(e, selectEl) {
        const isOpen = selectEl.classList.contains('active');
        const options = Array.from(selectEl.querySelectorAll('.custom-select-option'));
        const selectedIndex = options.findIndex(opt => opt.classList.contains('selected'));

        switch(e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!isOpen) {
                    this.toggle(selectEl);
                } else if (selectedIndex >= 0) {
                    this.selectOption(selectEl, options[selectedIndex]);
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    this.toggle(selectEl);
                } else {
                    const nextIndex = Math.min(selectedIndex + 1, options.length - 1);
                    this.selectOption(selectEl, options[nextIndex]);
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (isOpen) {
                    const prevIndex = Math.max(selectedIndex - 1, 0);
                    this.selectOption(selectEl, options[prevIndex]);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.closeAll();
                break;
        }
    },

    /**
     * 获取 select 的值
     */
    getValue(selectEl) {
        return selectEl.dataset.value || '';
    },

    /**
     * 设置 select 的值
     */
    setValue(selectEl, value) {
        const option = selectEl.querySelector(`.custom-select-option[data-value="${value}"]`);
        if (option) {
            this.selectOption(selectEl, option);
        }
    },

    /**
     * 设置 change 回调
     */
    onChange(selectEl, callback) {
        const selectInstance = this.selects.find(s => s.element === selectEl);
        if (selectInstance) {
            selectInstance.onChange = callback;
        }
    },

    /**
     * 禁用/启用 select
     */
    setDisabled(selectEl, disabled) {
        if (disabled) {
            selectEl.classList.add('disabled');
        } else {
            selectEl.classList.remove('disabled');
        }
    }
};
