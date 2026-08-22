export type AppModel='servlet'|'reactive';
export type Direction='incoming'|'outgoing';
export type Perspective='customer'|'order'|'payment';

export function getServletReactiveNodes(mode:AppModel):string[]{
  return mode==='servlet'
    ?['Client','Tomcat','Servlet','DispatcherServlet','Controller','Service']
    :['Client','Netty','WebFlux','Handler','Controller','Reactive Service'];
}

export function getTomcatNettyNodes(mode:'tomcat'|'netty'):string[]{
  return mode==='tomcat'
    ?['HTTP Request','Tomcat','Servlet','Spring MVC']
    :['HTTP Request','Netty','WebFlux','Reactive pipeline'];
}

export function getRequestFlowNodes(model:AppModel,direction:Direction):string[]{
  if(direction==='outgoing')return ['Order Service','HTTP Client','Payment Service'];
  return model==='servlet'
    ?['Client','HTTP Request','Tomcat','Servlet','DispatcherServlet','Handler','Controller','Service']
    :['Client','HTTP Request','Netty','WebFlux','Handler','Controller','Reactive Service'];
}

export function getPerspectiveInfo(p:Perspective):{role:string;lines:string[]}{
  const info:Record<Perspective,{role:string;lines:string[]}>={
    customer:{role:'Client (for the call to Order Service)',lines:['Customer → Order Service is an outgoing request from the Customer’s point of view.','The Customer does not participate in the Order Service → Payment Service call at all.']},
    order:{role:'Server for Customer, Client for Payment Service',lines:['Customer → Order Service: incoming request. Order Service is the HTTP server.','Order Service → Payment Service: outgoing request. Order Service is the HTTP client.']},
    payment:{role:'Server (for the call from Order Service)',lines:['Order Service → Payment Service is an incoming request from Payment Service’s point of view.','Payment Service is the HTTP server for that call and is unaware of the original Customer.']}
  };
  return info[p];
}

export type BlockingMode='blocking'|'nonblocking';
export function simulateThreadUsage(mode:BlockingMode,concurrent:number,maxThreads=20,eventLoopThreads=4):{busy:number;queued:number}{
  if(mode==='blocking'){
    const busy=Math.min(concurrent,maxThreads);
    return {busy,queued:Math.max(0,concurrent-maxThreads)};
  }
  return {busy:Math.min(concurrent,eventLoopThreads),queued:0};
}

export type ReactorType='mono'|'flux';
export function getMonoFluxNodes(mode:ReactorType):string[]{
  return mode==='mono'?['Request','Payment']:['Request','Payment 1','Payment 2','Payment 3','...'];
}

export const requestFlowNodeInfo:Record<string,{what:string;role:string;example:string;blocking:string}>={
  'Client':{what:'The party that starts the communication.',role:'Sends the request and waits for a response.',example:'A Customer’s browser or app calling Order Service.',blocking:'Not applicable — this is the caller, not a processing thread.'},
  'HTTP Request':{what:'The protocol-level message sent over the network.',role:'Carries method, URL, headers and optional body.',example:'POST /orders',blocking:'Neither — it is data, not code.'},
  'Tomcat':{what:'A Servlet container.',role:'Accepts the connection and hands it to a Servlet.',example:'Runs Order Service’s Spring MVC application.',blocking:'Traditionally used with a thread-per-request, blocking-oriented model.'},
  'Netty':{what:'A general-purpose asynchronous networking framework.',role:'Accepts the connection and feeds requests into WebFlux.',example:'Runs Order Service’s Spring WebFlux application.',blocking:'Traditionally used with an event-loop, non-blocking-oriented model.'},
  'Servlet':{what:'A Java component that handles web requests.',role:'The Servlet-model entry point invoked by Tomcat.',example:'DispatcherServlet itself is a Servlet.',blocking:'Runs within the thread-per-request model.'},
  'WebFlux':{what:'Spring’s reactive web framework.',role:'Routes the request to a Handler using functional or annotated routing.',example:'Backs a @RestController returning Mono/Flux.',blocking:'Designed for non-blocking request processing.'},
  'DispatcherServlet':{what:'Spring MVC’s front controller.',role:'Dispatches the request to the matching Controller via HandlerMapping.',example:'Routes GET /orders/{id} to OrderController.getOrder.',blocking:'Runs on a Servlet thread in the thread-per-request model.'},
  'Handler':{what:'The selected piece of code that will process the request.',role:'Bridges the framework and the Controller.',example:'A HandlerMapping resolves the Handler for the request path.',blocking:'Blocking or non-blocking depending on the underlying stack.'},
  'Controller':{what:'The HTTP-facing application method.',role:'Coordinates the request and delegates business logic to a Service.',example:'@PostMapping("/orders") createOrder(...)',blocking:'Blocking in Spring MVC; can return Mono/Flux in WebFlux.'},
  'Service':{what:'The business logic layer.',role:'Implements the actual order-processing behavior.',example:'OrderService.createOrder(...)',blocking:'Typically synchronous/blocking in Spring MVC.'},
  'Reactive Service':{what:'A business logic layer built with reactive types.',role:'Implements order-processing behavior using Mono/Flux pipelines.',example:'OrderService.createOrder(...) returning Mono<Order>',blocking:'Non-blocking by design, as long as everything it calls is also non-blocking.'},
  'Order Service':{what:'The application in this example.',role:'Server for Customer requests; client for Payment Service requests.',example:'Receives POST /orders; calls Payment Service to charge the order.',blocking:'Depends on whether it calls Payment Service using a blocking or non-blocking HTTP client.'},
  'HTTP Client':{what:'A library used to make outgoing HTTP requests.',role:'Builds, sends, and reads the response for an outgoing call.',example:'OkHttp, RestTemplate, WebClient, or Feign.',blocking:'Some clients block the calling thread (RestTemplate, OkHttp execute()); others are non-blocking (WebClient).'},
  'Payment Service':{what:'The downstream application in this example.',role:'Server for the call coming from Order Service.',example:'Receives POST /payments from Order Service.',blocking:'Its own internal blocking/non-blocking design is independent of how Order Service calls it.'}
};
