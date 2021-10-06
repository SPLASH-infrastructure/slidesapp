<template>
    <FullCalendar id="fullcal" ref="calendar" :options="calendarOptions" />
</template>
<script>
import '@fullcalendar/core/vdom' // solves problem with Vite
import FullCalendar from '@fullcalendar/vue'
import listPlugin from '@fullcalendar/list';
import { DateTime } from 'luxon';

export default {
  components: {
    FullCalendar // make the <FullCalendar> tag available
  },
  computed: {
    cal () {
      return this.ready ? this.$refs.calendar : null
    }
  },
  data() {
    let store = this.$store;
    return {
      ready: false,
      last_event: null,
      last_update: null,
      calendarOptions: {
        plugins: [ listPlugin ],
        headerToolbar: {start: '', end: ''},
        initialView: 'listDay',
        nowIndicator: true,
        slotMinTime: "00:00:00",
        slotMaxTime: '36:00:00',
        dayHeaders: false,
        listDayFormat: false,
        events: [], 
        eventTimeFormat: function (time) {
          return DateTime.fromJSDate(time.start.marker).toFormat("h:mm");
        },
        eventClick: function (info) {
          store.commit('playVideo', info.event.extendedProps.video_file);
        }
      }
    }
  },
  created() {
    this.$store.watch(x=>x.events, this.calUpdate)
    this.$store.watch(x=>x.now, this.calUpdate)
  },
  mounted () {
    this.ready = true;
  },
  methods: {
    updateTime() {
      let day_start = this.$store.state.now.startOf("day");
      this.cal.getApi().gotoDate(day_start.toJSDate());
      /*et viewport_start = now.diff(day_start);
      this.cal.getApi().scrollToTime(viewport_start.milliseconds);*/
    },
    calUpdate() {
      if (!this.ready || !this.$store) return;
      const newEvts = [];
      let next_event = this.$store.getters.next_or_now_event(this.$store.state.now);
      if (next_event == this.last_event && 
        (this.calendarOptions.events.find(x=>x.end < this.$store.state.now.toJSDate()) === undefined || this.last_update > next_event.starting_time)) return;
      if (next_event == null) {
        this.calendarOptions.events = [];
        return;
      }
      if (!this.cal) return;
      //newEvts.push({ title: evt.title, start: evt.starting_time.toJSDate(), end: evt.ending_time.toJSDate()});
      let vidnum = 1;
      let vids = ["edit.mp4", "edit2.mp4"];
      for (const ts of next_event.timeslots) {
        if (ts.end_time < this.$store.state.now) {
          continue;
        }
        let vid = vids[vidnum++ % vids.length]
        let classes = ["timeslot-background"]
        if (ts.live) {
          classes.push("live-event");
        } 
        console.log("update")
        if (ts.start_time < this.$store.state.now && this.$store.state.now < ts.end_time) {
          classes.push("current-event");
        } else {
          classes.push("upcoming-event")
        }
        newEvts.push({ 
          title: ts.title, 
          start: ts.start_time.toJSDate(), 
          end: ts.end_time.toJSDate(), 
          classNames: classes,
          video_file: vid});
      }
      this.cal.getApi().gotoDate(next_event.starting_time.toJSDate());
      this.last_event = next_event;
      this.last_update = this.$store.state.now;
      this.calendarOptions.events = newEvts;
    },
  },
}
</script>

<style scss>
/*
.fc-day-today {
  background: rgba(255, 255, 255, 0.0) !important;
}
.fc-timegrid-slot {
    height: 6em !important; 
    border-bottom: 0 !important;
}
.fc-timegrid-slot-label {
  color: white !important;
  background-image: linear-gradient(to right, rgba(0,0,0,0.0), rgba(0,0,0,0.5)) !important;
  vertical-align: top !important;
}
.fc-header-toolbar {
  display: none !important;
}
.fc-timegrid-axis, .fc-col-header-cell {
  background-color: rgba(0,0,0,0.5) !important;
  border-bottom: 1px solid white !important;
  text-align: left !important;
}
.fc-timegrid-axis {
  background-color: hsla(0, 0%, 20%, 0.5);
}
.fc-col-header-cell-cushion  {
  color: white !important;
}
.fc-theme-standard td {
}
td .fc-timegrid-slot-lane {
  border-top: 2px solid !important;
  background-image: linear-gradient(to left, rgba(0,0,0,0.0), 60%, rgba(0,0,0,0.5)) !important;
  border-image: linear-gradient( to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.0) ) !important;
  border-image-slice: 1 0 1 0 !important;
}
.fc .fc-timegrid-slot-lane.fc-timegrid-slot-minor {
  border-top: 2px solid !important;
  bborder-image: linear-gradient( to right, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.0) ) !important;
  border-image-slice: 1 0 1 0 !important;
}
td .fc-timegrid-slot-label {
  border-top: 2px solid !important;
  border-image: linear-gradient( to right, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.8) ) !important;
  border-image-slice: 1 0 1 0 !important;
}
.fc .fc-timegrid-slot-label.fc-timegrid-slot-minor {
  border-top: 2px solid !important;
  border-image: linear-gradient( to right, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.4) ) !important;
  border-image-slice: 1 0 1 0 !important;
}
.fc table {
  border-collapse: initial !important;
}
.fc-theme-standard .fc-scrollgrid {
  border: none;
}
.fc-theme-standard td, .fc-theme-standard th {
  border: none;
}
.fc-scroller {
  overflow: hidden !important;
}
.fc-timegrid-event {
  border-radius: 0;
}
.timeslot-background.fc-v-event {
  background-color: #D88130;
  border-color: #D88130;
}
*/
.fc table {
  border-collapse: separate !important;
}
.fc-list-event {
  font-size: 20pt !important;
  font-weight: 400;
  font-family: 'Montserrat', sans-serif !important;
}
.fc-list-event::before { 
  display: table-cell;
  background-size: 60px 50px;
  width: 60px; 
  height: 50px;
  content: "";
}
.fc-list-event-graphic {
  display: none;
}
.upcoming-event > .fc-list-event-title {
  background-color: #a9e1da;
}
.current-event > .fc-list-event-title {
  background-color: #2BC1B0;
}
.fc-list-event-time {
  text-align: center;
}
.fc-theme-standard .fc-scrollgrid {
  border: none;
}
.fc-theme-standard td, .fc-theme-standard th {
  border: none;
}
tr.fc-list-event > td {
  padding-top: 4px;
}
.fc-list-day {
  display: none;
}
table.fc-list-table {
  border-spacing: 0 0.5em;
  padding-left: 80px;
}
.fc-theme-standard .fc-list {
  border: none !important;
}
.live-event::before {
  background-image: url("~@/assets/live.svg");
  display: table-cell;
  background-size: 60px 50px;
  width: 60px; 
  height: 50px;
  font-weight: 800;
  content: "";
  color: #BE1622;
  background-position: 0px 5px;
}
</style>