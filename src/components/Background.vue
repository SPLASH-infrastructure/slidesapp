<template>
    <v-carousel fullscreen :show-arrows="false" hide-delimiters cycle touchless
          height="100%">
      <v-carousel-item
          height="100%"
        v-for="image in images"
        :key="image"
        eager
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
            <img v-bind:src="image"/>
          </v-row>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
</template>
<script>
export default {
    data: () => ({
        images: [
            require("../assets/img/backgrounds/1080/breakfast-in-chicago.png"),
            require("../assets/img/backgrounds/1080/breakfast-in-paris.png"),
            require("../assets/img/backgrounds/1080/breakfast-in-seattle.png")
        ],
        colors: [
        'primary',
        'secondary',
        'yellow darken-2',
        'red',
        'orange',
        ],
  }),
}
</script>
