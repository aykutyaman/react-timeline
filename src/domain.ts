import * as A from "fp-ts/Array";
import casual from "casual-browserify";
import { Dispatch, SetStateAction } from "react";
import { pipe } from "fp-ts/lib/function";
import * as IO from "fp-ts/IO";
import * as O from "fp-ts/Option";
import { fromMilliseconds, getTime, mkMilliseconds, unMilliseconds } from "fp-ts-std/Date";
import { randomRange } from "fp-ts/lib/Random";

export const MAX_EVENT_LENGTH = 6;

export type Event = {
  time: Date,
  title: string,
  description: string,
  order: number
}

export const createEvent = (time: Date, title: string, description: string, order: number): Event => ({
  time, title, description, order
})

export const createRandomEvent = (lastEvent: O.Option<Event>): IO.IO<Event> => pipe(
  IO.Do,
  IO.bind("currentTime", () => pipe(
    lastEvent,
    O.map(event => event.time),
    O.fold(() => IO.of(new Date("1995-12-17T03:24:00")), IO.of),
  )),
  IO.bind("order", () => pipe(
    lastEvent,
    O.fold(() => IO.of(0), event => IO.of(event.order + 1))
  )),
  IO.bind("toAdd", () => randomRange(180000, 18000000)),
  IO.bind("time", ({ toAdd, currentTime }) =>
    IO.of(fromMilliseconds(mkMilliseconds(unMilliseconds(getTime(currentTime)) + toAdd)))),
  IO.map(({ time, order }) => ({
    time,
    title: casual.title,
    description: casual.short_description,
    order
  })),
)

export type Queue<A> = A[];

export const enqueue = <A>(a: A) => (q: Queue<A>): Queue<A> => [a, ...q];

export const dequeue = <A>(q: Queue<A>): Queue<A> => q.splice(0, q.length - 1);

export const empty = <A>(): Queue<A> => [];

export const fromArray = <A>(xs: A[]): Queue<A> => pipe(
  xs,
  A.reduceRight(empty(), (x, acc) => enqueue(x)(acc)),
)

export const addRandomEvent = (setState: Dispatch<SetStateAction<Queue<Event>>>): void => (
  setState(prevState => pipe(
    createRandomEvent(O.fromNullable(prevState[0])),
    IO.map(event => enqueue(event)(prevState)),
    IO.map(q => q.length >= MAX_EVENT_LENGTH ? dequeue(q) : q),
    dispatch => dispatch(),
  ))
)
