import type {ReactNode} from 'react';
import {lessons} from '../data/lessons';
export function Phase2Badge(){return <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white">Phase 2</span>}
export function Sidebar({page,setPage,completed}:{page:string;setPage:(p:string)=>void;completed:string[]}){
  const phase1=lessons.filter(l=>l.phase===1);
  const phase2=lessons.filter(l=>l.phase===2);
  const item=(id:string,label:ReactNode)=><button key={id} onClick={()=>setPage(id)} className={`w-full rounded-lg px-3 py-2 text-left ${page===id?'bg-blue-100 text-blue-800':'hover:bg-slate-100'}`}>{label}</button>;
  return <nav className="space-y-1">
    {item('home','Home')}
    <p className="mb-1 mt-4 px-3 text-xs font-bold uppercase text-slate-400">Phase 1</p>
    {phase1.map(l=>item(l.id,<>{completed.includes(l.id)?'✓':'○'} {l.num}. {l.title}</>))}
    {item('lifecycle','Interactive Request Lifecycle')}
    <p className="mb-1 mt-4 flex items-center gap-2 px-3 text-xs font-bold uppercase text-slate-400">Phase 2 <Phase2Badge/></p>
    {phase2.map(l=>item(l.id,<>{completed.includes(l.id)?'✓':'○'} {l.num}. {l.title}</>))}
    {item('debugging','Debugging Challenges')}
    {item('quiz','Quiz')}
  </nav>;
}
