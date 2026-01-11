export interface Tool {
  id: string;
  title: string;
  icon: string;
}

export const toolsList: Tool[] = [
  {
    id: "metronome",
    title: "Metronome",
    icon: "metronome",
  },
  {
    id: "circle-of-fifths",
    title: "Circle of Fifths",
    icon: "circle-of-fifths",
  },
];
