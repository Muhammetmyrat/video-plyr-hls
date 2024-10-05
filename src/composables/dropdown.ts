import { onMounted, ref } from 'vue'

export function useDropdown() {
  const dropdownBody = ref<null | HTMLElement>(null)
  const dropdownMenu = ref<null | HTMLElement>(null)
  const showDropdown = ref<boolean>(false)
  const showTop = ref<boolean>(false)

  const openDropdown = () => {
    let bodyPosition = dropdownBody.value?.getBoundingClientRect()
    let menuPosition = dropdownMenu.value

    const menuHeight = Number(menuPosition?.scrollHeight) < 300 ? menuPosition?.scrollHeight || 0 : 300

    if (bodyPosition && menuPosition) {
      if (window.innerHeight - bodyPosition.y < menuHeight + 50) {
        showTop.value = true
      } else {
        showTop.value = false
      }
    }
    showDropdown.value = true
  }

  const closeDropdown = () => {
    showDropdown.value = false
  }

  const dropdownToggle = (status: boolean) => {
    dropdownMenu.value && (dropdownMenu.value.style.height = status ? dropdownMenu.value.scrollHeight + 'px' : '')
  }

  onMounted(() => {
    document.addEventListener('click', (event: Event) => {
      if (event) {
        const target = event.target as HTMLElement
        if (target) {
          const isClickInside = dropdownBody.value?.contains(target)

          if (!isClickInside) {
            showDropdown.value = false
            dropdownToggle(showDropdown.value)
          }
        }
      }
    })
  })

  return {
    dropdownBody,
    dropdownMenu,
    showDropdown,
    showTop,
    openDropdown,
    closeDropdown,
    dropdownToggle,
  }
}
