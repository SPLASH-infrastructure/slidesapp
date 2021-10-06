<template>
    <div class="next-container">
        <div class="nextup-div">
            <span class="text-h2" id="next"><span class="next-text">{{event_desc}}</span> {{next_event_title}}</span>
            <!--<div class="timeline-holder" id="timeline"/>-->
            <img id="logo-bean" src="@/assets/img/logo.png"/>
        </div>  
        <div class="sep-bar"/>
    </div>
</template>
<script>
import * as d3 from "d3"

export default {
    data() {
        return {
            total_time: 90,
            svg: undefined,
            scale: undefined,
            axis: undefined,
            ticks: undefined,
            bar: undefined
        }
    },
    mounted() {
        this.setup_plot();
        this.generateTimeline();
        this.$store.watch(x => x.now, () => this.generateTimeline())
    },
    computed : {
        event_desc: function() {
            if (this.$store.state.current_event) return "NOW:";
            else if (this.$store.state.next_event) return "NEXT:";
            else return "";
        },
        next_event_title: function() {
            if (this.$store.state.current_event) return this.$store.state.current_event.title;
            else if (this.$store.state.next_event) return this.$store.state.next_event.title;
            else return "";
        }

    },
    methods : {
        tick_formatter(x) {
            let val = x-1
            if ((val % 5 == 0 && val <= 20) || 
                (val % 10 == 0 && val <= 40) || 
                (val % 20 == 0 && val <= 75) || 
                val == this.total_time) {
                return d3.format(",.0f")(val)
            } else {
                return "";
            }
        },
        setup_plot() {
            /*
            this.svg = d3.select("#timeline").append("svg").attr("width", 1500).attr("height", 200);
            this.scale = d3.scaleLog().domain([1, this.total_time+1]).range([1400-10,10]);
            this.axis = d3.axisBottom(this.scale)
                .tickValues([...Array(91).keys()].map(x=>x+1))
                .tickFormat(this.tick_formatter);
            this.ticks = this.svg.append("g").attr("class", "axis")
                                 .attr("transform", "translate(0," + 20 + ")")
                                 .style("font", "16px roboto")
                                 .call(this.axis).translate;
            this.bar = this.svg.append("rect")
                .attr("x", this.scale(this.time_remaining+1))
                .attr("y", 0)
                .attr("width", 1400-10-this.scale(this.time_remaining+1))
                .attr("height", 20)
                .style("fill", "white");
                */
        },
        generateTimeline() {
            if (!this.$store.state.ready) {
                // hide the bar
                return
            }
            /*
            let time_remaining = next_event.starting_time.diff(this.$store.state.now).shiftTo('minutes')
            let minutes_remaining = time_remaining.minutes
            if (minutes_remaining > this.total_time)
                minutes_remaining = this.total_time;
            if (isNaN(minutes_remaining)) {
                console.log("NAAAN")
            }
            this.bar.attr("x", this.scale(minutes_remaining+1))
                    .attr("width", 1400-10-this.scale(minutes_remaining+1));
                    */
        }
    }
}
</script>
<style scoped>
#next {
    font-size: 23pt !important;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif !important;
    color: black;
}
#logo-bean {
    height: 72px;
    width: 124px;
}
.next-text {
    font-size: 32pt !important;
    letter-spacing: 0.3em;
    position: relative;
    top: 2px;
}
.nextup-div {
    background-color: white;
    height: 120px;
    display: flex;
    justify-content: space-between;
    align-content: center;
    align-items: center;
    padding: 0 4em 0 4em;
    flex-direction: row;
    width: 100%;
}
.timeline-holder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.sep-bar {
    height: 60px;
    width: 100%;
    background-color: #2BC1B0;
}
</style>
