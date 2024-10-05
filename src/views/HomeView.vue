<script setup lang="ts">
// import VideoPlayer from '@/components/VideoPlayer.vue';
import { ref, onMounted } from 'vue'
import Hls from 'hls.js';

const video1 = import.meta.env.VITE_APP__VIDEO_PATH_1
const video2 = import.meta.env.VITE_APP__VIDEO_PATH_2

const videoPlayer = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  const video = videoPlayer.value!;
  const hls = new Hls();
  const hlsSrc = video2

  if (Hls.isSupported()) {
    hls.loadSource(hlsSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // This handles Safari which has native HLS support
    video.src = hlsSrc;
  }

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.play();
  });
});
</script>

<template>
   <div class="video">
     <div class="video__wrapper">
      <!-- <VideoPlayer :video-url="video2"/> -->
      <vue-plyr ref="player" :options="{ controls: ['play', 'progress', 'volume', 'fullscreen'] }">
        <video ref="videoPlayer" playsinline controls></video>
      </vue-plyr>
     </div>
   </div>
</template>


<style lang="scss">
.video {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &__wrapper {
    width: 100%;
    height: 100%;
  }
}
</style>
