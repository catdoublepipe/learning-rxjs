function map(transformFunction) {

  const inputObservable = this;
  const outputObservable = createObservable(function subscribe(outputObserver) {
    inputObservable.subscribe({
      next: function (x) {
        const y = transformFunction(x);
        outputObserver.next(y);
      },
      error: err => outputObserver.error(err),
      complete: () => outputObserver.complete()
    });
  });

  return outputObservable;
}

function filter(conditionFunction) {

  const inputObservable = this;
  const outputObservable = createObservable(function subscribe(outputObserver) {
    inputObservable.subscribe({
      next: function (x) {
        if (conditionFunction(x)) {
          outputObserver.next(x);
        }
      },
      error: err => outputObserver.error(err),
      complete: () => outputObserver.complete()
    });
  });

  return outputObservable;
}

function delay(period) {

  const inputObservable = this;
  const outputObservable = createObservable(function subscribe(outputObserver) {
    inputObservable.subscribe({
      next: function (x) {
        setTimeout(() => outputObserver.next(x), period);
      },
      error: err => outputObserver.error(err),
      complete: () => outputObserver.complete()
    });
  });

  return outputObservable;
}

function createObservable(subscribe) {
  return {
    subscribe: subscribe,
    map: map,
    filter: filter,
    delay: delay
  };
}

const arrayObservable = createObservable(function subscribe(ob) {
  [10, 20, 30].forEach(ob.next);
  ob.complete();
});

const clickObservable = createObservable(function subscribe(ob) {
  document.addEventListener('click', ob.next);
});

const observer = {
  next: function nextCallback(data) {
    console.log(data);
  },

  error: function errorCallback(err) {
    console.error(err);
  },

  complete: function completeCallback() {
    console.log('done');
  }
};

arrayObservable
  .map(x => x / 10)
  .filter(x => x !== 2)
  .subscribe(observer);

clickObservable
  .map(event => event.clientX)
  .filter(x => x < 200)
  .delay(2000)
  .subscribe(observer);
