<template>
    <v-carousel fullscreen :show-arrows="false" hide-delimiters cycle touchless
          height="100%">
      <v-carousel-item
          height="100%"
        v-for="image in images"
        :key="image"
        eager
        :transition="transition"
      >
        <v-sheet
          color="transparent"
          height="100%"
          tile
        >
          <v-row
            class="fill-height"
            align="center"
            justify="center"
          >
            <img v-bind:src="image" height="1080" width="1920"/>
          </v-row>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
</template>
<script>
export default {
    data: () => ({
        images: [
            require("../assets/img/splash/1.jpg"),
            require("../assets/img/splash/2.jpg"),
            require("../assets/img/splash/3.jpg"),
            require("../assets/img/splash/4.jpg"),
            require("../assets/img/splash/5.jpg"),
            require("../assets/img/splash/6.jpg"),
            require("../assets/img/splash/7.jpg")
        ],
        colors: [
        'primary',
        'secondary',
        'yellow darken-2',
        'red',
        'orange',
        ],
  }),
  computed: {
    transition() {
      if (this.$store.state.on_site)
        return "scroll-x-reverse-transition"
      else
        return "none"
    }
  }
}
</script>
