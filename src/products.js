export const sources = {
  revia: {
    title: "FDA · Revia prescribing information (2013 archive)",
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2013/018932s017lbl.pdf",
  },
  ldn: {
    title: "Pain Reports · Bested et al., randomized crossover study (2023)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10789452/",
  },
  contrave: {
    title: "FDA · Contrave prescribing information (2024)",
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/200063s022lbl.pdf",
  },
  mysimba: {
    title: "EMA · Mysimba European public assessment report",
    url: "https://www.ema.europa.eu/en/medicines/human/EPAR/mysimba",
  },
  xl: {
    title: "FDA · Wellbutrin XL prescribing information (2024)",
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2024/021515s046lbl.pdf",
  },
  provigil: {
    title: "FDA · Provigil prescribing information (2015 archive)",
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2015/020717s037s038lbl.pdf",
  },
  loniten: {
    title: "FDA · Loniten prescribing information (2015 archive)",
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2015/018154s026lbl.pdf",
  },
  minoxidil: {
    title: "JAMA Dermatology · Low-dose oral minoxidil expert consensus (2025)",
    url: "https://jamanetwork.com/journals/jamadermatology/article-abstract/2826573",
  },
  dayvigo: {
    title: "FDA · Dayvigo prescribing information (February 2025)",
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/212028s011lbl.pdf",
  },
};
export const families = {
  ldn: {
    category: "Individualized compounding",
    tag: "Low-dose preparation",
    context:
      "Naltrexone is an opioid receptor antagonist. Lower-dose preparations are studied in off-label settings. A 2023 randomized crossover study in 58 people with fibromyalgia found no clinically relevant analgesic efficacy with 4.5 mg. This study does not establish efficacy for a 1.5 mg preparation.",
    caution:
      "Naltrexone can precipitate opioid withdrawal and interfere with opioid pain medicines. Liver risks and other medicines require prescriber review. A lower strength does not establish a safer or effective treatment.",
    note: "These lower-dose Fortis preparations are not the 50 mg reference product. No approved indication or proven clinical benefit for these specific compounded preparations is implied.",
    refs: ["ldn", "revia"],
  },
  naltrexone: {
    category: "Addiction medicine",
    tag: "Opioid antagonist",
    context:
      "Naltrexone blocks opioid receptors. The FDA reference label describes treatment of alcohol dependence and blockade of externally administered opioids as part of a comprehensive management plan.",
    caution:
      "Current opioid use or dependence can make naltrexone inappropriate and may lead to precipitated withdrawal. Liver concerns and vulnerability to opioid overdose need clinical assessment.",
    note: "The reference label concerns Revia. It does not establish approval, equivalence or clinical performance of this Fortis compounded preparation.",
    refs: ["revia"],
  },
  combination: {
    category: "Weight management",
    tag: "Combination preparation",
    context:
      "Bupropion and naltrexone are combined in reference medicines used for weight management in eligible adults alongside lifestyle measures. FDA Contrave contains 90 mg bupropion hydrochloride and 8 mg naltrexone hydrochloride in an extended-release tablet.",
    caution:
      "Reference-product contraindications include seizure disorders, uncontrolled hypertension, certain eating disorders, opioid use and MAOI treatment. Individual assessment and monitoring are essential.",
    note: "Fortis 45 mg / 4 mg has a different stated strength and an unspecified release profile. It must not be treated as equivalent to Contrave or Mysimba, and reference dosing must not be transferred.",
    refs: ["contrave", "mysimba"],
  },
  bupropion: {
    category: "Mental health",
    tag: "Individualized strength",
    context:
      "Bupropion is an antidepressant. The FDA Wellbutrin XL reference label covers major depressive disorder and prevention of seasonal depressive episodes, using 150 mg and 300 mg extended-release tablets.",
    caution:
      "Seizure risk, changes in mood or suicidal thinking, eating-disorder history and interacting medicines require prescriber assessment. Release characteristics matter when selecting a preparation.",
    note: "“ER 75 mg” is the supplied Fortis catalog designation. Its release characteristics have not been independently verified here. This page does not equate it with an FDA-approved SR or XL product.",
    refs: ["xl"],
  },
  modafinil: {
    category: "Sleep medicine",
    tag: "Wakefulness-promoting ingredient",
    context:
      "The FDA reference label describes modafinil for excessive sleepiness associated with adult narcolepsy, obstructive sleep apnea or shift-work disorder. It does not treat the underlying airway obstruction.",
    caution:
      "Serious rash, psychiatric effects, cardiovascular concerns and drug interactions require review. Modafinil can reduce the effectiveness of steroidal contraceptives. It is not presented here as a cognitive-enhancement product.",
    note: "Reference-product evidence does not establish approval or equivalence for the specific Fortis compounded formulation.",
    refs: ["provigil"],
  },
  minoxidil: {
    category: "Dermatology",
    tag: "Off-label hair-loss context",
    context:
      "Oral minoxidil is a vasodilator; the FDA reference product is labeled for severe resistant hypertension. Low-dose oral use for hair loss is off-label. JAMA Dermatology expert consensus discusses this use while identifying evidence gaps.",
    caution:
      "Blood-pressure changes, fluid retention, increased heart rate and pericardial complications require assessment. Suitability and monitoring must be individualized.",
    note: "The 1.25 mg Fortis preparation is not the 2.5 mg or 10 mg reference tablet. Expert consensus is not regulatory approval, and topical minoxidil evidence cannot be assumed to apply to an oral preparation.",
    refs: ["loniten", "minoxidil"],
  },
  lemborexant: {
    category: "Sleep medicine",
    tag: "Orexin receptor antagonist",
    context:
      "Lemborexant blocks orexin receptors involved in wakefulness. The FDA Dayvigo reference label covers adult insomnia with difficulty falling asleep or staying asleep and lists 5 mg and 10 mg tablets.",
    caution:
      "Narcolepsy is a contraindication. Next-day impairment, complex sleep behaviors and interactions with alcohol, other CNS depressants or CYP3A medicines require prescriber review.",
    note: "Fortis 1 mg and 2.5 mg are not strengths listed in the cited FDA label. Reference-product approval does not establish approval or equivalence of any Fortis compounded preparation.",
    refs: ["dayvigo"],
  },
};
export const products = [
  {
    slug: "naltrexone-1-5",
    name: "Naltrexone hydrochloride",
    strength: "1.5 mg",
    pack: 30,
    family: "ldn",
    featured: true,
  },
  {
    slug: "naltrexone-4-5",
    name: "Naltrexone hydrochloride",
    strength: "4.5 mg",
    pack: 30,
    family: "ldn",
  },
  {
    slug: "naltrexone-50",
    name: "Naltrexone hydrochloride",
    strength: "50 mg",
    pack: 10,
    family: "naltrexone",
  },
  {
    slug: "bupropion-naltrexone-45-4",
    name: "Bupropion + Naltrexone",
    strength: "45 mg / 4 mg",
    pack: 30,
    family: "combination",
  },
  {
    slug: "bupropion-er-75",
    name: "Bupropion ER",
    strength: "75 mg",
    pack: 30,
    family: "bupropion",
    featured: true,
  },
  {
    slug: "modafinil-100",
    name: "Modafinil",
    strength: "100 mg",
    pack: 30,
    family: "modafinil",
  },
  {
    slug: "minoxidil-1-25",
    name: "Minoxidil",
    strength: "1.25 mg",
    pack: 30,
    family: "minoxidil",
    featured: true,
  },
  {
    slug: "lemborexant-1",
    name: "Lemborexant",
    strength: "1 mg",
    pack: 30,
    family: "lemborexant",
  },
  {
    slug: "lemborexant-2-5",
    name: "Lemborexant",
    strength: "2.5 mg",
    pack: 30,
    family: "lemborexant",
  },
  {
    slug: "lemborexant-5",
    name: "Lemborexant",
    strength: "5 mg",
    pack: 30,
    family: "lemborexant",
    featured: true,
  },
].map((p) => ({
  ...p,
  image: `/products/${p.slug}.webp`,
  ...families[p.family],
}));
