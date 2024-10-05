<script setup lang="ts">
import { ref, watchEffect, onMounted, computed } from 'vue'
  import Hls from 'hls.js'
  import Icon from '@/UI/Icon'
  import { secondToTime } from '@/helpers/date'
  import { useDropdown } from '@/composables/dropdown'

  const { dropdownBody, dropdownMenu, showDropdown, openDropdown, closeDropdown } = useDropdown()

  const props = defineProps({
    videoUrl: { type: String, default: '' },
    pixel: { type: Number, default: 480 }
  })

  const hls = ref<any>(null)
  const refVideo = ref<any>(null)

  let mouseMoveTimeout: ReturnType<typeof setTimeout> | null = null
  let controlsHide = ref(false)

  const selectedPixel = ref(480)
  const selectPixel = (pixel: number) => {
    selectedPixel.value = pixel
    const currentTime = refVideo.value.currentTime

    const newSource = `${props.videoUrl}`

    if (hls.value) {
      closeDropdown()

      hls.value.loadSource(newSource)
      hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
        refVideo.value.currentTime = currentTime
        refVideo.value.play()
      })
    } else if (refVideo.value.canPlayType('application/vnd.apple.mpegurl')) {
      refVideo.value.src = newSource
      refVideo.value.onload = () => {
        refVideo.value.currentTime = currentTime
        refVideo.value.play()
      }
    }
  }

  watchEffect(() => {
    if (props.pixel < 480) {
      selectedPixel.value = props.pixel
    }
  })

  onMounted(() => {
    if (Hls.isSupported()) {
      hls.value = new Hls({
        debug: false
      })
      hls.value.loadSource(`${props.videoUrl}`)
      hls.value.attachMedia(refVideo.value)
    } else if (refVideo.value.canPlayType('application/vnd.apple.mpegurl')) {
      refVideo.value.src = `${props.videoUrl}`
    }
    initAudiListeners()

    document.addEventListener('mousemove', handleMouseMove)
  })

  const handleMouseMove = () => {
    if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout)

    controlsHide.value = false
    document.body.style.cursor = 'auto'

    mouseMoveTimeout = setTimeout(() => {
      controlsHide.value = true
      document.body.style.cursor = 'none'
    }, 2000)
  }

  const currentTime = ref(0)
  const duration = ref(0)
  const progress = ref(0)
  const ranges = ref<any[]>([])
  const isPlay = ref(false)
  const isLoading = ref(false)

  const initAudiListeners = () => {
    refVideo.value.addEventListener('loadeddata', () => {
      currentTime.value = 0
      duration.value = refVideo.value?.duration
    })
    refVideo.value.addEventListener('canplay', () => {
      isLoading.value = false
    })

    refVideo.value.addEventListener('waiting', () => {
      isLoading.value = true
    })

    refVideo.value.addEventListener('timeupdate', () => {
      currentTime.value = refVideo.value.currentTime

      rangeValue.value = refVideo.value.currentTime
      progress.value = (rangeValue.value / duration.value) * 100
    })

    refVideo.value.addEventListener('pause', () => {
      isPlay.value = false
    })
    refVideo.value.addEventListener('play', () => {
      isPlay.value = true
    })

    refVideo.value.addEventListener('ended', () => {
      refVideo.value?.stop()
    })

    refVideo.value.addEventListener('progress', () => {
      const newRanges = [] as any[]
      for (var i = 0; i < refVideo.value?.buffered?.length; i++) {
        newRanges.push({
          start: Number(refVideo.value?.buffered?.start(i)) || 0,
          end: Number(refVideo.value?.buffered?.end(i)) || 0
        })
      }
      ranges.value = newRanges
    })
  }

  const play = () => {
    refVideo.value.play()
    isPlay.value = true
  }
  const pause = () => {
    refVideo.value.pause()
    isPlay.value = false
  }

  const togglePlayer = () => {
    isPlay.value ? pause() : play()
  }

  const rangeValue = ref(0)

  const rangeChange = (value: number) => {
    rangeValue.value = value
    refVideo.value.currentTime = rangeValue.value

    progress.value = (rangeValue.value / duration.value) * 100
  }

  const volumeValue = ref(100)
  const lastVolume = ref(100)

  const toggleMuted = () => {
    if (refVideo.value.muted) {
      refVideo.value.muted = false
    } else {
      refVideo.value.muted = true
    }
  }

  const volumeChange = (value: number) => {
    volumeValue.value = value
    refVideo.value.volume = value / 100
    lastVolume.value = value
  }

  const volumeIcon = computed(() => {
    if (volumeValue.value > 0) {
      return 'speakerMedium'
    }
    if (volumeValue.value === 0) {
      return 'speakerMuted'
    }
    return 'speaker'
  })

  const videoPlayer = ref<any>(null)
  const openFullscreen = () => {
    if (videoPlayer.value.requestFullscreen) {
      videoPlayer.value.requestFullscreen()
    } else if (videoPlayer.value.webkitRequestFullscreen) {
      videoPlayer.value.webkitRequestFullscreen()
    } else if (videoPlayer.value.msRequestFullscreen) {
      videoPlayer.value.msRequestFullscreen()
    }
  }

  const closeFullscreen = () => {
    const doc = document as any
    if (doc.exitFullscreen) {
      doc.exitFullscreen()
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen()
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen()
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen()
    }
  }
  const isIOS = ref<boolean>(false)
  const isFullscreen = ref(false)
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
    isFullscreen.value ? openFullscreen() : closeFullscreen()
  }
  onMounted(() => {
    isIOS.value = /iPad|iPhone|iPod/.test(navigator.userAgent)
  })
</script>

<template>
  <div
    ref="videoPlayer"
    :class="['video-player', { 'video-player__play': isPlay, 'video-player__hide-controller': isPlay && controlsHide }]"
  >
    <div class="video-player__video">
      <video
        ref="refVideo"
        playsinline
        crossorigin="false"
      ></video>
    </div>
    <div class="video-player__custom">
      <div class="player-custom">
        <div class="player-custom__cover"></div>
        <div @click="togglePlayer" class="player-custom__control">
          <icon :name="isPlay ? 'pauseCircle' : 'playCircle'" />
        </div>
        <div v-if="isLoading" class="player-custom__loading"></div>
        <div class="player-custom__controls">
          <div @click="togglePlayer" class="player-custom__control-mini">
            <icon :name="isPlay ? 'playerPause' : 'playerPlay'" />
          </div>
          <div class="player-custom__progress-container">
            <div class="player-custom__progress">
              <input
                @input="(event:Event)=> rangeChange(Number((event.target as HTMLInputElement).value || 0))"
                :value="rangeValue"
                type="range"
                min="0"
                :max="duration"
                :style="`background-size: ${progress}% 100%;`"
              />
            </div>
          </div>
          <div class="player-custom__time">
            <span>{{ secondToTime(currentTime) }}</span>
            /
            <!-- <span>{{ secondToTime(video.duration) }}</span> -->
          </div>
          <div :class="['player-custom__quality', { _active: showDropdown }]" ref="dropdownBody">
            <div @click="showDropdown ? closeDropdown() : openDropdown()" class="player-custom__quality-button">
              <p>{{ selectedPixel }}p</p>
              <icon name="chevronLeft" />
            </div>
            <div ref="dropdownMenu" class="player-custom__quality-menu">
              <div @click="selectPixel(360)" class="player-custom__quality-item">360p</div>
              <div v-if="props.pixel >= 480" @click="selectPixel(480)" class="player-custom__quality-item">480p</div>
              <div v-if="props.pixel >= 720" @click="selectPixel(720)" class="player-custom__quality-item">720p</div>
              <div v-if="props.pixel >= 1080" @click="selectPixel(1080)" class="player-custom__quality-item">1080p</div>
            </div>
          </div>
          <div class="player-custom__volume">
            <button @click="toggleMuted">
              <icon :name="volumeIcon" />
            </button>
            <input
              @input="(event:Event)=> volumeChange(Number((event.target as HTMLInputElement).value || 0))"
              :value="volumeValue"
              type="range"
              min="0"
              max="100"
              :style="`background-size: ${volumeValue}% 100%;`"
            />
          </div>
          <div @click="toggleFullscreen" class="player-custom__resize">
            <icon :name="isFullscreen ? 'minimize' : 'maximize'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .video-player {
    width: 100%;
    height: 100%; 
    overflow: hidden;
    position: relative;
    background-color: #000;
    border-radius: 6px;
    overflow: hidden;
    &::before {
      content: '';
      display: block;
      width: 100%;
      padding-top: 73.25%;
    }
    &:fullscreen {
      border-radius: 0;
      width: 100%;
      height: 100%;
      &::before {
        content: none;
      }
    }

    // .video-player__hide-controller
    &__hide-controller {
      .player-custom__control,
      .player-custom__controls {
        visibility: hidden;
        opacity: 0;
      }
    }
    // .video-player__play
    &__play {
      &:not(:hover) {
        .player-custom__control,
        .player-custom__controls {
          visibility: hidden;
          opacity: 0;
        }
      }
    }
    // .video-player__video
    &__video {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      video {
        width: 100%;
        height: 100%;
      }
    }
    // .video-player__custom
    &__custom {
      position: absolute;
      z-index: 1;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .player-custom {
    width: 100%;
    height: 100%;
    // .player-custom__cover
    &__cover {
    }
    // .player-custom__control
    &__control {
      color: var(--white);
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      transition: 0.2s;
      border-radius: 50%;
      color: var(--white);
      &:deep() {
        svg {
          width: 80px;
          height: 80px;
        }
      }
      @media screen and (max-width: 475px) {
        &:deep() {
          svg {
            width: 50px;
            height: 50px;
          }
        }
      }
    }
    // .player-custom__loading
    &__loading {
      color: var(--white);
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 78px;
      height: 78px;
      border: 3px solid var(--white);
      border-left-color: transparent;
      border-radius: 50%;
      animation: loading 0.8s linear infinite;
      user-select: none;
      pointer-events: none;
      @keyframes loading {
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
      @media screen and (max-width: 475px) {
        width: 50px;
        height: 50px;
      }
    }
    // .player-custom__controls
    &__controls {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      align-items: center;
      padding: 10px;
      transition: 0.2s;
      background-color: rgba(0, 0, 0, 0.5);
      &:deep() {
        svg {
          width: 20px;
          height: 20px;
        }
      }
      @media screen and (max-width: 475px) {
        padding: 4px;
        &:deep() {
          svg {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
    // .player-custom__control-mini
    &__control-mini {
      color: var(--white);
      padding: 10px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: 0.2s;
      &:hover {
        background-color: var(--primary);
      }
    }
    // .player-custom__progress-container
    &__progress-container {
      flex: 1 1;
      margin: 0 10px;
      @media screen and (max-width: 475px) {
        margin: 0 4px;
      }
    }
    // .player-custom__progress
    &__progress {
      height: 20px;
      input {
        -webkit-appearance: none;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 2px;
        background-image: linear-gradient(var(--primary), var(--primary));
        background-size: 0% 100%;
        background-repeat: no-repeat;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 2px 0 #555;
          transition: background 0.3s ease-in-out;
        }
        &::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          box-shadow: none;
          border: none;
          background: transparent;
        }
      }
    }
    // .player-custom__time
    &__time {
      color: var(--white);
      margin-right: 4px;
      @media screen and (max-width: 475px) {
        font-size: 12px;
      }
    }
    // .player-custom__volume
    &__volume {
      display: flex;
      align-items: center;
      margin-right: 4px;
      button {
        color: var(--white);
        background-color: transparent;
        color: var(--white);
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
        user-select: none;
        transition: 0.2s;
        margin-right: 4px;
        &:hover {
          background-color: var(--primary);
        }
      }
      input {
        width: 100px;
        -webkit-appearance: none;
        height: 4px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 2px;
        background-image: linear-gradient(var(--primary), var(--primary));
        background-size: 0% 100%;
        background-repeat: no-repeat;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 2px 0 #555;
          transition: background 0.3s ease-in-out;
        }
        &::-webkit-slider-runnable-track {
          -webkit-appearance: none;
          box-shadow: none;
          border: none;
          background: transparent;
        }
      }
      @media screen and (max-width: 475px) {
        margin-right: 0;
        input {
          display: none;
        }
      }
    }
    // .player-custom__quality
    &__quality {
      position: relative;
      margin-right: 4px;
      margin-left: 4px;
      &._active {
        .player-custom__quality-button {
          background-color: var(--primary);
        }
        .player-custom__quality-menu {
          display: flex;
        }
      }
    }
    // .player-custom__quality-button
    &__quality-button {
      display: flex;
      align-items: center;
      color: var(--white);
      padding: 6px 4px 6px 6px;
      border-radius: 4px;
      gap: 2px;
      cursor: pointer;
      p {
        line-height: 20px;
      }
      &:deep() {
        .icon {
          transform: rotate(-90deg);
        }
      }
      &:hover {
        background-color: var(--primary);
      }
    }
    // .player-custom__quality-menu
    &__quality-menu {
      position: absolute;
      z-index: 1;
      right: 0;
      bottom: 100%;
      background-color: rgba(0, 0, 0, 1);
      border-radius: 4px;
      padding: 4px;
      flex-direction: column;
      gap: 2px;
      display: none;
    }
    // .player-custom__quality-item
    &__quality-item {
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--white);
      line-height: 20px;
      &:hover {
        background-color: var(--primary);
      }
    }

    // .player-custom__resize
    &__resize {
      color: var(--white);
      padding: 10px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      transition: 0.2s;
      &:hover {
        background-color: var(--primary);
      }
    }
  }
</style>
