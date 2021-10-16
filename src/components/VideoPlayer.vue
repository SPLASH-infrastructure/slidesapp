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
            sources: [  ]
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
      this.player.src({type:'video/mp4', src:this.getCurrentVideo()});
      this.player.currentTime(0);
      this.player.play();
    }
  },
  methods: {
    getCurrentVideo() {
      return "videos/" + this.$store.state.current_format.asset + ".mp4"
    }
  },
  mounted() {
    if (!this.$store.state.on_site) this.$router.replace("/filler");
    const self = this;
    const store = this.$store;
    const router = this.$router;
    const player = this.player = videojs(this.$refs.videoplayer, this.options, function onPlayerReady() {
        player.muted(true);
        const video_file = self.getCurrentVideo()
        player.src({type:'video/mp4', src:video_file});
        player.currentTime(store.getters.video_head_pos(video_file));
        player.play();
        console.log(`playing ${video_file}`)
    })
    player.on("error", async (args) => {
      console.log("error with args", args)
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push(`/filler/remaining`)
    })
    player.on("ended", () => router.push(`/filler/remaining`))
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
        const video_file = this.getCurrentVideo()
        player.src({type:'video/mp4', src:video_file});
        player.pause();
        player.setCurrentTime(store.getters.video_head_pos(video_file));
        player.play();
      }})
  },
    beforeDestroy() {
      if (this.player) {
        const video_file = this.getCurrentVideo()
        let currentTime = this.player.currentTime();
        let currentFile = video_file;
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