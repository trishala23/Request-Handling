export type Question={id:string;type:'mc'|'tf'|'match';prompt:string;options?:string[];answer:string|string[];explanation:string;pairs?:[string,string][]};
export const questions:Question[]=[
{id:'q1',type:'mc',prompt:'ServiceA calls Serviceb. What is ServiceA for that call?',options:['Server','Client','Database','Proxy'],answer:'Client',explanation:'The caller starts the request, so ServiceA is the client.'},
{id:'q2',type:'tf',prompt:'Client/server roles are always fixed forever.',options:['True','False'],answer:'False',explanation:'Roles are per request.'},
{id:'q3',type:'mc',prompt:'Which HTTP method usually reads a resource?',options:['GET','POST','PATCH','DELETE'],answer:'GET',explanation:'GET requests retrieve representations.'},
{id:'q4',type:'mc',prompt:'In /vehicles/WDD123?region=EMEA, region is a:',options:['Header','Query parameter','Path parameter','Body'],answer:'Query parameter',explanation:'It appears after the question mark.'},
{id:'q5',type:'mc',prompt:'In /vehicles/{vin}, vin is a:',options:['Header','Query parameter','Path variable','Status code'],answer:'Path variable',explanation:'It is embedded in the path template.'},
{id:'q6',type:'mc',prompt:'Which part carries metadata like Authorization?',options:['Headers','Status line','Path','Repository'],answer:'Headers',explanation:'Authorization is an HTTP header.'},
{id:'q7',type:'mc',prompt:'Which status means created?',options:['200','201','204','409'],answer:'201',explanation:'201 Created indicates a resource was created.'},
{id:'q8',type:'mc',prompt:'Requested VIN not found. Choose status.',options:['400','404','500','202'],answer:'404',explanation:'404 Not Found is appropriate.'},
{id:'q9',type:'mc',prompt:'Authentication missing or invalid.',options:['401','403','409','429'],answer:'401',explanation:'401 Unauthorized means authentication is required/failed.'},
{id:'q10',type:'mc',prompt:'Authenticated user lacks permission.',options:['401','403','404','500'],answer:'403',explanation:'403 Forbidden means access is not allowed.'},
{id:'q11',type:'mc',prompt:'Too many requests.',options:['409','429','503','504'],answer:'429',explanation:'429 is rate limiting.'},
{id:'q12',type:'mc',prompt:'What runs Servlets?',options:['Servlet Container','Repository','Browser cache','Database'],answer:'Servlet Container',explanation:'Tomcat is a Servlet Container.'},
{id:'q13',type:'mc',prompt:'Tomcat is commonly a:',options:['Servlet Container','ORM','Message broker','Cloud API'],answer:'Servlet Container',explanation:'Tomcat hosts Servlet-based apps.'},
{id:'q14',type:'mc',prompt:'HttpServletRequest is:',options:['Java object representing the request','The browser','The database row','A real network call'],answer:'Java object representing the request',explanation:'It models the incoming request in Java.'},
{id:'q15',type:'mc',prompt:'Spring MVC front controller:',options:['DispatcherServlet','Repository','Service','Entity'],answer:'DispatcherServlet',explanation:'DispatcherServlet centrally dispatches requests.'},
{id:'q16',type:'mc',prompt:'Which component finds the handler?',options:['HandlerMapping','Service','Repository','JVM'],answer:'HandlerMapping',explanation:'HandlerMapping maps requests to handlers.'},
{id:'q17',type:'mc',prompt:'Business logic usually belongs in:',options:['Service','Controller annotation','Query string','CSS'],answer:'Service',explanation:'Controllers delegate business behavior to services.'},
{id:'q18',type:'match',prompt:'Match Spring annotations to request parts.',answer:['@PathVariable → /vehicles/{vin}','@RequestParam → ?region=EMEA','@RequestBody → JSON body'],pairs:[['@PathVariable','/vehicles/{vin}'],['@RequestParam','?region=EMEA'],['@RequestBody','JSON body']],explanation:'Each annotation binds a different part of the HTTP request.'},
{id:'q19',type:'tf',prompt:'The request builder in this app should make real HTTP calls.',options:['True','False'],answer:'False',explanation:'Phase 1 is static and makes no network calls.'},
{id:'q20',type:'mc',prompt:'Which flow is correct?',options:['Client → Tomcat → DispatcherServlet → Controller → Service','Database → CSS → Browser','Controller → Client → Tomcat','Repository → Header → Method'],answer:'Client → Tomcat → DispatcherServlet → Controller → Service',explanation:'This is the normal inbound Spring MVC flow.'}
];
