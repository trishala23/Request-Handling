import {useState} from 'react';
import {CodeBlock} from './CodeBlock';
import {debugScenarios} from '../data/debugging';
import {AppModel,Direction,Perspective,getMonoFluxNodes,getPerspectiveInfo,getRequestFlowNodes,getServletReactiveNodes,getTomcatNettyNodes,requestFlowNodeInfo,simulateThreadUsage} from '../lib/phase2';

const flowBox=(active:boolean)=>`rounded-xl border p-3 shadow ${active?'bg-blue-600 text-white scale-105':'bg-white'}`;

function FlowDiagram({nodes}:{nodes:string[]}){
  return <div className="my-4 flex flex-wrap items-center gap-2">
    {nodes.map((n,i)=><span className="rounded-xl bg-white p-3 shadow" key={n+i}>{n}{i<nodes.length-1&&<b> ↓</b>}</span>)}
  </div>;
}

export function ServletReactiveToggle(){
  const [mode,setMode]=useState<AppModel>('servlet');
  return <div className="card space-y-4">
    <div className="flex gap-2">
      <button className={`rounded-lg border px-4 py-2 ${mode==='servlet'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('servlet')}>Servlet</button>
      <button className={`rounded-lg border px-4 py-2 ${mode==='reactive'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('reactive')}>Reactive</button>
    </div>
    <FlowDiagram nodes={getServletReactiveNodes(mode)}/>
    <p className="rounded-lg bg-blue-50 p-3">
      {mode==='servlet'
        ?'Spring MVC on Tomcat: each request typically occupies a thread for its full duration (thread-per-request).'
        :'Spring WebFlux on Netty: requests are processed via an event loop, where a small number of threads handle many requests without blocking on I/O.'}
    </p>
  </div>;
}

export function TomcatNettyToggle(){
  const [mode,setMode]=useState<'tomcat'|'netty'>('tomcat');
  return <div className="card space-y-4">
    <div className="flex gap-2">
      <button className={`rounded-lg border px-4 py-2 ${mode==='tomcat'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('tomcat')}>Tomcat</button>
      <button className={`rounded-lg border px-4 py-2 ${mode==='netty'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('netty')}>Netty</button>
    </div>
    <FlowDiagram nodes={getTomcatNettyNodes(mode)}/>
    <p className="rounded-lg bg-blue-50 p-3">
      {mode==='tomcat'
        ?'Tomcat is a Servlet container commonly used with Spring MVC applications.'
        :'Netty is a general-purpose networking framework commonly used underneath Spring WebFlux.'}
      {' '}Reactive does not automatically mean faster — its advantage shows up under I/O-heavy, high-concurrency workloads through non-blocking processing, not as an absolute rule.
    </p>
  </div>;
}

export function BlockingSimulation(){
  const [concurrent,setConcurrent]=useState(1);
  const [mode,setMode]=useState<'blocking'|'nonblocking'>('blocking');
  const maxThreads=20;
  const {busy:busyThreads,queued}=simulateThreadUsage(mode,concurrent,maxThreads);
  return <div className="card space-y-4">
    <div className="flex gap-2">
      <button className={`rounded-lg border px-4 py-2 ${mode==='blocking'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('blocking')}>Blocking</button>
      <button className={`rounded-lg border px-4 py-2 ${mode==='nonblocking'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('nonblocking')}>Non-blocking</button>
    </div>
    <div className="flex flex-wrap gap-2">
      {[1,5,10,50,100].map(n=><button key={n} className={`rounded-lg border px-3 py-2 ${concurrent===n?'bg-yellow-100 border-yellow-500':''}`} onClick={()=>setConcurrent(n)}>{n}</button>)}
    </div>
    <p className="text-sm text-slate-600">Simulated pool: {maxThreads} request-handling threads (educational only — no real network calls are made).</p>
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-4 shadow">
        <p className="font-semibold">Threads busy waiting on Payment Service</p>
        <p className="text-3xl font-bold text-blue-700">{busyThreads}</p>
      </div>
      <div className="rounded-xl bg-white p-4 shadow">
        <p className="font-semibold">Requests queued / rejected</p>
        <p className="text-3xl font-bold text-red-600">{queued}</p>
      </div>
    </div>
    <p className="rounded-lg bg-blue-50 p-3">
      {mode==='blocking'
        ?`With blocking calls, each concurrent request ties up a thread for the full wait. At ${concurrent} concurrent requests, ${busyThreads} threads are occupied${queued>0?` and ${queued} requests have nowhere to run until a thread frees up`:''}.`
        :`With non-blocking calls, a small fixed number of event-loop threads can service all ${concurrent} concurrent requests, because no thread sits idle waiting for Payment Service.`}
    </p>
  </div>;
}

export function PerspectiveSwitch(){
  const [p,setP]=useState<Perspective>('order');
  const info=getPerspectiveInfo(p);
  return <div className="card space-y-4">
    <p className="font-semibold">Perspective:</p>
    <div className="flex flex-wrap gap-2">
      {(['customer','order','payment'] as Perspective[]).map(x=><button key={x} className={`rounded-lg border px-4 py-2 ${p===x?'bg-blue-600 text-white':''}`} onClick={()=>setP(x)}>{x==='customer'?'Customer':x==='order'?'Order Service':'Payment Service'}</button>)}
    </div>
    <FlowDiagram nodes={['Customer','Order Service','Payment Service']}/>
    <p className="rounded-lg bg-yellow-50 p-3"><b>Role: </b>{info.role}</p>
    <ul className="list-inside list-disc space-y-1 rounded-lg bg-blue-50 p-3">
      {info.lines.map(l=><li key={l}>{l}</li>)}
    </ul>
  </div>;
}

export function HttpClientsCompare(){
  const rows:[string,string][]=[['OkHttp','HTTP client library'],['RestTemplate','Traditional blocking Spring client'],['WebClient','Reactive/non-blocking capable'],['Feign','Declarative HTTP client']];
  return <div className="card space-y-4">
    <FlowDiagram nodes={['Order Service','HTTP Client','Payment Service']}/>
    <div className="overflow-auto">
      <table className="w-full border-collapse text-left">
        <thead><tr className="border-b"><th className="p-2">Client</th><th className="p-2">Typical Model</th></tr></thead>
        <tbody>{rows.map(([c,m])=><tr className="border-b" key={c}><td className="p-2 font-semibold">{c}</td><td className="p-2">{m}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="rounded-lg bg-blue-50 p-3">A library and a programming model are related but not the same thing — OkHttp, for instance, can be used both synchronously and asynchronously depending on how it is called.</p>
  </div>;
}

export function OkHttpExercise(){
  const [a1,setA1]=useState('');
  const [a2,setA2]=useState('');
  return <div className="card space-y-4">
    <p className="font-semibold">Order Service calls Payment Service using the OkHttp code above. What role does Order Service play in that call?</p>
    <div>{['HTTP Server','HTTP Client','Database','Proxy'].map(o=><button key={o} className="m-1 rounded-lg border px-3 py-2 hover:bg-blue-50" onClick={()=>setA1(o)}>{o}</button>)}</div>
    {a1&&<p className={a1==='HTTP Client'?'text-green-700':'text-red-700'}>{a1==='HTTP Client'?'Correct: Order Service initiates the call, so it is the HTTP client.':'Not quite — Order Service is the one making the outgoing call.'}</p>}
    <p className="font-semibold">What does calling client.newCall(request).execute() do?</p>
    <div>{['Sends the request asynchronously and returns immediately','Sends the request and blocks the calling thread until the response arrives','Only builds the request without sending it','Subscribes to a Flux of responses'].map(o=><button key={o} className="m-1 rounded-lg border px-3 py-2 hover:bg-blue-50" onClick={()=>setA2(o)}>{o}</button>)}</div>
    {a2&&<p className={a2.startsWith('Sends the request and blocks')?'text-green-700':'text-red-700'}>{a2.startsWith('Sends the request and blocks')?'Correct: execute() is synchronous and blocks the calling thread.':'Not quite — execute() is synchronous/blocking in this example.'}</p>}
  </div>;
}

export function WebClientCompare(){
  return <div className="card space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-4 shadow">
        <p className="mb-2 font-semibold">OkHttp execute()</p>
        <FlowDiagram nodes={['OkHttp execute()','wait for response']}/>
      </div>
      <div className="rounded-xl bg-white p-4 shadow">
        <p className="mb-2 font-semibold">WebClient</p>
        <FlowDiagram nodes={['WebClient','reactive pipeline','response asynchronously continues pipeline']}/>
      </div>
    </div>
    <p className="rounded-lg bg-blue-50 p-3">Using WebClient does not automatically make the whole application reactive — if surrounding code calls .block() or runs inside a blocking controller, the non-blocking benefit is lost.</p>
  </div>;
}

export function MonoFluxToggle(){
  const [mode,setMode]=useState<'mono'|'flux'>('mono');
  return <div className="card space-y-4">
    <div className="flex gap-2">
      <button className={`rounded-lg border px-4 py-2 ${mode==='mono'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('mono')}>Mono</button>
      <button className={`rounded-lg border px-4 py-2 ${mode==='flux'?'bg-blue-600 text-white':''}`} onClick={()=>setMode('flux')}>Flux</button>
    </div>
    {mode==='mono'
      ?<FlowDiagram nodes={getMonoFluxNodes('mono')}/>
      :<div className="my-4 flex flex-col gap-1"><span className="rounded-xl bg-white p-3 shadow">Request</span><b className="ml-4">↓</b>{getMonoFluxNodes('flux').slice(1).map(x=><span className="ml-4 rounded-xl bg-white p-3 shadow" key={x}>{x}</span>)}</div>}
    <p className="rounded-lg bg-blue-50 p-3">{mode==='mono'?'Mono<Payment> represents 0 or 1 result.':'Flux<Payment> represents 0..N results.'}</p>
    <CodeBlock code={mode==='mono'
      ?'Mono<Payment> payment = paymentClient.getPayment(id)\n    .map(p -> p.withStatus("CONFIRMED"))\n    .filter(p -> p.isValid());'
      :'Flux<Payment> payments = paymentClient.getPayments(customerId)\n    .filter(p -> p.isValid())\n    .flatMap(p -> enrich(p));'}/>
    <p className="text-sm text-slate-600">Publisher: emits data. Subscriber: receives it once subscribed. map transforms each item, flatMap maps to another Publisher and flattens it, filter keeps only matching items.</p>
  </div>;
}

export function MvcWebfluxCompare(){
  return <div className="card space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-4 shadow">
        <p className="mb-2 font-bold">Spring MVC</p>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>Servlet stack</li><li>Tomcat commonly</li><li>Blocking APIs commonly used</li><li>HttpServletRequest</li><li>Traditional thread-per-request model</li>
        </ul>
        <CodeBlock code={'@GetMapping("/payments/{id}")\npublic Payment getPayment(@PathVariable String id) {\n    return paymentService.getPayment(id);\n}'}/>
      </div>
      <div className="rounded-xl bg-white p-4 shadow">
        <p className="mb-2 font-bold">Spring WebFlux</p>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>Reactive stack</li><li>Netty commonly</li><li>Non-blocking APIs</li><li>Mono / Flux</li><li>Event-loop model</li>
        </ul>
        <CodeBlock code={'@GetMapping("/payments/{id}")\npublic Mono<Payment> getPayment(@PathVariable String id) {\n    return paymentService.getPayment(id);\n}'}/>
      </div>
    </div>
    <p className="rounded-lg bg-blue-50 p-3">The method signature changes from returning Payment to returning Mono&lt;Payment&gt;: instead of the thread blocking until the payment is found, the controller returns immediately with a publisher that will emit the payment once it is available.</p>
  </div>;
}

export function RequestFlowExplorer(){
  const [model,setModel]=useState<AppModel>('servlet');
  const [direction,setDirection]=useState<Direction>('incoming');
  const [selected,setSelected]=useState<string|null>(null);
  const nodes=getRequestFlowNodes(model,direction);
  const info=selected?requestFlowNodeInfo[selected]:null;
  return <div className="card space-y-4">
    <div>
      <p className="font-semibold">Application Model:</p>
      <div className="flex flex-wrap gap-2">
        <button className={`rounded-lg border px-4 py-2 ${model==='servlet'?'bg-blue-600 text-white':''}`} onClick={()=>{setModel('servlet');setSelected(null)}}>Servlet / Spring MVC</button>
        <button className={`rounded-lg border px-4 py-2 ${model==='reactive'?'bg-blue-600 text-white':''}`} onClick={()=>{setModel('reactive');setSelected(null)}}>Reactive / Spring WebFlux</button>
      </div>
    </div>
    <div>
      <p className="font-semibold">HTTP Communication:</p>
      <div className="flex flex-wrap gap-2">
        <button className={`rounded-lg border px-4 py-2 ${direction==='incoming'?'bg-blue-600 text-white':''}`} onClick={()=>{setDirection('incoming');setSelected(null)}}>Incoming</button>
        <button className={`rounded-lg border px-4 py-2 ${direction==='outgoing'?'bg-blue-600 text-white':''}`} onClick={()=>{setDirection('outgoing');setSelected(null)}}>Outgoing</button>
      </div>
    </div>
    <div className="my-4 flex flex-wrap items-center gap-2">
      {nodes.map((n,i)=><span key={n+i} className="contents">
        <button className={flowBox(selected===n)} onClick={()=>setSelected(n)}>{n}</button>
        {i<nodes.length-1&&<b>↓</b>}
      </span>)}
    </div>
    {info?<div className="space-y-2 rounded-xl bg-blue-50 p-4">
      <p><b>{selected}</b></p>
      <p><b>What: </b>{info.what}</p>
      <p><b>Role: </b>{info.role}</p>
      <p><b>Example: </b>{info.example}</p>
      <p><b>Direction: </b>{direction==='incoming'?'Incoming':'Outgoing'}</p>
      <p><b>Blocking/non-blocking: </b>{info.blocking}</p>
    </div>:<p className="text-slate-600">Click any node above to see what it is, its role, an example, and its blocking/non-blocking relevance.</p>}
  </div>;
}

export function DebuggingChallenges(){
  const [selections,setSelections]=useState<Record<string,string[]>>({});
  const [revealed,setRevealed]=useState<Record<string,boolean>>({});
  const toggle=(id:string,area:string)=>setSelections(s=>{const cur=s[id]||[];return {...s,[id]:cur.includes(area)?cur.filter(a=>a!==area):[...cur,area]}});
  return <div className="space-y-6">
    {debugScenarios.map(s=><div className="card space-y-3" key={s.id}>
      <h3 className="text-xl font-bold">{s.title}</h3>
      <FlowDiagram nodes={s.flow}/>
      <p className="rounded-lg bg-red-50 p-3 font-mono text-red-700">Response: {s.response}</p>
      <p className="font-semibold">{s.question}</p>
      <div className="flex flex-wrap gap-2">
        {s.areas.map(a=><button key={a} className={`rounded-lg border px-3 py-2 text-sm ${(selections[s.id]||[]).includes(a)?'bg-yellow-100 border-yellow-500':''}`} onClick={()=>toggle(s.id,a)}>{a}</button>)}
      </div>
      <button className="rounded bg-blue-600 px-4 py-2 text-white" onClick={()=>setRevealed(r=>({...r,[s.id]:true}))}>Reveal Investigation Path</button>
      {revealed[s.id]&&<div className="rounded-xl bg-green-50 p-4">
        <p className="font-semibold">Suggested investigation order:</p>
        <ol className="list-inside list-decimal">{s.recommended.map(r=><li key={r}>{r}</li>)}</ol>
        <p className="mt-2">{s.explanation}</p>
      </div>}
    </div>)}
  </div>;
}
