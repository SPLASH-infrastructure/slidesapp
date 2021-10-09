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
        this.event_id = xml_timeslot.event_id;
        this.remote = false;
        
        let badges = xml_timeslot.badges;
        this.live = false;
        if (badges !== undefined) {
            for (const badge of badges[0].badge) {
                if (badge.$ && badge.$.property && badge.$.property == "Event Form") {
                    this.live = (badge._ == "In-Person") || (badge._ == "Mixed")
                }
            }
        }
    }

}
class Subevent {
    constructor(xml_subevent, tz_id) {
        this.title = xml_subevent.title[0];
        this.track = xml_subevent.tracks[0];
        this.room = xml_subevent.room;
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
      video_file: "edit.mp4",
      video_head_positions: {},
      current_event: null,
      next_event: null,
      current_timeslot: null,
      last_schedule_update: DateTime.now,
      now: DateTime.now()
    },
    mutations: {
        setEventData(state, data) {
            state.events = data;
            state.ready = true;
        },
        setCurrentEvent(state, event) {
            if (event != state.current_event) // don't update if it's the same
                state.current_event = event;
        },
        setNextEvent(state, event) {
            if (event != state.next_event) // don't update if it's the same
                state.next_event = event;
        },
        setCurrentTimeslot(state, ts) {
            state.current_timeslot = ts;
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
                            .map(x=>new Subevent(x, result.event.timezone_id[0]))
                        offset(parsed);
                        context.commit('setEventData', parsed)
                    }
                });
            });
        },
        checkSchedule({ commit, state }) {
            if (!state.events) return;
            let now = null;
            let next = null;
            for (const evt of state.events.filter(x=>x.room == state.room)) {
                if (!evt.has_events) continue;
                if (evt.starting_time <= state.now && state.now < evt.ending_time) {
                    now = evt;
                }
                if (evt.starting_time >= state.now && (next == null || evt.starting_time < next.starting_time)) {
                    next = evt;
                }
            }
            commit('setCurrentEvent', now);
            commit('setNextEvent', next);
            if (now == null) {
                commit('setCurrentTimeslot', null); 
            } else {
                for (const ts of now.timeslots) {
                    if (ts.start_time <= state.now && state.now < ts.end_time) {
                        commit('setCurrentTimeslot', ts);
                        break;
                    }
                }
            }
            state.last_schedule_update = state.now;
        }
    },
    getters: {
        video_head_pos: (state) => (video_file) => {
            return (video_file in state.video_head_positions) ? state.video_head_positions[video_file] : 0;
        }
    }
})