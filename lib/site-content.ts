// 사이트에 노출하는 게임 / 외부 플랫폼 강의 목록
// DB 대신 코드로 관리 (항목이 적고 자주 바뀌지 않음)

export interface Game {
  slug: string
  title: string
  titleEn: string
  status: string
  tagline: string
  description: string
  tags: string[]
  keyArt: string
  capsule: string
  screenshots: string[]
  steamUrl: string
  demoUrl?: string
}

export interface ExternalCourse {
  platform: string
  title: string
  url: string
  meta?: string
  image?: string
}

export const games: Game[] = [
  {
    slug: "rushgirl-luca",
    title: "러쉬걸 루카",
    titleEn: "RushGirl LUCA",
    status: "출시 예정",
    tagline: "러쉬걸 루카는 탄막 슈팅 로그라이트입니다. 근데 이제 무기에 무기를 붙이고, 거기에 또 붙이고, 또 붙이는.",
    description:
      "외계 드론의 습격으로 도시가 쑥대밭이 됐다. 도시를 지키기 위해 안드로이드 소녀 루카는 무기에 무기를 합치고, 합치고, 합치고, 합치고… 대체 얼마나 합칠 건데! 마우스 하나로 즐길 수 있는 탄막 슈팅 로그라이트.",
    tags: ["탄막 슈팅", "로그라이트", "마우스 하나로", "픽셀 그래픽"],
    keyArt: "/games/luca/key-art.webp",
    capsule: "/games/luca/capsule.jpg",
    screenshots: [
      "/games/luca/shot1.webp",
      "/games/luca/shot2.webp",
      "/games/luca/shot4.webp",
      "/games/luca/shot5.webp",
      "/games/luca/shot3.webp",
    ],
    steamUrl: "https://store.steampowered.com/app/4809740/",
    demoUrl: "https://store.steampowered.com/app/5285450/RushGirl_LUCA_Demo/",
  },
]

export const externalCourses: ExternalCourse[] = [
  {
    platform: "해커스 캠퍼스",
    title: "나도 게임 개발자 START! 바이브코딩으로 시작하는 2D 게임 개발",
    url: "https://campus.hackers.com/lecture/48159",
    meta: "9강 · 수강기간 90일",
    image: "/courses/hackers-48159.webp",
  },
]
