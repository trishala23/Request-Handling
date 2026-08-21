export type Progress={completedLessons:string[];quizBestScore:number;lastVisitedLesson:string|null};
export const defaultProgress:Progress={completedLessons:[],quizBestScore:0,lastVisitedLesson:null};
const key='javaBackendStudyGuide.progress';
export function calculateProgress(completed:string[],total:number){return total===0?0:Math.round((new Set(completed).size/total)*100)}
export function loadProgress(storage:Storage=localStorage):Progress{try{return {...defaultProgress,...JSON.parse(storage.getItem(key)||'{}')}}catch{return defaultProgress}}
export function saveProgress(p:Progress,storage:Storage=localStorage){storage.setItem(key,JSON.stringify(p))}
export function completeLesson(p:Progress,id:string):Progress{return {...p,completedLessons:Array.from(new Set([...p.completedLessons,id])),lastVisitedLesson:id}}
export function resetProgress(storage:Storage=localStorage){storage.removeItem(key)}
export function updateBestScore(p:Progress,score:number):Progress{return {...p,quizBestScore:Math.max(p.quizBestScore,score)}}
