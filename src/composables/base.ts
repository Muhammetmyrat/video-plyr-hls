import type { Month, Item, Article } from '@/types/base'

export const useBase = () => {
  const { locale } = useI18n()

  const createdAt = (createdTime: string): string => {
    const month = new Date(createdTime).getMonth()

    const monthNames = {
      tkm: [
        'Ýanwar',
        'Fewral',
        'Mart',
        'Aprel',
        'Maý',
        'Iýun',
        'Iyul',
        'Awgust',
        'Sentýabr',
        'Oktýabr',
        'Noýabr',
        'Dekabr'
      ],
      rus: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
      ],
      eng: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
    } as Month

    const justNow = {
      tkm: 'şu wagt',
      rus: 'прямо сейчас',
      eng: 'right now'
    } as any

    const minutesAgo = {
      tkm: ' minut öň',
      rus: ' минут назад',
      eng: ' minutes ago'
    } as any

    const hoursAgo = {
      tkm: ' sagat öň',
      rus: ' часов назад',
      eng: ' hours ago'
    } as any

    const publishedDate = new Date(createdTime)

    const currentDate = new Date()

    if (publishedDate > currentDate) {
      return (
        new Date(createdTime).getDate().toString() +
        ' ' +
        monthNames[locale.value][month] +
        ', ' +
        new Date(createdTime).getFullYear()
      )
    }

    const timeDifference = currentDate.getTime() - publishedDate.getTime()

    const minutesDifference = Math.round(timeDifference / (1000 * 60))

    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60))

    if (minutesDifference < 1) {
      return justNow[locale.value]
    } else if (minutesDifference < 60) {
      return minutesDifference + minutesAgo[locale.value]
    } else if (hoursDifference < 24) {
      return hoursDifference + hoursAgo[locale.value]
    } else {
      return (
        new Date(createdTime).getDate().toString() +
        ' ' +
        monthNames[locale.value][month] +
        ', ' +
        new Date(createdTime).getFullYear()
      )
    }
  }

  const translation = computed(() => {
    let localeLang: string

    if (locale.value === 'tkm') {
      localeLang = 'tm'
    } else if (locale.value === 'rus') {
      localeLang = 'ru'
    } else {
      localeLang = 'en'
    }
    return localeLang
  })
  const getTime = (date: string) => {
    const newDate = new Date(date)

    const hour = newDate.getHours().toString().padStart(2, '0')
    const minute = newDate.getMinutes().toString().padStart(2, '0')

    return `${hour}:${minute}`
  }

  const transform = (
    data: Item,
    link?: string | null,
    categoryLink?: string | null,
    photoSize?: string | null
  ): Article => ({
    photo: data.main_photo
      ? `${data.main_photo}-${photoSize}.webp`
      : data.main_video
      ? `${data.main_video.photo || data.main_video.poster}-${photoSize}.webp`
      : null,
    video: data.main_video ? `${data.main_video}` : null,
    duration: data.main_video ? Number(data.main_video.duration) : null,
    title: data.title || null,
    slugName: data.slug_name || null,
    link: `${link}/${data.slug_name}`,
    description: data.description || '',
    startDate: data?.start_date ? createdAt(data?.start_date) : null,
    endDate: data?.end_date ? createdAt(data?.end_date) : null,
    category:
      data.category?.map((item) => ({
        id: item.category_id,
        categorySlug: item.category_slug,
        parentCategorySlug: item.parent_category_slug,
        parentId: item.parent_id,
        link: item.parent_id
          ? `${categoryLink}/${item.parent_category_slug}/${item.category_slug}`
          : `${categoryLink}/${item.category_slug}`,
        name: item[`name_${translation.value}`],
        parentName: item.parent_id ? item[`parent_name_${translation.value}`] : null
      })) || [],
    publishedDate: data.published_date ? createdAt(data.published_date) : null,
    message: null,
    visibility: data.view_count
  })

  return {
    createdAt,
    translation,
    transform,
    getTime
  }
}
