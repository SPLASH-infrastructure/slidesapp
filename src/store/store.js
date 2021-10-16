import Vue from 'vue';
import Vuex from 'vuex';
import { DateTime, Duration } from 'luxon';
const axios = require('axios');
const parseString = require('xml2js').parseString;

Vue.use(Vuex);

const PLAY_TYPES = {}
class Timeslot {
    constructor(xml_timeslot) {
        this.title = xml_timeslot.$.title
        this.people = []
        
        this.nominal_time = DateTime.fromISO(xml_timeslot.$.nominal_start)
        this.start_time = DateTime.fromISO(xml_timeslot.$.start)
        this.duration = Duration.fromMillis(parseFloat(xml_timeslot.$.duration) * 1000.0)
        this.event_id = xml_timeslot.$.event_id;
        this.is_mirror = xml_timeslot.$.is_mirror == "True"
        
        this.live = false
        
        const formats = []
        for (const source_el of xml_timeslot.sources) {
            for (const [source_type, source_obj] of Object.entries(source_el)) {
                formats.push(new PLAY_TYPES[source_type](source_obj))
            }
        }
        this.format = formats[0]
    }

    get end_time() {
        return this.start_time.plus(this.duration)
    }
}

class EventType {
    setState(router) {
        console.log(`routing to ${this.route()}`)
        router.replace(this.route())
    }
}
class EmptyEvent extends EventType {
    constructor() {
        super() 
        this.evt_type = "empty"
    }
    route() {
        return `/filler`
    }
}
class ZoomEvent extends EventType {
    constructor(xml_event) {
        super()
        this.evt_type = "zoom"
        this.url = xml_event[0]
    }
    route() {
        return `/filler/zoom/${encodeURIComponent(this.url)}/remaining`
    }
    get live() {
        return false;
    }
    get zoom() {
        return true;
    }
}
PLAY_TYPES["zoom"] = ZoomEvent
class RoomEvent extends EventType {
    constructor(xml_event) {
        super()
        this.evt_type = "room"
    }
    route() {
        return `/filler/remaining`;
    }
    get live() {
        return true;
    }
    get zoom() {
        return false;
    }
}
PLAY_TYPES["room"] = RoomEvent
class PrerecordedEvent extends EventType {
    constructor(xml_event) {
        super()
        this.evt_type = "recorded"
        this.asset = xml_event[0]
    }
    route() {
        return `/player/${this.asset}`
    }

    get live() {
        return false;
    }
}
PLAY_TYPES["asset"] = PrerecordedEvent

class Subevent {
    constructor(xml_subevent, room) {
        this.title = xml_subevent.$.title;
        this.track = xml_subevent.$.track;
        this.room = room;
        this.timeslots = xml_subevent.event.map(x=>new Timeslot(x));
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
      chair_evts: undefined,
      config_loaded: false,
      ready: false,
      room: undefined,

      on_site: false,

      current_format: new EmptyEvent(),

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
        setRoom(state, room) {
            state.room = room
        },
        setOnSite(state, is_onsite) {
            state.on_site = is_onsite
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
            if (ts)
                state.current_format = ts.format;
            else if (state.current_format.evt_type != "empty")
                state.current_format = new EmptyEvent()
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
            function offset(evts) {
                const first_time = DateTime.min(...evts.filter(evt=>evt.has_events).map(evt=>evt.starting_time));
                const delay = DateTime.now().diff(first_time);
                for (const evt of evts) {
                    for (const ts of evt.timeslots) {
                        ts.start_time = ts.start_time.plus(delay);
                    }
                }
            }
            axios.get("/chair.xml").then((response) => {
                parseString(response.data, (err, result) => {
                    const rooms = {}
                    for (const room of result.conference.room) {
                        const roomname = room.$.name
                        const subevents = []
                        for (const session of room.session) {
                            subevents.push(new Subevent(session, roomname))
                        }
                        offset(subevents)
                        rooms[roomname] = subevents
                    }
                    context.commit("setEventData", rooms)
                })
            })
        },
        checkSchedule({ commit, state }) {
            if (!state.events || !state.room) return;
            let now = null;
            let next = null;
            for (const evt of state.events[state.room]) {
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
        ready: (state) => {
            return state.chair_data != undefined && state.config_loaded
        },
        video_head_pos: (state) => (video_file) => {
            return (video_file in state.video_head_positions) ? state.video_head_positions[video_file] : 0;
        }
    }
})