import React from 'react';
import { Event } from '../store/events/actions';

interface IProps {
  events: Array<Event>;
  dispatchAddEvent(name: string): void;
}

export class AddEvent extends React.Component<IProps> {
  handleSubmit = (event: any) => {
    event.preventDefault();

    this.props.dispatchAddEvent(
      event.target.eventName.value
    );
  }

  render() {
    console.log("AddEvent's props", this.props);

    return (
      <div className="add-event">
        <form onSubmit={this.handleSubmit} className='add-event-form'>
          <input type='text' name='eventName' placeholder='Name of the event' />
          <button>Add new Event</button>
        </form>
      </div>
    );
  }
}
