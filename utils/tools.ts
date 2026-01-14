export interface Tool {
  id: string;
  title: string;
  icon: string;
  description?: string;
  screen?: string;
}

export const toolsList: Tool[] = [
  {
    id: "metronome",
    title: "Metronome",
    icon: "metronome",
    description: "Keep time with precision",
    screen: "coming-soon",
  },
  {
    id: "circle-of-fifths",
    title: "Circle of Fifths",
    icon: "circle-of-fifths",
    description: "Explore music theory",
    screen: "circle-of-fifths",
  },
];
