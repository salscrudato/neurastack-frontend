import { create } from 'zustand';

export interface Task {
  id: string;
  title: string;
  body: string;
  steps: { id:string; text:string; done:boolean }[];
  pinned: boolean;
}

interface State {
  tasks:   Task[];
  pinned:  Task[];
  add:     (t:Task)=>void;
  toggle:  (taskId:string, stepId:string)=>void;
  pin:     (taskId:string)=>void;
}

export const useNeurataskStore = create<State>((set)=>({
  tasks:  [],
  pinned: [],
  add:  t => set(s => ({ tasks:[t], pinned:s.pinned })),      // only 1 active card
  toggle: (taskId,stepId) => set(s=>({
    tasks: s.tasks.map(t=>t.id!==taskId? t : ({
      ...t,
      steps: t.steps.map(s2=>s2.id===stepId? {...s2,done:!s2.done}:s2)
    }))
  })),
  pin: taskId => set(s=>{
    const t = s.tasks.find(x=>x.id===taskId);
    if(!t) return s;
    const newPinned = [t, ...s.pinned].slice(0,3);
    return { pinned:newPinned };
  })
}));