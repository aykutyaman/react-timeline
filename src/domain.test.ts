import { deepStrictEqual } from "assert";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { createEvent, createRandomEvent, enqueue, dequeue, addRandomEvent, fromArray } from "./domain"


describe("domain", () => {
  test("createEvent", () => {
    const time = new Date();
    const title = "t0";
    const description = "d0";
    const order = 0;
    deepStrictEqual(createEvent(time, title, description, order), { time, title, description, order })
  })

  test("createRandomEvent without any previous event", () => {
    deepStrictEqual(Object.keys(createRandomEvent(O.none)()), ["time", "title", "description", "order"]);
  })

  test("createRandomEvent with previous events", () => {
    const event = createEvent(new Date(), "e1", "desc1", 0);
    deepStrictEqual(Object.keys(createRandomEvent(O.some(event))()), ["time", "title", "description", "order"]);
  })

  test("enqueue - empty", () => {
    const time = new Date();
    const title = "t0";
    const description = "d0";
    const order = 0;
    const e0 = createEvent(time, title, description, order);

    deepStrictEqual(enqueue(e0)([]), [e0])
  })

  test("enqueue - with items", () => {
    const time = new Date();
    const title = "t0";
    const description = "d0";
    const order = 0;
    const e0 = createEvent(time, title, description, order);

    const e1 = createEvent(new Date(), "t1", "d1", 1);

    deepStrictEqual(enqueue(e1)([e0]), [e1, e0]);
  })

  test("dequeue - empty", () => {
    deepStrictEqual(dequeue([]), [])
  })

  test("dequeue - with items", () => {
    const e0 = createEvent(new Date(), "t0", "d0", 0);
    const e1 = createEvent(new Date(), "t1", "d1", 1);

    deepStrictEqual(dequeue([e1, e0]), [e1]);
  })

  test("addEvent", () => {
    const state = fromArray([
      createEvent(new Date(), "e1", "desc1", 0),
      createEvent(new Date(), "e2", "desc2", 1),
      createEvent(new Date(), "e3", "desc3", 2),
      createEvent(new Date(), "e4", "desc4", 3),
      createEvent(new Date(), "e5", "desc5", 4),
      createEvent(new Date(), "e6", "desc6", 5),
      createEvent(new Date(), "e7", "desc4", 6),
      createEvent(new Date(), "e8", "desc5", 7),
      createEvent(new Date(), "e9", "desc6", 8),
    ]);

    const setState = jest.fn(x => x);

    addRandomEvent(setState);

    const f = setState.mock.calls[0][0];

    deepStrictEqual(f(state).length, 9);
    deepStrictEqual(f.length, 1); // setState is called with a single parameter
    deepStrictEqual(typeof f, "function"); // the parameter is a function
    deepStrictEqual(f(state)[8].title, "e8"); // the length of the queue is adjusted
  })
})
