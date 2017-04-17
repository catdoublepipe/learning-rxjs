import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

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
