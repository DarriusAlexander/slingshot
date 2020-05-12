import React from 'react';
import { Link } from 'react-router-dom';
import { EventPreview } from './../containers/EventPreview';
import { Event } from '../store/events/actions';
import { Grid } from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Card, CardContent, CardActions } from '@material-ui/core';

interface IProps {
  events: Array<Event>;
  isEnded: boolean;
}

export class EventList extends React.Component<IProps> {
  render() {
    const { events, isEnded } = this.props;

    return (
      <Grid item xs={12}>
        <h1>{ isEnded ? 'Finished' : 'Active' } Events</h1>

        <Grid container alignItems="center" justify="center" spacing={6}>

          {
            !isEnded &&
              <Grid item xs={6}>
                <Link style={{ textDecoration: 'none' }} to='/events/create'>
                  <Card raised={true} className="event-preview">
                    <CardContent>
                      <CardActions>
                        <AddCircleIcon fontSize="large" color="primary" />
                        Add your event here
                      </CardActions>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
          }
          
          {
            events.length === 0 ?
              (
                <Grid container alignItems="center" justify="center" item xs={12}>
                  <div>There are currently no { isEnded ? 'Finished' : 'Active' } events.</div>
                </Grid>
              )
              :
              (
                events.map((event) => {
                  return (
                    <Grid key={event.name} item xs={6}>
                      <EventPreview key={event.name} event={event} />
                    </Grid>
                  );
                })
              )
          }
        </Grid>
      </Grid>
    );
  }
}