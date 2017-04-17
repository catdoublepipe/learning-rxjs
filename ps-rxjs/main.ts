import { Observable } from 'rxjs';
import { load, loadWithFetch } from './loader';

// *****************
// Chapter 1 - Array
// *****************

let numbers = [1, 5, 10];
let source = Observable.create(observer => {

  let index = 0;
  let produceValue = () => {
    observer.next(numbers[index++]);

    if (index < numbers.length) {
      setTimeout(produceValue, 500);
    } else {
      observer.complete();
    }
  }

  produceValue();
}).map(x => x * 2)
  .filter(x => x > 4);

source.subscribe(
  value => console.log(`value: ${value}`),
  err => console.error(`error: ${err}`),
  () => console.log('done')
);

// ************************
// Chapter 2 - Mouse events
// ************************

let circle = document.getElementById('circle');

let mouseEventSource = Observable.fromEvent(document, 'mousemove')
  .map((e: MouseEvent) => {
    return {
      x: e.clientX,
      y: e.clientY
    }
  })
  .filter(value => value.x < 500)
  .delay(300);

function onNext(value) {
  circle.style.left = value.x + 'px';
  circle.style.top = value.y + 'px';
}

mouseEventSource.subscribe(
  onNext,
  err => console.error(`error: ${err}`),
  () => console.log('complete')
);

// *************************************
// Chapter 3 - XmlHttpRequest using RxJs
// *************************************

let button = document.getElementById('button');
let output = document.getElementById('output');

let clickSource = Observable.fromEvent(button, 'click');

function renderMovies(movies) {
  movies.forEach(m => {
    let div = document.createElement("div");
    div.innerHTML = m.title;
    output.appendChild(div);
  });
}

// one benefit of rxjs: we can use load but nothing will happen until we subscribe.
// load('movies.json').subscribe(renderMovies);

// load method returns an observable inside clickSource observable. flatMap will return the inner observable for us to subscribe.
clickSource.flatMap(click => load('movies.json')).subscribe(
  renderMovies,
  err => console.error(`error: ${err}`),
  () => console.log('complete')
);

// ********************
// Chapter 4 - Promises
// ********************

// typings uninstall es6-shim --save --global
// typings install dt~whatwg-streams --save --global
// typings install dt~whatwg-fetch --save --global
// change tsconfig.json compilerOptions.target from es5 to es6.

let fetchButton = document.getElementById('fetch-button');
let fetchClickSource = Observable.fromEvent(button, 'click');

fetchClickSource.flatMap(click => loadWithFetch('movies.json')).subscribe(
  renderMovies,
  err => console.error(`error: ${err}`),
  () => console.log('complete')
);

// **************************
// Chapter 5 - Error handling
// **************************

let lowLevelErrorSource = Observable.create(obs => {
  obs.next(1);
  obs.next(2);
  obs.error('stop');
  // throw new Error('stop!') // this will not get caught by the observer's error callback so is different to obs.error
  obs.next(3);
  obs.complete();
});

lowLevelErrorSource.subscribe(
  value => console.log(`value: ${value}`),
  err => console.log(`error: ${err}`),
  () => console.log('complete')
);

let higherLevelErrorSource = Observable.merge( // using .onErrorResumeNext will continue as if error never occurred.
  Observable.of(1),
  Observable.from([2, 3, 4]),
  Observable.throw(new Error('stop!')), // handled error - different from just throwing new Error.
  Observable.of(5) // this is never reached unless we use .onErrorResumeNext or .catch

).catch(err => {
  console.log(`caught error: ${err}`);
  return Observable.of(10);
});

higherLevelErrorSource.subscribe(
  value => console.log(`value: ${value}`),
  err => console.log(`error: ${err}`),
  () => console.log('complete')
);

loadWithFetch('movies.json').subscribe(
  renderMovies,
  e => console.log(`error: ${e}`),
  () => console.log('complete')
);

// ***********************
// Chapter 6 - Unsubscribe
// ***********************

let subscriptionToLoad = load('movies.json').subscribe();

console.log(subscriptionToLoad);
subscriptionToLoad.unsubscribe();