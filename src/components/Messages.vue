<template>
    <div class="message-holder">
        Hello World from the Messages Section!
        {{minutes_remaining}}
    </div>
</template>
<script>
import { DateTime } from 'luxon';

export default {
    computed: {
        minutes_remaining() {
            let remaining = (this.$store.getters.next_or_now_timeslot(this.$store.state.now).end_time.diff(DateTime.now())).shiftTo('minutes', 'seconds');
            return remaining.minutes
        }
    }
}
</script>

<style>
.message-holder {
    color: white;
}
</style>