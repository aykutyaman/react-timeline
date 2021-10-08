import { constant } from 'fp-ts/lib/function';
import React, { useEffect, useState } from 'react';

import './App.css';
import { addRandomEvent, Queue, Event } from './domain'
import svg from "./logo.svg"

const EventItem = ({ event, index }: { event: Event, index: number }): JSX.Element => {
  const animation = (index === 0) ?  "enqueue" : "";
  const direction = event.order % 2 === 0 ? "left" : "right";

  return (
    <div className={`item roll-out ${animation} ${direction}`}>
      <img src={svg} alt="" />
      <div className="time">{event.time.toLocaleTimeString('en-GB', {
        hour12: false, hour: "numeric", minute: "numeric"
      })}</div>
      <div className="content">
        <div className="title">{event.title}</div>
        <div className="description">{event.description}</div>
      </div>
    </div>
  )
}

const App = () => {
  const [events, setEvents] = useState<Queue<Event>>([]);

  useEffect(() => {
    const interval = setInterval(() => addRandomEvent(setEvents), 5000);
    return () => clearInterval(interval);
  }, [])

  return (
    <div className="App">
      {events.map((event, index) =>
        <EventItem key={Math.random()} index={index} event={event} />
      )}
    </div>
  );
}

export default App;
