<template>
    <div class="sponsors-container">
        <img class="sponsors-img" src="@/assets/img/sponsors/facebook.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/trim-aws.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/futurewei.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/trim-google.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/tweag.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/ibm.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/oracle.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/uber.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/acm.png"/>
        <img class="sponsors-img" src="@/assets/img/sponsors/isu.jpg"/>
    </div>
</template>
<style scoped>
.sponsors-container {
    position: absolute; 
    display: inline-block; 
    padding-top: 1em; 
    color: black; 
    background-color: white;
    height: 108px;
    left: 0; 
    right: 0; 
    bottom: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    justify-content: space-evenly;
}

.sponsors-container > img {
    max-height: 40px;
    max-width: 120px;
}
</style>
