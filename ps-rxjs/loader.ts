import { Observable } from 'rxjs';

export function load(url: string) {
    return Observable.create(observer => {
        let xhr = new XMLHttpRequest();

        let onload = () => {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                observer.next(data);
                observer.complete();

                // for this demo, assume http status other than 200 is an error
            } else {
                observer.error(xhr.statusText);
            }
        };

        xhr.addEventListener('load', onload);

        xhr.open('GET', url);
        xhr.send();

        // this code will execute when observer calls unsubscribe method, or when an error occurs
        return () => {
            console.log('cleanup');
            xhr.removeEventListener('load', onload);
            xhr.abort(); // if there is a request out to the server, this will cancel that request.
        }

    })//.retry(3); // retry 3 more times if error.
        .retryWhen(retryStrategy({
            attempts: 3,
            delay: 1500
        }));
};

// loadWithFetch without defer is not as lazy as load - code executes even though nothing subscribes yet.
export function loadWithFetch(url: string) {
    return Observable.defer(() => { // like a factory, defer only create the Observable.fromPromise when we have a subscribed observer

        return Observable.fromPromise(
            // use Promise API to deserialise the response or handle error
            fetch(url).then(res => {
                if (res.status === 200) {
                    return res.json();

                } else {
                    return Promise.reject(res);
                }
            })
        );
    }).retryWhen(retryStrategy()); // retryWhen has try catch, so when you throw error in the callback, it will call obs.error
}

// Takes an error Observable and returns an error Observable
function retryStrategy({ attempts = 4, delay = 1000 } = {}) {
    return function (errors) {

        return errors
            .scan((acc, value) => {
                acc += 1;
                if (acc < attempts) {
                    return acc;
                } else {
                    throw new Error(value);
                }
            }, 0) // accumulator - count the errors starting at 0
            // .takeWhile(acc => acc < attempts) // mirror items emitted by an Observable until a specified condition becomes false, then completes (which is a problem as we want to propagate the error)
            .delay(delay);
    }
}
