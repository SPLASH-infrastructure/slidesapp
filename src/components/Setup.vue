<template>
    <div></div>
</template>
<script>
export default {
    created() {
        this.$store.commit("setRoom", this.$route.params.room_name)
        this.$store.commit("setOnSite", this.$route.params.mode == "onsite")
        this.$router.push("/filler");
    }
}
</script>