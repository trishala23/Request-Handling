import type {Question} from '../data/quiz';
export function isCorrect(q:Question,answer:string|string[]){return Array.isArray(q.answer)?JSON.stringify(q.answer)===JSON.stringify(answer):q.answer===answer}
export function scoreQuiz(questions:Question[],answers:Record<string,string|string[]>){return questions.reduce((s,q)=>s+(isCorrect(q,answers[q.id]??'')?1:0),0)}
