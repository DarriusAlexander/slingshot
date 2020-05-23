import React from 'react';
import { Link } from 'react-router-dom';
import { Meeting } from '../../store/meetings/actions';
import { Card, CardContent, CardHeader, IconButton, Typography, CardActions, Button, Container, CircularProgress, CardMedia } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import ShareIcon from "@material-ui/icons/Share";
import SharePopup from "../SharePopup"
import EtherService from '../../services/EtherService';
import { User } from '../../store/users/actions';
import { Loading } from '../../store/loading/actions';

const CustButton = styled(Button)({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 38,
  padding: '0 30px',
});

const DisplayCard = styled(Card)({
  maxWidth: 280,
  minHeight: 360,
  maxHeight: 400,
})

const CardImage = styled(CardMedia)({
  paddingTop: '56.25%',
})

const Stake = styled(Typography)({
  fontSize: 12,
  fontStyle: 'italic',
  color: '#555555',
  position: 'relative',
  left: 10,
})

export interface IProps {
  meeting: Meeting;
  user: User;
  loading: Loading;
  cachedMeeting: Meeting;
  dispatchUpdateRSVP(meetingAddress: String, userAddress: String): Array<User>;
  dispatchUpdateRsvpConfirmationLoading(status: Boolean): void;
  dispatchAddErrorNotification(message: String): void;
}

export class MeetingPreview extends React.Component<IProps> {
  etherService: EtherService;

  constructor(props: any) {
    super(props);

    this.etherService = EtherService.getInstance();
  }

  handleRSVP = (event: any) => {
    this.etherService.rsvp(
      this.props.meeting._id,
      this.props.meeting.data.stake,
      confirmation => this.props.dispatchUpdateRsvpConfirmationLoading(false)
    )
      .then((res: any) => {
        this.props.dispatchUpdateRSVP(this.props.meeting._id, this.props.user._id);
      }, (reason: any) => {
        this.props.dispatchAddErrorNotification('handleRSVP: ' + reason);
      })
      .catch((err: any) => {
        this.props.dispatchAddErrorNotification('handleRSVP: ' + err);
      });
  }

  render() {
    const url = '/meeting/' + this.props.meeting._id;
    const title = this.props.meeting.data.name
    const split = (new Date(this.props.meeting.data.startDateTime * 1000)).toString().split(":")
    const date = split[0] + " [" + split[1] + ":" + split[2].split(/\s/)[0] + "]"
    const stake = 'Stake Required: ' + this.props.meeting.data.stake + ' ETH';

    return (
      <DisplayCard raised={true} className="meeting-preview">
        <CardHeader
          action={
            <SharePopup />
          }
          title={title}
          titleTypographyProps={{ variant: 'h6' }}
          subheader={date}
          subheaderTypographyProps={{ variant: 'caption' }}
        />
        <Link style={{ textDecoration: 'none' }} to={url}>
          <CardImage
            image="https://siasky.net/nAGUnU56g96yjdeMpjHnh37LXnIDGWw2pCyb4--wGdy1FQ"
            title={this.props.meeting.data.name}
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              Max participants: {this.props.meeting.data.maxParticipants}
            </Typography>
          </CardContent>
        </Link>
        <CardActions disableSpacing>
          {this.props.cachedMeeting._id === this.props.meeting._id
            ?
            this.props.loading.rsvpConfirmation ? <CircularProgress /> :
              (<CustButton size="small" onClick={this.handleRSVP}
                disabled={this.props.user.rsvp.includes(this.props.meeting._id)}
                style={this.props.user.rsvp.includes(this.props.meeting._id) ? { background: 'linear-gradient(45deg, #ff9eb4 30%, #ffb994 90%)' } :
                  { background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}>
                {this.props.user.rsvp.includes(this.props.meeting._id) ? "RSVP'd" : "RSVP"}
              </CustButton>)

            : (
              <CustButton size="small" onClick={this.handleRSVP}
                disabled={this.props.user.rsvp.includes(this.props.meeting._id)}
                style={this.props.user.rsvp.includes(this.props.meeting._id) ? { background: 'linear-gradient(45deg, #ff9eb4 30%, #ffb994 90%)' } :
                  { background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' }}>
                {this.props.user.rsvp.includes(this.props.meeting._id) ? "RSVP'd" : "RSVP"}
              </CustButton>
            )
          }

          < Stake >
            {stake}
          </Stake>
        </CardActions>
      </DisplayCard >

    );
  }
}