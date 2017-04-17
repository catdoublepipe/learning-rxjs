import { Observable } from 'rxjs';

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

function load(url: string) {
  return Observable.create(observer => {
    let xhr = new XMLHttpRequest();

    xhr.addEventListener('load', () => {

      if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText);
        observer.next(data);
        observer.complete();

        // for this demo, assume http status other than 200 is an error
      } else {
        observer.error(xhr.statusText);
      }

    });

    xhr.open('GET', url);
    xhr.send();

  })//.retry(3); // retry 3 more times if error.
    .retryWhen(retryStrategy({
      attempts: 3,
      delay: 1500
    }));
};

// Takes an error Observable and returns an error Observable
function retryStrategy({ attempts = 4, delay = 1000 }) {
  return function (errors) {

    return errors
      .scan((acc, value) => {
        console.log(acc, value);
        return acc + 1;
      }, 0) // accumulator - count the errors starting at 0
      .takeWhile(acc => acc < attempts) // mirror items emitted by an Observable until a specified condition becomes false
      .delay(delay);
  }
}

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


// loadWithFetch without defer is not as lazy as load - code executes even though nothing subscribes yet.
function loadWithFetch(url: string) {
  return Observable.defer(() => { // like a factory, defer only create the Observable.fromPromise when we have a subscribed observer

    return Observable.fromPromise(
      fetch(url).then(res => res.json()) // use Promise API to deserialise the response.
    );
  });
}

fetchClickSource.flatMap(click => loadWithFetch('movies.json')).subscribe(
  renderMovies,
  err => console.error(`error: ${err}`),
  () => console.log('complete')
);
