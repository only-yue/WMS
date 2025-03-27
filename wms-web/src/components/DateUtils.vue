<template>
    <div class="date-utils-container">
        <div class="date-section">
            <i class="el-icon-date"></i>
            <span class="date">{{ nowTime }}</span>
        </div>
        <div class="time-section">
            <span class="hour">{{time.hour}}</span>
            <a class="split">:</a>
            <span class="minute">{{time.minitus}}</span>
            <a class="split">:</a>
            <span class="second">{{time.seconds}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "DateUtils",
        props: ["s"],
        data() {
            return {
                time: {
                    hour: "",
                    minitus: "",
                    seconds: ""
                },
                nowTime: "",
                week: [
                    "星期天",
                    "星期一",
                    "星期二",
                    "星期三",
                    "星期四",
                    "星期五",
                    "星期六"
                ]
            };
        },
        mounted() {
            this.dateTime();
        },
        methods: {
            dateTime() {
                this.timeFormate();
                setTimeout(() => {
                    this.dateTime();
                }, 1000);
            },
            timeFormate() {
                const newtime = new Date();
                this.time.hour = this.getIncrease(newtime.getHours(), 2);
                this.time.minitus = this.getIncrease(newtime.getMinutes(), 2);
                this.time.seconds = this.getIncrease(newtime.getSeconds(), 2);
                this.nowTime =
                    this.getIncrease(newtime.getFullYear(), 4) +
                    "年" +
                    this.getIncrease(newtime.getMonth() + 1, 2) +
                    "月" +
                    this.getIncrease(newtime.getDate(), 2) +
                    "日 " +
                    this.week[newtime.getDay()];
            },
            getIncrease(num, digit) {
                var increase = "";
                for (var i = 0; i < digit; i++) {
                    increase += "0";
                }
                return (increase + num).slice(-digit);
            }
        }
    }
</script>

<style scoped>
    .date-utils-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        border-radius: 6px;
        background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
    
    .date-section {
        margin-bottom: 8px;
        color: #303133;
        font-size: 16px;
        display: flex;
        align-items: center;
    }
    
    .date-section i {
        margin-right: 8px;
        color: #409EFF;
    }
    
    .time-section {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        font-family: 'Courier New', monospace;
    }
    
    .hour, .minute, .second {
        width: 40px;
        display: inline-block;
        text-align: center;
    }
    
    .split {
        animation: shark 1s step-end infinite;
        vertical-align: center;
        margin: 0 4px;
        color: #409EFF;
    }
    
    @keyframes shark {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
    }
</style>