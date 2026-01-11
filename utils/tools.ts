export interface Tool {
  id: string;
  title: string;
  icon: string;
  description?: string;
}

export const toolsList: Tool[] = [
  {
    id: "metronome",
    title: "Metronome",
    icon: "metronome",
    description: "Keep time with precision",
  },
  {
    id: "circle-of-fifths",
    title: "Circle of Fifths",
    icon: "circle-of-fifths",
    description: "Explore music theory",
  },
  {
    id: "tuner",
    title: "Tuner",
    icon: "tuner",
    description: "Tune your instrument",
  },
  {
    id: "scales",
    title: "Scales",
    icon: "scales",
    description: "Practice scales & modes",
  },
  {
    id: "chord-finder",
    title: "Chord Finder",
    icon: "chord-finder",
    description: "Find chord progressions",
  },
  {
    id: "ear-training",
    title: "Ear Training",
    icon: "ear-training",
    description: "Develop your musical ear",
  },
];
