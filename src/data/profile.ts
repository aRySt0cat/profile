import type { Language } from "./activities";

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/aRySt0cat" },
  { label: "X", href: "https://x.com/eta1ia" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ryuta-shimogauchi/" },
  { label: "Instagram", href: "https://www.instagram.com/et_a11a/" },
  {
    label: "YouTube — Elith Official",
    href: "https://www.youtube.com/@elithofficial",
  },
];

type EducationCopy = { school: string; course: string; degree: string };

export const education: ({ id: string; year: string } & Record<
  Language,
  EducationCopy
>)[] = [
  {
    id: "education-2020",
    year: "2020",
    ja: {
      school: "東京大学大学院",
      course: "情報理工学系研究科 電子情報学専攻",
      degree: "修士",
    },
    en: {
      school: "The University of Tokyo",
      course:
        "Graduate School of Information Science and Technology, Department of Information and Communication Engineering",
      degree: "M.S.",
    },
  },
  {
    id: "education-2017",
    year: "2017",
    ja: {
      school: "東京大学",
      course: "工学部 電子情報工学科",
      degree: "学士",
    },
    en: {
      school: "The University of Tokyo",
      course:
        "Faculty of Engineering, Department of Electrical and Electronic Engineering",
      degree: "B.Eng.",
    },
  },
  {
    id: "education-2012",
    year: "2012",
    ja: {
      school: "神戸市立工業高等専門学校",
      course: "電子工学科",
      degree: "準学士",
    },
    en: {
      school: "Kobe City College of Technology",
      course: "Department of Electronics",
      degree: "Associate",
    },
  },
];
