/**
 * 时间模块 - 处理时间显示相关功能
 */

const TimeModule = {
    timeElement: null,
    dateElement: null,
    intervalId: null,

    /**
     * 初始化时间模块
     */
    init() {
        this.timeElement = document.getElementById('time');
        this.dateElement = document.getElementById('date');

        if (this.timeElement && this.dateElement) {
            this.updateTime();
            this.intervalId = setInterval(() => this.updateTime(), 1000);
        }
    },

    /**
     * 更新时间显示
     */
    updateTime() {
        const now = new Date();

        // 格式化时间（HH:MM）
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        this.timeElement.textContent = `${hours}:${minutes}`;

        // 格式化日期
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[now.getDay()];

        this.dateElement.textContent = `${year}年${month}月${date}日 ${weekday}`;
    },

    /**
     * 销毁时间模块
     */
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};
