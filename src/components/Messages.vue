<template>
    <div class="message-holder">
        <div class="time-remaining" v-bind:class="{ hideRemaining: hideRemaining }">
            <span id="remaining-number">{{remaining_number}}</span><br>
            <span id="minutes-text">{{remaining_units}} remaining</span>
        </div>
    </div>
</template>
<script>

export default {
    computed: {
        time_remaining() {
            if (!this.$store.state.current_timeslot) return null;
            return (this.$store.state.current_timeslot.end_time.diff(this.$store.state.now)).shiftTo('minutes', 'seconds');
        },
        remaining_number() {
            if (!this.$store.state.ready) return "";
            let breaks = [5, 10, 15, 30, 60, 90];
            let remaining = this.time_remaining;
            if (!remaining) return "";
            let shown_remaining = Math.min(...breaks.filter(brk=>brk > remaining.minutes))
            if (!isFinite(shown_remaining)) {
                if (remaining.minutes > 0)
                    shown_remaining = Math.ceil(remaining.minutes / 30) * 30;
                else
                    shown_remaining = remaining.seconds;
            }
            return `< ${shown_remaining}`;
        },
        remaining_units() {
            if (!this.$store.state.ready) return "";
            let remaining = this.time_remaining;
            if (!remaining) return "";
            if (remaining.minutes > 0) return "minutes";
            return "seconds";
        },
        hideRemaining() {
            if (!this.$store.state.ready) return true;
            if (!this.$store.state.current_timeslot) return true;
            return false;
        }
    }
}
</script>

<style>
#remaining-number {
    color: white;
    font-size: 120pt;
}
.hideRemaining {
    display: none;
}
.message {
    color: white;
    background: rgba(0, 0, 255, 0.8);
    font-size: 50px;
    margin: 10px;
}
.time-remaining {
    text-align: center;
    color: white;
    background: rgba(0, 0, 0, 0.4);
    font-size: 50px;
    margin: 10px;
}
</style>