<template>
  <div id="video-container">
    <video ref="videoplayer"  class="video-js" >
    </video>
  </div>
</template>
<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
export default {
  data() {
    return {
        ready: false,
        player: null,
        options: {
            autoplay: true,
            controls: true,
            sources: [ { src: "edit.mp4", type: "video/mp4" } ]
        }
    }
  },
  computed: {
    playerobj () {
      return this.ready ? this.$refs.videoplayer : null
    }
  },
  watch: {
    $route(to, from) {
      this.player.src({type:'video/mp4', src:this.$store.state.video_file});
      this.player.currentTime(0);
      this.player.play();
    }
  },
  mounted() {
    const store = this.$store;
    const router = this.$router;
    const player = this.player = videojs(this.$refs.videoplayer, this.options, function onPlayerReady() {
        player.muted(true);
        player.src({type:'video/mp4', src:store.state.video_file});
        player.currentTime(store.getters.video_head_pos(store.state.video_file));
        player.play();
        console.log(`playing ${store.state.video_file}`)
    })
    player.on("ended", () => router.push(`/filler`))
    var Button = videojs.getComponent('Button');
    var closeButton = videojs.extend(Button, {
      constructor: function() {
        Button.apply(this, arguments);
        this.el_.innerText = "✖"
      },
      handleClick: function() {
        router.push(`/filler/remaining`);
      }
    });
    videojs.registerComponent('closeButton', closeButton);

    player.getChild('controlBar').addChild('closeButton', {});
    this.$store.watch(store=>store.video_file, () => {
      if (this.ready) {
        player.src({type:'video/mp4', src:store.state.video_file});
        player.pause();
        console.log(`restoring time ${store.getters.video_head_pos(store.state.video_file)}`)
        player.setCurrentTime(store.getters.video_head_pos(store.state.video_file));
        player.play();
      }})
  },
    beforeDestroy() {
      if (this.player) {
        let currentTime = this.player.currentTime();
        let currentFile = this.$store.state.video_file;
        if (currentTime < this.player.duration()) {
          this.$store.commit("saveVideoStatus", {video_file: currentFile, video_time: currentTime});
        } else {
          this.$store.commit("saveVideoStatus", {video_file: currentFile, video_time: 0});
        }
        this.player.dispose()
      }
    }
}
</script>
<style scoped>
.video-js {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>