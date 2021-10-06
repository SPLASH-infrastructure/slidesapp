import Vue from 'vue';
import Vuex from 'vuex';
import { DateTime, Duration } from 'luxon';
const axios = require('axios');
const parseString = require('xml2js').parseString;

Vue.use(Vuex);

class Timeslot {
    constructor(xml_timeslot, tz_name) {
        const tz_obj = { zone: tz_name }
        this.title = xml_timeslot.title[0]
        if (xml_timeslot.persons)
            this.people = xml_timeslot.persons[0].person
        else 
            this.people = []
        this.start_time = DateTime.fromFormat(`${xml_timeslot.date} ${xml_timeslot.start_time}`, "yyyy/MM/dd hh:mm", tz_obj)
        this.end_time = DateTime.fromFormat(`${xml_timeslot.end_date} ${xml_timeslot.end_time}`, "yyyy/MM/dd hh:mm", tz_obj)
        
        let badges = xml_timeslot.badges;
        this.live = false;
        if (badges !== undefined) {
            for (const badge of badges[0].badge) {
                if (badge.$ && badge.$.property && badge.$.property == "Event Form") this.live = badge._ == "Mixed"
            }
        }
    }

}
class Subevent {
    constructor(xml_subevent, tz_id) {
        this.title = xml_subevent.title[0]
        this.track = xml_subevent.tracks[0]
        this.timeslots = xml_subevent.timeslot
                        .filter(x=>typeof x.event_id !== 'undefined')
                        .filter(x=>typeof x.start_time !== 'undefined').map(x=>new Timeslot(x, tz_id));
    }
    get starting_time() {
        return DateTime.min(...this.timeslots.map(x=>x.start_time));
    }
    get ending_time() {
        return DateTime.max(...this.timeslots.map(x=>x.end_time));
    }
    get has_events() {
        return this.timeslots.length > 0;
    }
}

export default new Vuex.Store({
    state: {
      count: 0,
      events: undefined,
      ready: false,
      room: "Swissotel Chicago | Zurich A",
      on_site: true,
      video_active: false,
      video_file: null,
      video_head_positions: {},
      last_video_update: DateTime.now,
      now: DateTime.now()
    },
    mutations: {
        setEventData(state, data) {
            state.events = data;
            state.ready = true;
        },
        updateTime(state) {
            state.now = state.now.plus(Duration.fromObject({ seconds: 5 })); // DateTime.now(); //
        },
        playVideo(state, video_file) {
            state.video_active = true;
            state.video_file = video_file;
        },
        saveVideoStatus(state, video_info) {
            state.video_head_positions[video_info.video_file] = video_info.video_time;
        }
    },
    actions: {
        loadXML(context) {
            axios.get('/schedule.xml').then((response) => {
                // handle success
                parseString(response.data, (err, result) => {
                    function offset(evts) {
                        const first_time = DateTime.min(...evts.filter(evt=>evt.has_events).map(evt=>evt.starting_time));
                        const delay = DateTime.now().diff(first_time);
                        for (const evt of evts) {
                            for (const ts of evt.timeslots) {
                                ts.start_time = ts.start_time.plus(delay);
                                ts.end_time = ts.end_time.plus(delay);
                            }
                        }
                    }
                    if(err) {
                        //Do something
                    } else {
                        const parsed = result.event.subevent
                            .filter(x=>x.room == this.state.room)
                            .map(x=>new Subevent(x, result.event.timezone_id[0]))
                        offset(parsed);
                        context.commit('setEventData', parsed)
                    }
                });
            });
        },
        checkSchedule({ getters, commit, state }) {
            if (!state.events) return;
            let next_or_now = getters.next_or_now_event(state.now);
            if (next_or_now == null) return;
            if (!state.on_site) return;
            for (const ts of next_or_now.timeslots) {
                if (ts.start_time > state.last_video_update && ts.start_time < state.now) {
                    commit("playVideo", "edit.mp4")
                    break;
                }
            }
            state.last_video_update = state.now;
        }
    },
    getters: {
        video_head_pos: (state) => (video_file) => {
            return (video_file in state.video_head_positions) ? state.video_head_positions[video_file] : 0;
        },
        next_event: (state) => (date) => {
            let next = null;
            if (!state.events) return null;
            for (const evt of state.events) {
                if (!evt.has_events) continue;
                if (next == null && date < evt.starting_time) next = evt;
                if (next && date < evt.starting_time && evt.starting_time < next.starting_time) next = evt;
            }
            return next;
        },
        next_or_now_event: (state) => (date)  => {
            let next = null;
            if (!state.events) return null;
            for (const evt of state.events) {
                if (!evt.has_events) continue;
                if (next == null && date < evt.ending_time) next = evt;
                if (next && date < evt.ending_time && evt.ending_time <= next.ending_time) next = evt;
            }
            return next;
        },
        next_or_now_timeslot: (state, getters) => (date)  => {
            let next_session = getters.next_or_now_event(date);
            let next = null;
            if (next_session == null) return null;
            for (const ts of next_session.timeslots) {
                if (next == null && date < ts.end_time) next = ts;
                if (next && date < ts.end_time && ts.end_time < next.end_time) next = ts;
                
            }
            return next;
        },
    }
})