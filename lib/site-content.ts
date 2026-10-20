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
}

export const games: Game[] = [
  {
    slug: "rushgirl-luca",
    title: "러쉬걸 루카",
    titleEn: "RushGirl LUCA",
    status: "출시 예정",
    tagline: "한 판은 짧고, 조합은 끝이 없습니다.",
    description:
      "러쉬걸 루카는 한 손으로 즐기는 로그라이트 액션 슈터입니다. 하늘을 덮은 드론 무리를 헤치고, 웨이브 사이에 무기를 다시 짜 맞추세요.",
    tags: ["로그라이트", "탄막 슈터", "한 손 조작", "픽셀 그래픽"],
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
  },
]
